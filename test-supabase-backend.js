// Test script to check Supabase backend for SummifyIO
import { createClient } from '@supabase/supabase-js';

// Configuration
const SUPABASE_URL = 'https://voosuqmkazvjzheipbrl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvb3N1cW1rYXp2anpoZWlwYnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjAxNzcsImV4cCI6MjA2ODU5NjE3N30.AU0ew4-Un_g4nLkdGXcwSfIj6R1mwY_JDbHcSXJFe0E';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testDatabaseConnection() {
  console.log('\n🔗 Testing Database Connection...');
  
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('books')
      .select('id')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    return false;
  }
}

async function checkTableExistence() {
  console.log('\n📊 Checking Table Existence...');
  
  const expectedTables = ['books', 'chapters', 'users', 'summaries', 'chapter_ratings'];
  const results = {};
  
  for (const tableName of expectedTables) {
    try {
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        results[tableName] = { exists: false, error: error.message };
      } else {
        results[tableName] = { 
          exists: true, 
          hasData: count > 0,
          totalRows: count,
          sampleData: data?.length > 0 ? data[0] : null
        };
      }
      
      console.log(`${results[tableName].exists ? '✅' : '❌'} ${tableName}: ${results[tableName].exists ? `${count || 0} rows` : results[tableName].error}`);
      
    } catch (error) {
      results[tableName] = { exists: false, error: error.message };
      console.log(`❌ ${tableName}: ${error.message}`);
    }
  }
  
  return results;
}

async function testBooksTableStructure() {
  console.log('\n📚 Testing Books Table Structure...');
  
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .limit(3);
    
    if (error) {
      console.log('❌ Books table error:', error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ Books table exists but has no data');
      return false;
    }
    
    console.log('✅ Books table structure:');
    console.log('   Columns:', Object.keys(data[0]));
    console.log('   Sample data count:', data.length);
    console.log('   Sample book:', {
      id: data[0].id,
      title: data[0].title,
      author: data[0].author_name || data[0].author,
      hasISBN: !!data[0].isbn_13
    });
    
    return true;
    
  } catch (error) {
    console.log('❌ Books table test failed:', error.message);
    return false;
  }
}

async function testChaptersTableStructure() {
  console.log('\n📖 Testing Chapters Table Structure...');
  
  try {
    const { data, error } = await supabase
      .from('chapters')
      .select(`
        id,
        chapter_title,
        book_id,
        chapter_text,
        books!inner (title, author_name)
      `)
      .limit(3);
    
    if (error) {
      console.log('❌ Chapters table error:', error.message);
      return false;
    }
    
    if (!data || data.length === 0) {
      console.log('⚠️ Chapters table exists but has no data');
      return false;
    }
    
    console.log('✅ Chapters table structure:');
    console.log('   Sample chapters count:', data.length);
    console.log('   Sample chapter:', {
      id: data[0].id,
      title: data[0].chapter_title,
      book_id: data[0].book_id,
      book_title: data[0].books?.title,
      hasText: !!data[0].chapter_text,
      textLength: data[0].chapter_text?.length || 0
    });
    
    return true;
    
  } catch (error) {
    console.log('❌ Chapters table test failed:', error.message);
    return false;
  }
}

async function testSearchFunctionality() {
  console.log('\n🔍 Testing Search Functionality...');
  
  try {
    const searchQuery = 'leadership';
    
    const { data, error } = await supabase
      .from('chapters')
      .select(`
        id,
        chapter_title,
        chapter_text,
        book_id,
        books!inner (
          title,
          author_name,
          cover_url
        )
      `)
      .or(`chapter_title.ilike.%${searchQuery}%,chapter_text.ilike.%${searchQuery}%,books.title.ilike.%${searchQuery}%`)
      .not('chapter_text', 'is', null)
      .limit(5);

    if (error) {
      console.log('❌ Search functionality error:', error.message);
      return false;
    }

    console.log('✅ Search functionality works:');
    console.log('   Query:', searchQuery);
    console.log('   Results found:', data?.length || 0);
    
    if (data && data.length > 0) {
      console.log('   Sample result:', {
        chapter: data[0].chapter_title,
        book: data[0].books.title,
        author: data[0].books.author_name
      });
    }
    
    return data && data.length > 0;
    
  } catch (error) {
    console.log('❌ Search test failed:', error.message);
    return false;
  }
}

async function generateReport() {
  console.log('🔍 SUPABASE BACKEND ANALYSIS REPORT FOR SUMMIFYIO');
  console.log('='.repeat(60));
  
  const connectionOk = await testDatabaseConnection();
  const tableResults = await checkTableExistence();
  const booksOk = await testBooksTableStructure();
  const chaptersOk = await testChaptersTableStructure();
  const searchOk = await testSearchFunctionality();
  
  console.log('\n📋 SUMMARY');
  console.log('='.repeat(30));
  console.log(`Database Connection: ${connectionOk ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Books Table: ${booksOk ? '✅ OK' : '❌ ISSUES'}`);
  console.log(`Chapters Table: ${chaptersOk ? '✅ OK' : '❌ ISSUES'}`);
  console.log(`Search Functionality: ${searchOk ? '✅ OK' : '❌ ISSUES'}`);
  
  console.log('\n📊 TABLE STATUS');
  console.log('='.repeat(30));
  Object.entries(tableResults).forEach(([table, status]) => {
    const icon = status.exists ? (status.hasData ? '✅' : '⚠️') : '❌';
    const info = status.exists ? 
      (status.hasData ? `${status.totalRows} rows` : 'Empty') : 
      'Missing';
    console.log(`${icon} ${table}: ${info}`);
  });
  
  const issues = [];
  if (!connectionOk) issues.push('Database connection failed');
  if (!booksOk) issues.push('Books table has issues');
  if (!chaptersOk) issues.push('Chapters table has issues');
  if (!searchOk) issues.push('Search functionality not working');
  
  if (issues.length > 0) {
    console.log('\n🚨 ISSUES FOUND');
    console.log('='.repeat(30));
    issues.forEach(issue => console.log(`❌ ${issue}`));
    
    console.log('\n💡 RECOMMENDATIONS');
    console.log('='.repeat(30));
    if (!connectionOk) {
      console.log('• Check Supabase URL and API key');
      console.log('• Verify network connection');
    }
    if (!booksOk || !chaptersOk) {
      console.log('• Check if tables exist in Supabase dashboard');
      console.log('• Verify table structure matches expected schema');
      console.log('• Ensure RLS policies allow read access');
    }
    if (!searchOk) {
      console.log('• Check if chapters table has searchable text data');
      console.log('• Verify foreign key relationship between books and chapters');
    }
  } else {
    console.log('\n🎉 ALL SYSTEMS OPERATIONAL');
    console.log('Your Supabase backend is ready for SummifyIO!');
  }
  
  return {
    connectionOk,
    tableResults,
    booksOk,
    chaptersOk,
    searchOk,
    issues
  };
}

// Run the analysis
generateReport().catch(console.error);

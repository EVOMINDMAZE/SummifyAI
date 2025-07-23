// Test script for Edge Functions
// Run with: node test-edge-functions.js

const SUPABASE_URL = 'https://voosuqmkazvjzheipbrl.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvb3N1cW1rYXp2anpoZWlwYnJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjAxNzcsImV4cCI6MjA2ODU5NjE3N30.AU0ew4-Un_g4nLkdGXcwSfIj6R1mwY_JDbHcSXJFe0E';

async function testEdgeFunction(functionName, payload) {
  const url = `${SUPABASE_URL}/functions/v1/${functionName}`;
  
  try {
    console.log(`🧪 Testing ${functionName}...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log(`✅ ${functionName} test successful:`, result);
    return result;
  } catch (error) {
    console.error(`❌ ${functionName} test failed:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Testing Supabase Edge Functions...\n');

  // Test topic analysis
  await testEdgeFunction('analyze-topic', {
    topic: 'leadership'
  });

  console.log(''); // Add spacing

  // Test chapter analysis
  await testEdgeFunction('analyze-chapter', {
    chapter: {
      id: 1,
      chapter_title: 'The Art of Leadership',
      chapter_text: 'Leadership is about inspiring others to achieve great things. It requires vision, communication, and the ability to motivate teams towards common goals.'
    },
    query: 'leadership strategies'
  });

  console.log(''); // Add spacing

  // Test embeddings
  await testEdgeFunction('generate-embeddings', {
    query: 'leadership development'
  });

  console.log('\n🎉 Edge Functions testing complete!');
  console.log('\nIf all tests passed, your Edge Functions are ready to use.');
  console.log('If tests failed, make sure you:');
  console.log('1. Deployed the functions: supabase functions deploy');
  console.log('2. Set OPENAI_API_KEY in Supabase Edge Function Secrets');
  console.log('3. Have sufficient OpenAI credits');
}

// Run the tests
runTests().catch(console.error);

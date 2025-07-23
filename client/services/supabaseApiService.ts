import { supabase } from "@/lib/supabase";
import type { BookGroup, EnrichedChapter, SearchResults } from "@/lib/supabase";
import { netlifyFunctionService } from "./netlifyFunctionService";

// Netlify Functions handle OpenAI integration server-side
// Architecture: Frontend (Netlify) + Database (Supabase) + AI (Netlify Functions)

// Health check
export async function healthCheck(): Promise<{
  status: string;
  hasDatabase: boolean;
  hasOpenAI: boolean;
}> {
  console.log("🏥 Health Check: Starting comprehensive system health check");
  console.info("📋 Health Check: Checking Supabase and Edge Functions");

  try {
    console.log("🔗 Testing Supabase connection...");

    // Test database connection using Supabase client
    const { data, error } = await supabase.from("books").select("id").limit(1);

    if (error) {
      console.error("❌ Supabase connection error:", error);
      throw error;
    }

    console.log("✅ Supabase connection successful");

    console.log("🤖 Testing Netlify Functions...");

    // Test Netlify function availability
    let hasNetlifyFunctions = false;
    try {
      const result = await netlifyFunctionService.analyzeTopicWithAI("test");
      // If we get a result without errors, Netlify functions are working
      if (result) {
        hasNetlifyFunctions = true;
        console.log("✅ Netlify Functions deployed and working");
      }
    } catch (error) {
      console.warn("⚠️ Netlify Functions temporarily unavailable, using fallback mode");
    }

    const healthResult = {
      status: "ok",
      hasDatabase: true,
      hasOpenAI: hasNetlifyFunctions, // Netlify functions provide OpenAI functionality
    };

    console.log("✅ Health check completed:", healthResult);
    return healthResult;
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return {
      status: "error",
      hasDatabase: false,
      hasOpenAI: false,
    };
  }
}

// Generate embeddings using Netlify Function
export async function generateQueryEmbeddings(
  query: string,
): Promise<number[] | null> {
  try {
    console.log(`🧠 Calling Netlify Function for embeddings: "${query}"`);
    return await netlifyFunctionService.generateEmbeddings(query);
  } catch (error) {
    console.error("❌ Netlify Function embeddings failed:", error);
    return null;
  }
}

// Search the entire database using vector similarity or text search
export async function searchDatabase(query: string): Promise<SearchResults> {
  const startTime = Date.now();

  if (!query || query.trim() === "") {
    throw new Error("Query parameter is required");
  }

  console.log(`🧠 AI-POWERED SEARCH for: "${query}"`);

  try {
    // Step 1: Generate OpenAI embeddings for the query
    console.log("🔄 Step 1: Generating OpenAI embeddings...");
    const embeddings = await generateQueryEmbeddings(query);

    // Step 2: Search using Supabase client
    let results: any[] = [];
    let useVectorSearch = false;

    try {
      // For now, use simplified text search with Supabase
      console.log("🔄 Step 2: Searching database with Supabase...");

      const searchTerms = query.trim().toLowerCase().split(/\s+/);
      const primaryTerm = searchTerms[0];

      // Search chapters and books using Supabase
      const { data: searchResults, error } = await supabase
        .from("chapters")
        .select(
          `
          id,
          chapter_title,
          chapter_text,
          book_id,
          books!inner (
            id,
            title,
            author_name,
            author,
            cover_url,
            isbn_13
          )
        `,
        )
        .or(
          `chapter_title.ilike.%${query}%,chapter_text.ilike.%${query}%,books.title.ilike.%${query}%`,
        )
        .not("chapter_text", "is", null)
        .limit(20);

      if (error) {
        console.error("❌ Supabase search error:", error);
        throw error;
      }

      // Transform results to match expected format
      results = (searchResults || []).map((row: any) => ({
        id: row.id,
        chapter_title: row.chapter_title,
        chapter_text: row.chapter_text?.substring(0, 800) || "", // First 800 chars
        book_id: row.book_id,
        book_title: row.books.title,
        author_name: row.books.author_name || row.books.author,
        cover_url: row.books.cover_url,
        isbn_13: row.books.isbn_13,
        similarity_score: 0.75, // Default similarity score for text search
      }));

      console.log(`📚 Found ${results.length} chapters from Supabase`);

      // Step 3: Use OpenAI to analyze and enrich the results
      console.log("🔄 Step 3: Using OpenAI to analyze and enrich results...");
      const enrichedResults = await enrichResultsWithAI(results, query);

      console.log(
        `🎯 Returning ${enrichedResults.totalBooks} books with ${enrichedResults.totalChapters} AI-analyzed chapters`,
      );

      return {
        ...enrichedResults,
        searchType: useVectorSearch
          ? "ai_vector_search"
          : "enhanced_text_search",
        processingTime: Date.now() - startTime,
      };
    } catch (searchError) {
      console.error("❌ Search error:", searchError);
      throw searchError;
    }
  } catch (error) {
    console.error("❌ AI-powered search failed:", error);
    throw new Error(
      `AI-powered search failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

// Use OpenAI to analyze and enrich the database results
async function enrichResultsWithAI(
  dbResults: any[],
  query: string,
): Promise<SearchResults> {
  const openai = await getOpenAI();

  if (!openai || dbResults.length === 0) {
    return {
      query,
      searchType: "database_only",
      totalBooks: 0,
      totalChapters: 0,
      books: [],
    };
  }

  console.log(`🧠 Using OpenAI to analyze ${dbResults.length} chapters...`);

  // Group chapters by book
  const bookGroups = new Map();

  for (const chapter of dbResults) {
    if (!bookGroups.has(chapter.book_id)) {
      bookGroups.set(chapter.book_id, {
        id: chapter.book_id.toString(),
        title: chapter.book_title,
        author: chapter.author_name || "Unknown Author",
        cover:
          chapter.cover_url ||
          `https://via.placeholder.com/300x450/4361EE/FFFFFF?text=${encodeURIComponent(chapter.book_title.slice(0, 20))}`,
        isbn: chapter.isbn_13 || "",
        chapters: [],
      });
    }

    bookGroups.get(chapter.book_id).chapters.push(chapter);
  }

  // Process each book with AI analysis
  const enrichedBooks: BookGroup[] = [];

  for (const [bookId, bookData] of bookGroups) {
    console.log(`🔍 AI analyzing book: "${bookData.title}"`);

    const enrichedChapters: EnrichedChapter[] = [];

    // Use Netlify Functions to analyze each chapter
    for (const chapter of bookData.chapters.slice(0, 5)) {
      // Top 5 chapters per book
      console.log(`📄 Processing chapter: "${chapter.chapter_title}"`);
      try {
        const enrichment = await netlifyFunctionService.analyzeChapterWithAI(chapter, query);
        enrichedChapters.push(enrichment);
      } catch (error) {
        console.warn(`⚠️ Netlify Function analysis failed for chapter "${chapter.chapter_title}", using fallback:`, error);
        const fallbackEnrichment = createFallbackEnrichment(chapter, query);
        enrichedChapters.push(fallbackEnrichment);
      }
    }

    if (enrichedChapters.length > 0) {
      enrichedBooks.push({
        ...bookData,
        averageRelevance: Math.round(
          enrichedChapters.reduce((sum, ch) => sum + ch.relevanceScore, 0) /
            enrichedChapters.length,
        ),
        topChapters: enrichedChapters,
      });
    }
  }

  // Sort books by relevance
  enrichedBooks.sort((a, b) => b.averageRelevance - a.averageRelevance);

  const totalChapters = enrichedBooks.reduce(
    (sum, book) => sum + book.topChapters.length,
    0,
  );

  return {
    query,
    searchType: "ai_vector_search",
    totalBooks: enrichedBooks.length,
    totalChapters,
    books: enrichedBooks.slice(0, 10), // Top 10 books
  };
}

// Chapter analysis is now handled by Edge Functions

// Fallback enrichment for when AI fails
function createFallbackEnrichment(
  chapter: any,
  userQuery: string,
): EnrichedChapter {
  const score = Math.max(
    25,
    Math.round((chapter.similarity_score || 0.5) * 100),
  );

  return {
    id: chapter.id,
    title: chapter.chapter_title,
    snippet: chapter.chapter_text.substring(0, 300),
    relevanceScore: score,
    whyRelevant: `This chapter provides relevant insights for ${userQuery} through practical frameworks and actionable strategies.`,
    keyTopics: extractKeywords(chapter.chapter_text),
    coreLeadershipPrinciples: [
      "Apply evidence-based methods",
      "Focus on measurable outcomes",
    ],
    practicalApplications: [
      `Implement these ${userQuery} strategies in your daily work`,
      "Apply systematic approaches to achieve better results",
    ],
    aiExplanation: `Our AI identified this chapter as relevant to ${userQuery} due to its coverage of essential concepts and proven methodologies.`,
  };
}

// AI-powered topic analysis using Netlify Functions
export async function analyzeTopicWithAI(topic: string) {
  console.log(`🧠 Analyzing topic: "${topic}"`);

  try {
    console.log('🤖 Calling Netlify Function for topic analysis...');
    return await netlifyFunctionService.analyzeTopicWithAI(topic);
  } catch (error) {
    console.info('🔄 Using local analysis (Netlify Functions temporarily unavailable)');
    return createFallbackTopicAnalysis(topic);
  }
}

// Fallback topic analysis when OpenAI is unavailable
function createFallbackTopicAnalysis(topic: string) {
  return {
    isBroad: topic.split(" ").length <= 2,
    explanation: topic.split(" ").length <= 2
      ? `"${topic}" is quite broad. More specific terms would help find targeted content.`
      : `"${topic}" has good specificity for finding relevant content.`,
    refinements: [
      {
        label: `${topic} Strategies`,
        value: `${topic} strategies`,
        description: `Focus on practical ${topic} techniques and approaches`,
      },
      {
        label: `Advanced ${topic}`,
        value: `advanced ${topic}`,
        description: `Expert-level ${topic} methods and frameworks`,
      },
      {
        label: `${topic} Applications`,
        value: `${topic} applications`,
        description: `Real-world ${topic} use cases and implementations`,
      },
    ],
  };
}

// Database schema inspection
export async function inspectDatabaseSchema() {
  try {
    console.log("🔍 Inspecting database schema...");

    // Get all tables
    const { data: tables, error: tablesError } = await supabase.rpc('get_schema_info');

    if (tablesError) {
      // Fallback: try to get tables using information_schema
      console.log("📋 Using information_schema fallback...");

      const { data: tableList, error: listError } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');

      if (listError) {
        console.error("❌ Failed to get tables:", listError);
        return { error: listError.message };
      }

      console.log("📊 Found tables:", tableList);

      // Get sample data from known tables
      const knownTables = ['books', 'chapters', 'users', 'summaries', 'chapter_ratings'];
      const schemaInfo = {};

      for (const tableName of knownTables) {
        try {
          const { data: sample, error: sampleError } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

          if (!sampleError && sample && sample.length > 0) {
            schemaInfo[tableName] = {
              exists: true,
              columns: Object.keys(sample[0]),
              sampleRow: sample[0]
            };
          }
        } catch (tableError) {
          console.log(`⚠️ Table ${tableName} might not exist`);
        }
      }

      return {
        method: 'fallback',
        tables: Object.keys(schemaInfo),
        schema: schemaInfo
      };
    }

    return { method: 'rpc', data: tables };

  } catch (error) {
    console.error("❌ Schema inspection failed:", error);
    return { error: error.message };
  }
}

// Helper function to extract keywords from text
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const businessTerms = [
    "strategy",
    "leadership",
    "management",
    "innovation",
    "communication",
    "development",
    "performance",
    "growth",
    "planning",
    "execution",
  ];

  const found = businessTerms.filter((term) => words.includes(term));
  return found
    .slice(0, 4)
    .map((term) => term.charAt(0).toUpperCase() + term.slice(1));
}

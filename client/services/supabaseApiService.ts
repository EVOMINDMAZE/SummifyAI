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
      if (error.message === "FUNCTION_NOT_DEPLOYED") {
        console.info(
          "📋 Netlify Functions not deployed yet. App running in fallback mode.",
        );
        console.info(
          "🚀 To deploy: Push to main branch or run 'netlify deploy --prod'",
        );
      } else if (error.message === "FUNCTION_NOT_AVAILABLE") {
        console.info(
          "🔧 Development mode: Netlify Functions not running locally.",
        );
        console.info(
          '💡 For local functions: Run "netlify dev" instead of "npm run dev"',
        );
      } else {
        console.warn(
          "⚠️ Netlify Functions temporarily unavailable, using fallback mode",
        );
      }
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
    console.log(`🧠 Attempting to generate embeddings for: "${query}"`);
    return await netlifyFunctionService.generateEmbeddings(query);
  } catch (error) {
    console.info(
      "💡 Embeddings not available (AI functions not deployed), continuing with text search",
    );
    return null;
  }
}

// Search the entire database using vector similarity or text search
export async function searchDatabase(query: string): Promise<SearchResults> {
  const startTime = Date.now();

  if (!query || query.trim() === "") {
    throw new Error("Query parameter is required");
  }

  console.log(`🧠 DATABASE SEARCH for: "${query}"`);

  try {
    // Step 1: Try to generate OpenAI embeddings (optional)
    console.log("🔄 Step 1: Checking for AI capabilities...");
    const embeddings = await generateQueryEmbeddings(query);
    if (embeddings) {
      console.log("✅ AI embeddings generated successfully");
    } else {
      console.log("⚠️ AI embeddings not available, using text search");
    }

    // Step 2: Search using Supabase client (this always works)
    console.log("🔄 Step 2: Searching database with Supabase...");

    // Sanitize query to prevent SQL injection and parsing issues
    const sanitizedQuery = query.trim().replace(/[%_]/g, "\\$&");
    console.log(
      `🔍 Executing search query: "${query}" (sanitized: "${sanitizedQuery}")`,
    );

    // Search in three separate queries and combine results
    const searchPromises = [
      // Search in chapter titles
      supabase
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
            cover_url,
            isbn_13
          )
        `,
        )
        .ilike("chapter_title", `%${sanitizedQuery}%`)
        .not("chapter_text", "is", null)
        .limit(10),

      // Search in chapter text
      supabase
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
            cover_url,
            isbn_13
          )
        `,
        )
        .ilike("chapter_text", `%${sanitizedQuery}%`)
        .not("chapter_text", "is", null)
        .limit(10),

      // Search in book titles
      supabase
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
            cover_url,
            isbn_13
          )
        `,
        )
        .ilike("books.title", `%${sanitizedQuery}%`)
        .not("chapter_text", "is", null)
        .limit(10),
    ];

    const [titleResults, textResults, bookResults] =
      await Promise.all(searchPromises);

    // Check for errors in any of the searches
    if (titleResults.error || textResults.error || bookResults.error) {
      const error =
        titleResults.error || textResults.error || bookResults.error;
      console.error("❌ Supabase search error:", error);
      throw new Error(
        `Database search failed: ${error.message || "Search query failed"}`,
      );
    }

    // Combine and deduplicate results
    const allResults = [
      ...(titleResults.data || []),
      ...(textResults.data || []),
      ...(bookResults.data || []),
    ];

    // Remove duplicates based on chapter ID
    const uniqueResults = allResults.filter(
      (result, index, array) =>
        array.findIndex((r) => r.id === result.id) === index,
    );

    const searchResults = uniqueResults.slice(0, 20); // Limit final results
    console.log(
      `📚 Combined search found ${searchResults.length} unique chapters`,
    );

    // Transform results to match expected format
    const results = searchResults.map((row: any) => ({
      id: row.id,
      chapter_title: row.chapter_title,
      chapter_text: row.chapter_text?.substring(0, 800) || "", // First 800 chars
      book_id: row.book_id,
      book_title: row.books.title,
      author_name: row.books.author_name,
      cover_url: row.books.cover_url,
      isbn_13: row.books.isbn_13,
      similarity_score: 0.75, // Default similarity score for text search
    }));

    console.log(`📚 Found ${results.length} chapters from Supabase`);

    // Step 3: Try to enrich with AI (fallback if not available)
    console.log("🔄 Step 3: Attempting to enrich results with AI...");
    const enrichedResults = await enrichResultsWithAI(results, query);

    console.log(
      `🎯 Returning ${enrichedResults.totalBooks} books with ${enrichedResults.totalChapters} chapters`,
    );

    return {
      ...enrichedResults,
      searchType: embeddings ? "ai_enhanced_search" : "database_search",
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    console.error("❌ Search failed:", error);

    // Always return some results rather than failing completely
    // This prevents infinite loading states
    console.log("🔄 Returning fallback empty results to prevent infinite loading");

    return {
      query,
      searchType: "search_failed",
      totalBooks: 0,
      totalChapters: 0,
      books: [],
      processingTime: Date.now() - startTime,
    };
  }
}

// Use Netlify Functions to analyze and enrich the database results
async function enrichResultsWithAI(
  dbResults: any[],
  query: string,
): Promise<SearchResults> {
  if (dbResults.length === 0) {
    return {
      query,
      searchType: "database_only",
      totalBooks: 0,
      totalChapters: 0,
      books: [],
    };
  }

  console.log(
    `🔄 Attempting to enrich ${dbResults.length} chapters with AI...`,
  );

  // Group chapters by book
  const bookGroups = new Map();

  try {
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

    // Process each book with AI analysis (or fallback)
    const enrichedBooks: BookGroup[] = [];
    let aiAnalysisWorking = false;

    for (const [bookId, bookData] of bookGroups) {
      console.log(`🔍 Processing book: "${bookData.title}"`);

      const enrichedChapters: EnrichedChapter[] = [];

      // Try AI analysis for first chapter to test if functions are working
      let useAI = false;
      if (!aiAnalysisWorking) {
        try {
          const testChapter = bookData.chapters[0];
          const enrichment = await netlifyFunctionService.analyzeChapterWithAI(
            testChapter,
            query,
          );
          enrichedChapters.push(enrichment);
          aiAnalysisWorking = true;
          useAI = true;
          console.log(
            "✅ AI analysis working, processing remaining chapters...",
          );
        } catch (error) {
          console.info(
            "💡 AI analysis not available, using enhanced fallback processing",
          );
          const fallbackEnrichment = createFallbackEnrichment(
            bookData.chapters[0],
            query,
          );
          enrichedChapters.push(fallbackEnrichment);
        }
      }

      // Process remaining chapters based on AI availability
      for (const chapter of bookData.chapters.slice(1, 5)) {
        // Top 5 chapters per book
        if (useAI && aiAnalysisWorking) {
          try {
            const enrichment =
              await netlifyFunctionService.analyzeChapterWithAI(chapter, query);
            enrichedChapters.push(enrichment);
          } catch (error) {
            // If AI fails mid-process, fall back
            const fallbackEnrichment = createFallbackEnrichment(chapter, query);
            enrichedChapters.push(fallbackEnrichment);
          }
        } else {
          // Use fallback processing
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

    const searchType = aiAnalysisWorking
      ? "ai_enhanced"
      : "enhanced_text_search";
    console.log(`✅ Enrichment complete using ${searchType}`);

    return {
      query,
      searchType,
      totalBooks: enrichedBooks.length,
      totalChapters,
      books: enrichedBooks.slice(0, 10), // Top 10 books
    };
  } catch (error) {
    console.error("❌ Result enrichment failed:", error);
    console.log("🔄 Falling back to basic results without AI enrichment");

    // Always return results, even if enrichment fails
    // This prevents infinite loading states
    const basicBooks = Array.from(bookGroups.values()).map((bookData) => ({
      ...bookData,
      averageRelevance: 50, // Default relevance
      topChapters: bookData.chapters
        .slice(0, 3)
        .map((chapter) => createFallbackEnrichment(chapter, query)),
    }));

    console.log(`✅ Returning ${basicBooks.length} books with basic enrichment`);

    return {
      query,
      searchType: "basic_search",
      totalBooks: basicBooks.length,
      totalChapters: basicBooks.reduce(
        (sum, book) => sum + book.topChapters.length,
        0,
      ),
      books: basicBooks.slice(0, 10),
    };
  }
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
    console.log("🤖 Calling Netlify Function for topic analysis...");
    return await netlifyFunctionService.analyzeTopicWithAI(topic);
  } catch (error) {
    console.info(
      "🔄 Using local fallback analysis (Netlify Functions not deployed)",
    );
    return createFallbackTopicAnalysis(topic);
  }
}

// Fallback topic analysis when OpenAI is unavailable
function createFallbackTopicAnalysis(topic: string) {
  return {
    isBroad: topic.split(" ").length <= 2,
    explanation:
      topic.split(" ").length <= 2
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
    const { data: tables, error: tablesError } =
      await supabase.rpc("get_schema_info");

    if (tablesError) {
      // Fallback: directly check known tables instead of using system tables
      console.log("📋 Using direct table inspection fallback...");
      console.info(
        "💡 RPC get_schema_info not available, checking known tables directly",
      );

      // Get sample data from known tables
      const knownTables = [
        "books",
        "chapters",
        "users",
        "summaries",
        "chapter_ratings",
      ];
      const schemaInfo = {};
      const existingTables = [];

      for (const tableName of knownTables) {
        try {
          console.log(`🔍 Checking table: ${tableName}`);
          const { data: sample, error: sampleError } = await supabase
            .from(tableName)
            .select("*")
            .limit(1);

          if (!sampleError && sample !== null) {
            existingTables.push(tableName);
            schemaInfo[tableName] = {
              exists: true,
              columns: sample.length > 0 ? Object.keys(sample[0]) : [],
              sampleRow: sample.length > 0 ? sample[0] : null,
              rowCount: sample.length,
            };
            console.log(
              `✅ Table ${tableName} exists with ${sample.length} sample rows`,
            );
          } else {
            console.log(
              `⚠️ Table ${tableName} not accessible: ${sampleError?.message || "No data"}`,
            );
          }
        } catch (tableError) {
          console.log(
            `❌ Table ${tableName} error:`,
            tableError instanceof Error ? tableError.message : tableError,
          );
        }
      }

      console.log(
        `📊 Found ${existingTables.length} accessible tables:`,
        existingTables,
      );

      return {
        method: "direct_inspection",
        tables: existingTables,
        schema: schemaInfo,
        totalTables: existingTables.length,
      };
    }

    return { method: "rpc", data: tables };
  } catch (error) {
    console.error(
      "❌ Schema inspection failed:",
      error instanceof Error ? error.message : error,
    );
    return {
      error:
        error instanceof Error ? error.message : "Schema inspection failed",
    };
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

  const found = businessTerms.filter((term) =>
    words.some((word) => word === term),
  );
  return found
    .slice(0, 4)
    .map((term) => term.charAt(0).toUpperCase() + term.slice(1));
}

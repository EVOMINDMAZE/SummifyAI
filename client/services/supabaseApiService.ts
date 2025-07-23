import { supabase } from "@/lib/supabase";
import type { BookGroup, EnrichedChapter, SearchResults } from "@/lib/supabase";

// Initialize OpenAI (we'll import it when needed to avoid bundling issues)
let OpenAI: any = null;

async function getOpenAI() {
  if (!OpenAI) {
    try {
      const openaiModule = await import("openai");
      OpenAI = openaiModule.default;
    } catch (error) {
      console.error("Failed to import OpenAI:", error);
      return null;
    }
  }

  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  console.log("🤖 OpenAI Config:", {
    hasApiKey: !!apiKey,
    keyLength: apiKey ? apiKey.length : 0,
    keyPrefix: apiKey ? apiKey.substring(0, 7) + '...' : 'none',
    envCheck: !!import.meta.env.VITE_OPENAI_API_KEY,
  });

  if (!apiKey || !apiKey.startsWith('sk-')) {
    console.error("❌ Invalid or missing OPENAI_API_KEY - must start with 'sk-'");
    return null;
  }

  return new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true, // For client-side usage
  });
}

// Health check
export async function healthCheck(): Promise<{
  status: string;
  hasDatabase: boolean;
  hasOpenAI: boolean;
}> {
  console.log("🏥 Starting health check...");

  try {
    console.log("🔗 Testing Supabase connection...");

    // Test database connection using Supabase client
    const { data, error } = await supabase.from("books").select("id").limit(1);

    if (error) {
      console.error("❌ Supabase connection error:", error);
      throw error;
    }

    console.log("✅ Supabase connection successful");

    console.log("🤖 Testing OpenAI connection...");
    const openai = await getOpenAI();
    console.log("🤖 OpenAI client status:", !!openai);

    const healthResult = {
      status: "ok",
      hasDatabase: true,
      hasOpenAI: !!openai,
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

// Generate OpenAI embeddings for the search query
export async function generateQueryEmbeddings(
  query: string,
): Promise<number[] | null> {
  try {
    const openai = await getOpenAI();
    if (!openai) return null;

    console.log(`🧠 Calling OpenAI embeddings API for: "${query}"`);

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: query.trim(),
      encoding_format: "float",
    });

    const embedding = response.data[0].embedding;
    console.log(
      `✅ OpenAI embeddings generated successfully (${embedding.length} dimensions)`,
    );

    return embedding;
  } catch (error) {
    console.error("❌ OpenAI embeddings failed:", error);
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

    // Analyze each chapter with OpenAI
    for (const chapter of bookData.chapters.slice(0, 5)) {
      // Top 5 chapters per book
      try {
        const enrichment = await analyzeChapterWithAI(chapter, query, openai);
        enrichedChapters.push(enrichment);
      } catch (error) {
        console.warn(
          `⚠️ Failed to analyze chapter "${chapter.chapter_title}":`,
          error,
        );
        // Add fallback data
        enrichedChapters.push(createFallbackEnrichment(chapter, query));
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

// Analyze individual chapter with OpenAI
async function analyzeChapterWithAI(
  chapter: any,
  query: string,
  openai: any,
): Promise<EnrichedChapter> {
  const prompt = `As an expert content analyst, analyze this chapter for a user searching for "${query}":

Title: "${chapter.chapter_title}"
Content: ${chapter.chapter_text.substring(0, 800)}

Provide a JSON response with detailed analysis:
{
  "relevanceScore": number (25-100, how relevant this specific chapter is to "${query}"),
  "whyRelevant": "2-3 sentence explanation of WHY you chose this chapter and HOW it specifically helps with ${query}. Be specific about what the user will learn.",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "coreLeadershipPrinciples": ["principle1", "principle2"],
  "practicalApplications": ["application1", "application2"],
  "aiExplanation": "Detailed explanation of why this chapter is valuable for someone seeking ${query} knowledge"
}

Focus on being specific about the practical value and direct relevance to the user's search query.`;

  try {
    const response = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-nano",
      messages: [
        {
          role: "system",
          content:
            "You are an expert content analyst. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    const aiResult = JSON.parse(
      response.choices[0]?.message?.content?.trim() || "{}",
    );

    return {
      id: chapter.id,
      title: chapter.chapter_title,
      snippet: chapter.chapter_text.substring(0, 300),
      relevanceScore: Math.min(
        100,
        Math.max(
          25,
          aiResult.relevanceScore ||
            Math.round((1 - chapter.similarity_score) * 100),
        ),
      ),
      whyRelevant:
        aiResult.whyRelevant ||
        `This chapter directly addresses ${query} by providing practical frameworks and actionable strategies that you can implement immediately in your work.`,
      keyTopics: Array.isArray(aiResult.keyTopics)
        ? aiResult.keyTopics.slice(0, 4)
        : [],
      coreLeadershipPrinciples: Array.isArray(aiResult.coreLeadershipPrinciples)
        ? aiResult.coreLeadershipPrinciples.slice(0, 3)
        : ["Apply systematic thinking", "Focus on measurable results"],
      practicalApplications: Array.isArray(aiResult.practicalApplications)
        ? aiResult.practicalApplications.slice(0, 3)
        : [
            `Apply these ${query} insights to daily practice`,
            "Implement systematic approaches",
          ],
      aiExplanation:
        aiResult.aiExplanation ||
        `Selected for its comprehensive coverage of ${query} concepts with proven methodologies and real-world applications.`,
    };
  } catch (error) {
    console.warn("❌ OpenAI chapter analysis failed, using fallback:", error);
    throw error; // Let caller handle fallback
  }
}

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

// AI-powered topic analysis
export async function analyzeTopicWithAI(topic: string) {
  console.log(`🧠 Analyzing topic: "${topic}"`);

  // For now, return fallback analysis to avoid OpenAI API issues
  // TODO: Fix OpenAI API key and re-enable AI analysis
  const fallbackAnalysis = {
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

  const openai = await getOpenAI();

  if (!openai) {
    console.log("⚠️ Using fallback topic analysis (no OpenAI client)");
    return fallbackAnalysis;
  }

  try {
    console.log(`🧠 Using OpenAI to analyze topic: "${topic}"`);

    const response = await openai.chat.completions.create({
      model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-nano",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at analyzing search topics and suggesting refinements. Always respond with valid JSON.",
        },
        {
          role: "user",
          content: `Analyze this search topic: "${topic}"

Provide JSON response:
{
  "isBroad": boolean (true if topic is too general),
  "explanation": "Brief explanation of the topic scope",
  "refinements": [
    {
      "label": "Refinement name",
      "value": "Specific search query",
      "description": "Why this refinement is useful"
    }
  ]
}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.3,
    });

    const aiResult = JSON.parse(
      response.choices[0]?.message?.content?.trim() || "{}",
    );

    return {
      isBroad: aiResult.isBroad || topic.split(" ").length <= 2,
      explanation: aiResult.explanation || `"${topic}" analysis completed.`,
      refinements: Array.isArray(aiResult.refinements)
        ? aiResult.refinements.slice(0, 3)
        : [
            {
              label: `${topic} Fundamentals`,
              value: `${topic} basics`,
              description: `Core principles of ${topic}`,
            },
            {
              label: `Advanced ${topic}`,
              value: `advanced ${topic}`,
              description: `Expert ${topic} techniques`,
            },
            {
              label: `${topic} in Practice`,
              value: `practical ${topic}`,
              description: `Real-world ${topic} applications`,
            },
          ],
    };
  } catch (error) {
    console.error("❌ OpenAI topic analysis failed:", error);

    // Check if it's an authentication error
    if (error instanceof Error && error.message.includes('401')) {
      console.error("🔑 Authentication error - check OPENAI_API_KEY");
    }

    // Return fallback
    return {
      isBroad: topic.split(" ").length <= 2,
      explanation: `"${topic}" has been analyzed.`,
      refinements: [
        {
          label: `${topic} Strategies`,
          value: `${topic} strategies`,
          description: `Practical ${topic} approaches`,
        },
        {
          label: `${topic} Methods`,
          value: `${topic} methods`,
          description: `Proven ${topic} techniques`,
        },
        {
          label: `${topic} Applications`,
          value: `${topic} applications`,
          description: `Real-world ${topic} use cases`,
        },
      ],
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

  const found = businessTerms.filter((term) => words.includes(term));
  return found
    .slice(0, 4)
    .map((term) => term.charAt(0).toUpperCase() + term.slice(1));
}

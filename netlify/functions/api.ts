import { Handler } from "@netlify/functions";
import { Client } from "pg";

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

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ OPENAI_API_KEY not configured");
    return null;
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

export const handler: Handler = async (event, context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    let path = event.path;
    if (path.startsWith("/.netlify/functions/api")) {
      path = path.replace("/.netlify/functions/api", "");
    } else if (path.startsWith("/api")) {
      path = path.replace("/api", "");
    }
    if (!path.startsWith("/")) path = "/" + path;

    const method = event.httpMethod;

    console.log(`🚀 AI-Powered Function: ${method} ${event.path} -> ${path}`);
    console.log("🔧 Environment:", {
      DATABASE_URL: process.env.DATABASE_URL ? "✅ Set" : "❌ Missing",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "✅ Set" : "❌ Missing",
      NODE_ENV: process.env.NODE_ENV || "not-set",
    });

    // Health check
    if (path === "/health" && method === "GET") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          ai_powered: true,
          hasDatabase: !!process.env.DATABASE_URL,
          hasOpenAI: !!process.env.OPENAI_API_KEY,
        }),
      };
    }

    // REAL AI-POWERED DATABASE SEARCH
    if (path === "/database" && method === "GET") {
      const query = event.queryStringParameters?.q;

      if (!query || query.trim() === "") {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Query parameter "q" is required' }),
        };
      }

      console.log(`🧠 AI-POWERED SEARCH for: "${query}"`);

      try {
        // Step 1: Generate OpenAI embeddings for the query
        console.log("🔄 Step 1: Generating OpenAI embeddings...");
        const embeddings = await generateQueryEmbeddings(query);

        if (!embeddings) {
          throw new Error("Failed to generate embeddings");
        }

        console.log(`✅ Generated ${embeddings.length}D embedding vector`);

        // Step 2: Search the entire database using vector similarity
        console.log(
          "🔄 Step 2: Searching entire database with vector similarity...",
        );
        const dbResults = await searchDatabaseWithEmbeddings(embeddings, query);

        console.log(`📚 Found ${dbResults.length} chapters from database`);

        // Step 3: Use OpenAI to analyze and enrich the results
        console.log("🔄 Step 3: Using OpenAI to analyze and enrich results...");
        const enrichedResults = await enrichResultsWithAI(dbResults, query);

        console.log(
          `🎯 Returning ${enrichedResults.totalBooks} books with ${enrichedResults.totalChapters} AI-analyzed chapters`,
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(enrichedResults),
        };
      } catch (error) {
        console.error("❌ AI-powered search failed:", error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: "AI-powered search failed",
            details: error instanceof Error ? error.message : "Unknown error",
            timestamp: new Date().toISOString(),
          }),
        };
      }
    }

    // REAL AI-POWERED TOPIC ANALYSIS
    if ((path === "/topic" || path === "/topic/analyze") && method === "POST") {
      try {
        const body = JSON.parse(event.body || "{}");
        const { topic } = body;

        if (!topic) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Topic is required" }),
          };
        }

        console.log(`🧠 AI-ANALYZING topic: "${topic}"`);

        // Use OpenAI to analyze the topic
        const analysis = await analyzeTopicWithAI(topic);

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(analysis),
        };
      } catch (error) {
        console.error("❌ AI topic analysis failed:", error);
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: "AI topic analysis failed",
            details: error instanceof Error ? error.message : "Unknown error",
          }),
        };
      }
    }

    // 404
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: "API route not found",
        availableRoutes: ["/health", "/database", "/topic", "/topic/analyze"],
      }),
    };
  } catch (error) {
    console.error("❌ Unexpected error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

// STEP 1: Generate OpenAI embeddings for the search query
async function generateQueryEmbeddings(
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

// STEP 2: Search the entire database using vector similarity
async function searchDatabaseWithEmbeddings(
  embeddings: number[],
  query: string,
) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  try {
    await client.connect();
    console.log("✅ Connected to database for vector search");

    // Format embeddings for PostgreSQL
    const embeddingString = `[${embeddings.join(",")}]`;

    // Search the ENTIRE database using pgvector similarity
    const result = await client.query(
      `
      SELECT 
        c.id,
        c.chapter_title,
        c.chapter_text,
        b.id as book_id,
        b.title as book_title,
        b.author_name,
        b.cover_url,
        b.isbn_13,
        c.vector_embedding <=> $1::vector as similarity_score
      FROM chapters c
      JOIN books b ON c.book_id = b.id
      WHERE c.vector_embedding IS NOT NULL 
        AND c.chapter_text IS NOT NULL
        AND LENGTH(c.chapter_text) > 100
      ORDER BY c.vector_embedding <=> $1::vector ASC
      LIMIT 15;
    `,
      [embeddingString],
    );

    console.log(`📊 Database returned ${result.rows.length} chapters`);

    return result.rows.map((row) => ({
      id: row.id,
      chapter_title: row.chapter_title,
      chapter_text: row.chapter_text.substring(0, 800), // First 800 chars
      book_id: row.book_id,
      book_title: row.book_title,
      author_name: row.author_name,
      cover_url: row.cover_url,
      isbn_13: row.isbn_13,
      similarity_score: parseFloat(row.similarity_score),
    }));
  } finally {
    await client.end();
    console.log("🔌 Database connection closed");
  }
}

// STEP 3: Use OpenAI to analyze and enrich the database results
async function enrichResultsWithAI(dbResults: any[], query: string) {
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
        author: chapter.author_name,
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
  const enrichedBooks = [];

  for (const [bookId, bookData] of bookGroups) {
    console.log(`🔍 AI analyzing book: "${bookData.title}"`);

    const enrichedChapters = [];

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
        enrichedChapters.push({
          id: chapter.id,
          title: chapter.chapter_title,
          snippet: chapter.chapter_text.substring(0, 300),
          relevanceScore: Math.round((1 - chapter.similarity_score) * 100),
          whyRelevant: `This chapter addresses ${query} with practical insights and proven strategies.`,
          keyTopics: extractKeywords(chapter.chapter_text),
          coreLeadershipPrinciples: [
            "Apply systematic thinking",
            "Focus on continuous improvement",
          ],
          practicalApplications: [
            `Use these insights for ${query}`,
            "Implement in daily practice",
          ],
        });
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
async function analyzeChapterWithAI(chapter: any, query: string, openai: any) {
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
      model: process.env.OPENAI_MODEL || "gpt-4o-nano",
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
          1,
          aiResult.relevanceScore ||
            Math.round((1 - chapter.similarity_score) * 100),
        ),
      ),
      whyRelevant:
        aiResult.whyRelevant ||
        `This chapter provides valuable insights for ${query}.`,
      keyTopics: Array.isArray(aiResult.keyTopics)
        ? aiResult.keyTopics.slice(0, 4)
        : extractKeywords(chapter.chapter_text),
      coreLeadershipPrinciples: Array.isArray(aiResult.coreLeadershipPrinciples)
        ? aiResult.coreLeadershipPrinciples.slice(0, 3)
        : ["Apply systematic thinking", "Focus on results"],
      practicalApplications: Array.isArray(aiResult.practicalApplications)
        ? aiResult.practicalApplications.slice(0, 3)
        : [`Apply these insights to ${query}`, "Practice in real situations"],
    };
  } catch (error) {
    console.warn("⚠️ OpenAI chapter analysis failed, using fallback:", error);
    throw error; // Let caller handle fallback
  }
}

// AI-powered topic analysis
async function analyzeTopicWithAI(topic: string) {
  const openai = await getOpenAI();

  if (!openai) {
    // Fallback analysis
    return {
      isBroad: topic.split(" ").length <= 2,
      explanation: `"${topic}" could benefit from more specific focus.`,
      refinements: [
        {
          label: `${topic} Strategies`,
          value: `${topic} strategies`,
          description: `Focus on practical ${topic} techniques`,
        },
        {
          label: `Advanced ${topic}`,
          value: `advanced ${topic}`,
          description: `Expert-level ${topic} methods`,
        },
        {
          label: `${topic} Applications`,
          value: `${topic} applications`,
          description: `Real-world ${topic} use cases`,
        },
      ],
    };
  }

  try {
    console.log(`🧠 Using OpenAI to analyze topic: "${topic}"`);

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-nano",
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

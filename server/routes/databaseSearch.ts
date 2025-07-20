import { Router } from "express";
import { Client } from "pg";
import OpenAI from "openai";

const router = Router();

interface ChapterResult {
  id: number;
  chapter_title: string;
  chapter_text: string;
  book_id: number;
  book_title: string;
  author_name: string;
  cover_url: string;
  isbn_13: string;
  similarity_score: number;
}

interface BookGroup {
  id: string;
  title: string;
  author: string;
  cover: string;
  isbn: string;
  topChapters: EnrichedChapter[];
  averageRelevance: number;
}

interface EnrichedChapter {
  id: number;
  title: string;
  snippet: string;
  relevanceScore: number;
  whyRelevant: string;
  keyTopics: string[];
  coreLeadershipPrinciples: string[];
  practicalApplications: string[];
}

// Initialize OpenAI client only when API key is available and valid
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (
    !openai &&
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY.startsWith("sk-")
  ) {
    try {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      console.log("✅ OpenAI client initialized successfully");
    } catch (error) {
      console.warn("Failed to initialize OpenAI client:", error.message);
      return null;
    }
  }
  return openai;
}

// Generate query embedding using OpenAI's text-embedding-3-small or return null for fallback
async function generateQueryEmbedding(query: string): Promise<number[] | null> {
  try {
    console.log(`🧠 Generating embedding for: "${query}"`);

    const openaiClient = getOpenAIClient();
    if (!openaiClient) {
      console.log(
        "❌ No OpenAI client available, will use text search fallback",
      );
      return null;
    }

    const response = await openaiClient.embeddings.create({
      model: "text-embedding-3-small",
      input: query.trim(),
      encoding_format: "float",
    });

    const embedding = response.data[0].embedding;
    console.log(`✅ Generated ${embedding.length}D embedding`);
    return embedding;
  } catch (error) {
    console.warn(
      "❌ Embedding generation failed, will use text search:",
      error.message,
    );
    return null;
  }
}

// Enhanced database search with real AI
router.get("/", async (req, res) => {
  const startTime = Date.now();

  try {
    const { q: query } = req.query;

    if (!query || typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    console.log(`🔍 Database search initiated for: "${query}"`);

    // Try to generate real embedding
    const queryEmbedding = await generateQueryEmbedding(query.trim());

    // Connect to database
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();
    console.log("✅ Database connected successfully");

    try {
      // First, check if we have the required tables
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('books', 'chapters')
      `);

      const availableTables = tableCheck.rows.map((row) => row.table_name);
      console.log("��� Available tables:", availableTables);

      if (
        !availableTables.includes("books") ||
        !availableTables.includes("chapters")
      ) {
        // Tables don't exist, create sample data
        console.log(
          "⚠️ Required tables not found, creating sample database...",
        );
        await createSampleDatabase(client);
      }

      // Check what data we actually have
      const dataCheck = await client.query(`
        SELECT 
          (SELECT COUNT(*) FROM books) as book_count,
          (SELECT COUNT(*) FROM chapters) as chapter_count,
          (SELECT COUNT(*) FROM chapters WHERE vector_embedding IS NOT NULL) as vector_count
      `);

      console.log(
        `📊 Database stats: ${dataCheck.rows[0].book_count} books, ${dataCheck.rows[0].chapter_count} chapters, ${dataCheck.rows[0].vector_count} with vectors`,
      );

      // Determine search type based on embedding availability and vector data
      let useVectorSearch = false;
      if (queryEmbedding) {
        try {
          const vectorCount = parseInt(dataCheck.rows[0].vector_count);
          useVectorSearch = vectorCount > 0;
          console.log(
            `🔬 Vector embeddings available: ${vectorCount} chapters`,
          );
        } catch (vectorError) {
          console.log("📝 No vector embeddings found, using text search");
          useVectorSearch = false;
        }
      } else {
        console.log("📝 No embedding generated, using text search");
        useVectorSearch = false;
      }

      let results: ChapterResult[] = [];

      if (useVectorSearch && queryEmbedding) {
        // Use vector similarity search
        const embeddingString = `[${queryEmbedding.join(",")}]`;
        const vectorResult = await client.query(
          `
          SELECT 
            c.id,
            c.chapter_title,
            SUBSTRING(c.chapter_text, 1, 1000) AS chapter_text,
            c.book_id,
            b.title AS book_title,
            b.author_name,
            b.cover_url,
            b.isbn_13,
            1 - (c.vector_embedding <=> $1::vector) AS similarity_score
          FROM chapters c
          JOIN books b ON c.book_id = b.id
          WHERE c.vector_embedding IS NOT NULL 
            AND c.chapter_text IS NOT NULL
            AND LENGTH(c.chapter_text) > 100
          ORDER BY c.vector_embedding <=> $1::vector ASC
          LIMIT 20;
        `,
          [embeddingString],
        );
        results = vectorResult.rows;
        console.log(`🎯 Vector search found: ${results.length} results`);
      } else {
        // Use enhanced text search with flexible matching
        const searchTerms = query.trim().toLowerCase().split(/\s+/);
        const primaryTerm = searchTerms[0];
        const fullQuery = query.trim();

        console.log(
          `🔍 Text search for: "${fullQuery}" (primary: "${primaryTerm}")`,
        );

        // First try: exact matches and partial matches
        let textResult = await client.query(
          `
          SELECT 
            c.id,
            c.chapter_title,
            SUBSTRING(c.chapter_text, 1, 1000) AS chapter_text,
            c.book_id,
            b.title AS book_title,
            b.author_name,
            b.cover_url,
            b.isbn_13,
            CASE 
              WHEN c.chapter_title ILIKE $1 THEN 0.95
              WHEN c.chapter_title ILIKE $2 THEN 0.90
              WHEN c.chapter_text ILIKE $1 THEN 0.85
              WHEN c.chapter_text ILIKE $2 THEN 0.80
              WHEN b.title ILIKE $1 THEN 0.75
              WHEN b.title ILIKE $2 THEN 0.70
              WHEN b.author_name ILIKE $1 THEN 0.65
              WHEN b.author_name ILIKE $2 THEN 0.60
              ELSE 0.50
            END AS similarity_score
          FROM chapters c
          JOIN books b ON c.book_id = b.id
          WHERE c.chapter_text IS NOT NULL 
            AND LENGTH(c.chapter_text) > 50
            AND (
              c.chapter_title ILIKE $1 
              OR c.chapter_title ILIKE $2
              OR c.chapter_text ILIKE $1 
              OR c.chapter_text ILIKE $2
              OR b.title ILIKE $1
              OR b.title ILIKE $2
              OR b.author_name ILIKE $1
              OR b.author_name ILIKE $2
            )
          ORDER BY similarity_score DESC
          LIMIT 20;
        `,
          [`%${fullQuery}%`, `%${primaryTerm}%`],
        );

        results = textResult.rows;
        console.log(`🔍 Exact/partial search found: ${results.length} results`);

        // If no results, try broader search with individual terms
        if (results.length === 0 && searchTerms.length > 1) {
          console.log(
            `🔍 Trying broader search with terms: ${searchTerms.join(", ")}`,
          );

          const termConditions = searchTerms
            .map(
              (_, index) => `
            (c.chapter_title ILIKE $${index + 1} OR c.chapter_text ILIKE $${index + 1} OR b.title ILIKE $${index + 1})
          `,
            )
            .join(" OR ");

          const termParams = searchTerms.map((term) => `%${term}%`);

          textResult = await client.query(
            `
            SELECT 
              c.id,
              c.chapter_title,
              SUBSTRING(c.chapter_text, 1, 1000) AS chapter_text,
              c.book_id,
              b.title AS book_title,
              b.author_name,
              b.cover_url,
              b.isbn_13,
              0.60 AS similarity_score
            FROM chapters c
            JOIN books b ON c.book_id = b.id
            WHERE c.chapter_text IS NOT NULL 
              AND LENGTH(c.chapter_text) > 50
              AND (${termConditions})
            ORDER BY LENGTH(c.chapter_text) DESC
            LIMIT 20;
          `,
            termParams,
          );

          results = textResult.rows;
          console.log(`🔍 Broader search found: ${results.length} results`);
        }

        // If still no results, try matching common business terms
        if (results.length === 0) {
          console.log(`🔍 Trying business terms matching`);

          const commonTerms = [
            "leadership",
            "team",
            "management",
            "decision",
            "communication",
            "people",
            "work",
            "business",
            "strategy",
            "performance",
            "goal",
            "success",
            "effective",
            "great",
            "good",
            "first",
            "habit",
            "negotiation",
            "conflict",
            "resolution",
            "proactive",
            "autonomous",
            "level",
          ];
          const matchingTerms = commonTerms.filter(
            (term) =>
              fullQuery.toLowerCase().includes(term) ||
              searchTerms.some(
                (searchTerm) =>
                  searchTerm.includes(term) || term.includes(searchTerm),
              ),
          );

          if (matchingTerms.length > 0) {
            console.log(
              `🔍 Found matching business terms: ${matchingTerms.join(", ")}`,
            );
            const termQuery = matchingTerms.map((term) => `%${term}%`);
            const termConditions = matchingTerms
              .map(
                (_, index) => `
              (c.chapter_title ILIKE $${index + 1} OR c.chapter_text ILIKE $${index + 1} OR b.title ILIKE $${index + 1})
            `,
              )
              .join(" OR ");

            textResult = await client.query(
              `
              SELECT 
                c.id,
                c.chapter_title,
                SUBSTRING(c.chapter_text, 1, 1000) AS chapter_text,
                c.book_id,
                b.title AS book_title,
                b.author_name,
                b.cover_url,
                b.isbn_13,
                0.55 AS similarity_score
              FROM chapters c
              JOIN books b ON c.book_id = b.id
              WHERE c.chapter_text IS NOT NULL 
                AND LENGTH(c.chapter_text) > 50
                AND (${termConditions})
              ORDER BY LENGTH(c.chapter_text) DESC
              LIMIT 15;
            `,
              termQuery,
            );

            results = textResult.rows;
            console.log(
              `🔍 Business terms search found: ${results.length} results`,
            );
          }

          // Last resort: return sample data for demonstration
          if (results.length === 0) {
            console.log(
              `🔍 No matches found, returning sample data for demonstration`,
            );

            textResult = await client.query(
              `
              SELECT 
                c.id,
                c.chapter_title,
                SUBSTRING(c.chapter_text, 1, 1000) AS chapter_text,
                c.book_id,
                b.title AS book_title,
                b.author_name,
                b.cover_url,
                b.isbn_13,
                0.50 AS similarity_score
              FROM chapters c
              JOIN books b ON c.book_id = b.id
              WHERE c.chapter_text IS NOT NULL 
                AND LENGTH(c.chapter_text) > 50
              ORDER BY c.id
              LIMIT 8;
            `,
            );

            results = textResult.rows;
            console.log(`🔍 Sample data returned: ${results.length} results`);
          }
        }
      }

      console.log(`🎯 Final results: ${results.length} chapter matches`);

      // Debug: Log the first few results
      if (results.length > 0) {
        console.log(`📖 Sample results:`);
        results.slice(0, 3).forEach((result, index) => {
          console.log(
            `  ${index + 1}. "${result.chapter_title}" from "${result.book_title}" (score: ${result.similarity_score})`,
          );
        });
      }

      // Group by books and enrich with AI
      const bookMap = new Map<
        number,
        { book: any; chapters: ChapterResult[] }
      >();

      results.forEach((result) => {
        const bookId = result.book_id;
        if (!bookMap.has(bookId)) {
          bookMap.set(bookId, {
            book: {
              id: bookId.toString(),
              title: result.book_title,
              author: result.author_name || "Unknown Author",
              cover:
                result.cover_url ||
                `https://via.placeholder.com/300x400/667eea/FFFFFF?text=${encodeURIComponent(result.book_title?.split(" ").slice(0, 3).join(" ") || "Book")}`,
              isbn: result.isbn_13 || "",
            },
            chapters: [],
          });
        }
        bookMap.get(bookId)!.chapters.push(result);
      });

      // Process top 10 chapters with AI enrichment
      const allChapters = Array.from(bookMap.values()).flatMap(
        ({ chapters }) => chapters,
      );
      const top10Chapters = allChapters
        .sort((a, b) => b.similarity_score - a.similarity_score)
        .slice(0, 10);

      console.log(
        `🧠 Enriching top ${top10Chapters.length} chapters with AI...`,
      );

      // Enrich chapters in parallel
      const enrichedChapters = await Promise.all(
        top10Chapters.map(async (chapter) => {
          try {
            const enrichment = await enrichChapterWithAI(chapter, query.trim());
            return enrichment;
          } catch (error) {
            console.error(
              `Error enriching chapter ${chapter.id}:`,
              error.message,
            );
            return createFallbackEnrichment(chapter, query.trim());
          }
        }),
      );

      // Group enriched chapters by book
      const finalBookGroups: BookGroup[] = [];
      const bookGroupMap = new Map<string, BookGroup>();

      enrichedChapters.forEach((enrichedChapter) => {
        const bookData = bookMap.get(
          top10Chapters.find((c) => c.id === enrichedChapter.id)!.book_id,
        )!.book;

        if (!bookGroupMap.has(bookData.id)) {
          bookGroupMap.set(bookData.id, {
            ...bookData,
            topChapters: [],
            averageRelevance: 0,
          });
        }

        bookGroupMap.get(bookData.id)!.topChapters.push(enrichedChapter);
      });

      // Calculate average relevance and finalize
      Array.from(bookGroupMap.values()).forEach((bookGroup) => {
        bookGroup.averageRelevance = Math.round(
          bookGroup.topChapters.reduce(
            (sum, ch) => sum + ch.relevanceScore,
            0,
          ) / bookGroup.topChapters.length,
        );
        finalBookGroups.push(bookGroup);
      });

      // Sort by average relevance
      finalBookGroups.sort((a, b) => b.averageRelevance - a.averageRelevance);

      const processingTime = Date.now() - startTime;
      console.log(
        `✅ Database search complete: ${finalBookGroups.length} books, ${enrichedChapters.length} chapters (${processingTime}ms)`,
      );

      res.json({
        query: query.trim(),
        totalBooks: finalBookGroups.length,
        totalChapters: enrichedChapters.length,
        books: finalBookGroups,
        searchType: useVectorSearch
          ? "ai_vector_search"
          : "enhanced_text_search",
        processingTime,
        averageRelevance:
          finalBookGroups.length > 0
            ? Math.round(
                finalBookGroups.reduce(
                  (sum, book) => sum + book.averageRelevance,
                  0,
                ) / finalBookGroups.length,
              )
            : 0,
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error("🚨 Database search error:", error);
    res.status(500).json({
      error: "Database search failed",
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
});

// AI enrichment for chapters
async function enrichChapterWithAI(
  chapter: ChapterResult,
  userQuery: string,
): Promise<EnrichedChapter> {
  const openaiClient = getOpenAIClient();

  if (!openaiClient) {
    console.log("❌ No OpenAI client available, using fallback enrichment");
    return createFallbackEnrichment(chapter, userQuery);
  }

  const enrichmentPrompt = `Analyze this chapter content for a user searching for "${userQuery}":

Title: "${chapter.chapter_title}"
Content: "${chapter.chapter_text.substring(0, 800)}"

Provide a JSON response with:
{
  "relevanceScore": number (25-100, how relevant this is to "${userQuery}"),
  "whyRelevant": "One sentence explaining why this chapter helps with ${userQuery}",
  "keyTopics": ["topic1", "topic2", "topic3"] (3-5 key topics),
  "coreLeadershipPrinciples": ["principle1", "principle2"] (2-3 principles if applicable),
  "practicalApplications": ["application1", "application2"] (2-3 practical steps)
}`;

  try {
    console.log(`🧠 AI enriching chapter: "${chapter.chapter_title}"`);
    const response = await openaiClient.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert content analyst. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: enrichmentPrompt,
        },
      ],
      max_tokens: 400,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content?.trim();
    const aiResult = JSON.parse(content || "{}");

    return {
      id: chapter.id,
      title: chapter.chapter_title,
      snippet: chapter.chapter_text.substring(0, 300),
      relevanceScore: Math.max(
        25,
        Math.min(100, aiResult.relevanceScore || 75),
      ),
      whyRelevant:
        aiResult.whyRelevant ||
        `This chapter provides insights relevant to ${userQuery}.`,
      keyTopics: Array.isArray(aiResult.keyTopics)
        ? aiResult.keyTopics.slice(0, 5)
        : [],
      coreLeadershipPrinciples: Array.isArray(aiResult.coreLeadershipPrinciples)
        ? aiResult.coreLeadershipPrinciples.slice(0, 3)
        : [],
      practicalApplications: Array.isArray(aiResult.practicalApplications)
        ? aiResult.practicalApplications.slice(0, 3)
        : [],
    };
  } catch (error) {
    console.warn("❌ AI enrichment failed, using fallback:", error.message);
    return createFallbackEnrichment(chapter, userQuery);
  }
}

// Fallback enrichment
function createFallbackEnrichment(
  chapter: ChapterResult,
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
    whyRelevant: `This chapter contains valuable insights related to ${userQuery} with practical frameworks and strategies.`,
    keyTopics: extractBasicTopics(chapter.chapter_text, userQuery),
    coreLeadershipPrinciples: generateBasicPrinciples(userQuery),
    practicalApplications: generateBasicApplications(userQuery),
  };
}

function extractBasicTopics(text: string, query: string): string[] {
  const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  const queryWords = query.split(/\s+/).map((w) => w.toLowerCase());
  const topics = new Set<string>();

  queryWords.forEach((word) => {
    if (word.length > 3) topics.add(word);
  });

  const commonTopics = [
    "leadership",
    "management",
    "strategy",
    "communication",
    "innovation",
    "performance",
    "development",
    "planning",
    "execution",
    "growth",
  ];

  commonTopics.forEach((topic) => {
    if (words.includes(topic)) {
      topics.add(topic);
    }
  });

  return Array.from(topics)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .slice(0, 4);
}

function generateBasicPrinciples(query: string): string[] {
  const principles = {
    leadership: ["Lead by example", "Empower others", "Take accountability"],
    negotiation: [
      "Prepare thoroughly",
      "Listen actively",
      "Seek win-win solutions",
    ],
    management: ["Set clear expectations", "Provide regular feedback"],
    productivity: ["Focus on priorities", "Eliminate distractions"],
    communication: ["Listen actively", "Be clear and concise", "Show empathy"],
  };

  const key = query.toLowerCase();
  for (const [termKey, termPrinciples] of Object.entries(principles)) {
    if (key.includes(termKey)) {
      return termPrinciples;
    }
  }

  return ["Take systematic approach", "Continuous improvement"];
}

function generateBasicApplications(query: string): string[] {
  return [
    `Apply ${query.toLowerCase()} techniques in daily practice`,
    `Develop a systematic approach to ${query.toLowerCase()}`,
    `Measure and track progress in ${query.toLowerCase()}`,
  ];
}

// Create sample database if tables don't exist
async function createSampleDatabase(client: Client) {
  console.log("🔧 Creating sample database structure...");

  // Create books table
  await client.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      author_name VARCHAR(200),
      cover_url VARCHAR(1000),
      isbn_13 VARCHAR(20),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create chapters table
  await client.query(`
    CREATE TABLE IF NOT EXISTS chapters (
      id SERIAL PRIMARY KEY,
      book_id INTEGER REFERENCES books(id),
      chapter_title VARCHAR(500) NOT NULL,
      chapter_text TEXT,
      vector_embedding vector(1536),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample books
  const sampleBooks = [
    {
      title: "Good to Great",
      author: "Jim Collins",
      cover_url: "https://covers.openlibrary.org/b/id/8739161-M.jpg",
      isbn: "9780066620992",
    },
    {
      title: "The 7 Habits of Highly Effective People",
      author: "Stephen R. Covey",
      cover_url: "https://covers.openlibrary.org/b/id/8231262-M.jpg",
      isbn: "9780743269513",
    },
    {
      title: "Getting to Yes: Negotiating Agreement Without Giving In",
      author: "Roger Fisher, William Ury",
      cover_url: "https://covers.openlibrary.org/b/id/8231262-M.jpg",
      isbn: "9780143118756",
    },
    {
      title: "Drive: The Surprising Truth About What Motivates Us",
      author: "Daniel H. Pink",
      cover_url: "https://covers.openlibrary.org/b/id/6836657-M.jpg",
      isbn: "9781594484803",
    },
  ];

  for (const book of sampleBooks) {
    const bookResult = await client.query(
      `INSERT INTO books (title, author_name, cover_url, isbn_13) VALUES ($1, $2, $3, $4) RETURNING id`,
      [book.title, book.author, book.cover_url, book.isbn],
    );

    const bookId = bookResult.rows[0].id;

    // Add sample chapters for each book
    const sampleChapters = getSampleChaptersForBook(book.title);

    for (const chapter of sampleChapters) {
      await client.query(
        `INSERT INTO chapters (book_id, chapter_title, chapter_text) VALUES ($1, $2, $3)`,
        [bookId, chapter.title, chapter.text],
      );
    }
  }

  console.log("✅ Sample database created successfully");
}

function getSampleChaptersForBook(bookTitle: string) {
  const chapters = {
    "Good to Great": [
      {
        title: "Level 5 Leadership",
        text: "Level 5 leaders are ambitious first and foremost for the cause, the organization, and its mission, not themselves. They have an almost stoic resolve to do absolutely whatever it takes to make the company great, channeling their ego needs away from themselves and into the larger goal of building a great company. Level 5 leaders display a compelling modesty, are self-effacing and understated. In contrast to the very I-centric style of comparison leaders, Level 5 leaders are incredibly ambitious—but their ambition is first and foremost for the institution and its greatness, not for themselves. The research shows that Level 5 leadership is not just about humility and modesty. Level 5 leaders demonstrate a paradoxical blend of personal humility and professional will. They are incredibly ambitious, but their ambition is first and foremost for the institution, not themselves.",
      },
      {
        title: "First Who, Then What",
        text: "The good-to-great leaders began the transformation by first getting the right people on the bus (and the wrong people off the bus) and then figured out where to drive it. They said, in essence, 'Look, I don't really know where we should take this bus. But I know this much: If we get the right people on the bus, the right people in the right seats, and the wrong people off the bus, then we'll figure out how to take it someplace great.' The comparison companies frequently followed the genius-with-a-thousand-helpers model—a genius leader who sets a vision and then enlists a crew of highly capable helpers to make the vision happen. The good-to-great companies avoided this trap. Instead, they first got the right people on the bus, the wrong people off the bus, and the right people in the right seats—and then they figured out where to drive it.",
      },
      {
        title: "Confront the Brutal Facts",
        text: "All good-to-great companies began the process of finding a path to greatness by confronting the brutal facts of their current reality. When you start with an honest and diligent effort to determine the truth of your situation, the right decisions often become self-evident. It is impossible to make good decisions without first confronting the brutal facts. This means creating a culture where the truth is heard and where the brutal facts are confronted. You must maintain unwavering faith that you can and will prevail in the end, regardless of the difficulties, AND at the same time have the discipline to confront the most brutal facts of your current reality, whatever they might be. This is a key aspect of what we came to call the Stockdale Paradox.",
      },
    ],
    "The 7 Habits of Highly Effective People": [
      {
        title: "Be Proactive",
        text: "Being proactive means taking responsibility for your life. You can't keep blaming everything on your parents or grandparents. Proactive people recognize that they are 'response-able.' They don't blame genetics, circumstances, conditions, or conditioning for their behavior. They know they choose their behavior. Reactive people, on the other hand, are often affected by their physical environment. When the weather is good, they feel good. When it isn't, it affects their attitude and performance. Proactive people carry their own weather with them. Whether it rains or shines makes no difference to them. They are value driven; and if their value is to produce good quality work, it isn't a function of whether the weather is conducive to it or not. The word proactivity is fairly common in management literature, but you won't find it in most dictionaries. It means more than merely taking initiative. It means that as human beings, we are responsible for our own lives.",
      },
      {
        title: "Begin with the End in Mind",
        text: "Begin with the End in Mind means to start with a clear understanding of your destination. It means to know where you're going so that you better understand where you are now and so that the steps you take are always in the right direction. It's incredibly easy to get caught up in an activity trap, in the busy-ness of life, to work harder and harder at climbing the ladder of success only to discover it's leaning against the wrong wall. It is possible to be busy—very busy—without being very effective. To begin with the End in Mind means to start with a clear understanding of your destination. It means to know where you're going so that you better understand where you are now and so that the steps you take are always in the right direction. How different our lives are when we really know what is deeply important to us, and, keeping that picture in mind, we manage ourselves each day to be and to do what really matters most.",
      },
      {
        title: "Put First Things First",
        text: "Put First Things First is the second creation, the physical creation. It's the fulfillment, the actualization, the natural emergence of Habits 1 and 2. It's the exercise of independent will toward becoming principle-centered. It's the day-in, day-out, moment-by-moment doing it. Habits 1 and 2 are absolutely essential and prerequisite to Habit 3. You can't become principle-centered without first being aware of and developing your own proactive nature and without first being aware of your paradigms and without a sense of your own unique mission. But with that foundation, you can become principle-centered, day-in and day-out, moment-by-moment, by living Habit 3—by practicing effective self-management.",
      },
    ],
    "Getting to Yes: Negotiating Agreement Without Giving In": [
      {
        title: "Separate the People from the Problem",
        text: "Negotiators are people first. Every negotiator has two kinds of interests: in the substance and in the relationship. And the relationship tends to become entangled with the problem. The basic approach to dealing with people problems is to separate the people from the problem. This allows you to deal directly and empathetically with the person, while addressing the problem with minimal emotional interference. Attack the problem, not the person. Put yourself in their shoes. Don't deduce their intentions from your fears. Don't blame them for your problem. Discuss each other's perceptions. Look for opportunities to act inconsistently with their perceptions. Give them a stake in the outcome by making sure they participate in the process. Face-saving: Make your proposals consistent with their values.",
      },
      {
        title: "Focus on Interests, Not Positions",
        text: "Your position is something you have decided upon. Your interests are what caused you to so decide. For a wise solution reconcile interests, not positions. Behind opposed positions lie shared and compatible interests, as well as conflicting ones. Identifying interests is not always easy. People tend to state their conclusions - their positions - rather than describe their underlying concerns. To understand interests, you need to think like a detective. Look at each position they take and ask yourself 'Why?' Why do they take this position? What are their underlying concerns? For every interest there usually exist several possible positions that could satisfy it. When you look behind positions for the motivating interests, you can often find an alternative position which meets not only your interests but theirs as well.",
      },
      {
        title: "Generate Options for Mutual Gain",
        text: "The third element of the method is to generate a variety of possibilities before deciding what to do. This is the creative step in the process where you broaden your options rather than look for a single answer. Generate options that advance shared interests and creatively reconcile differing interests. Look for mutual gains. Ask what if questions. Change the scope of the agreement. Look for trades across party lines. You can satisfy differing interests when those interests dovetail - like a buyer who wants prompt delivery and a seller who wants prompt payment. Shared interests lie latent in every negotiation. They may not be immediately obvious. Look for items that are of low cost to you and high benefit to them, and vice versa. Differences in interests and priorities can be used to create value.",
      },
      {
        title: "Use Objective Criteria",
        text: "When interests are directly opposed, you may be able to resolve the difference fairly by using objective criteria independent of the will of either side. This means seeking a solution based on objective standards such as market value, expert opinion, custom, or law. By discussing such criteria rather than what the parties are willing or unwilling to do, neither party need give in to the other; both can defer to a fair solution. The more you bring standards of fairness, efficiency, or scientific merit to bear on your particular problem, the more likely you are to produce a final package that is wise and fair. Using objective criteria also makes your negotiation less of a contest of will and more of a joint search for a fair solution.",
      },
    ],
    "Drive: The Surprising Truth About What Motivates Us": [
      {
        title: "The Three Elements of True Motivation",
        text: "Human beings have an innate inner drive to be autonomous, self-determined, and connected to one another. And when that drive is liberated, people achieve more and live richer lives. The three elements of true motivation are: Autonomy - the desire to direct our own lives; Mastery - the urge to get better and better at something that matters; and Purpose - the yearning to do what we do in the service of something larger than ourselves. These three elements, completely ignored by the if-then rewards system, are the building blocks of an entirely new operating system for our businesses, our lives, our world. Type I behavior, a way of thinking and approach to life built around intrinsic rather than extrinsic motivators, is made possible by three innate psychological needs—competence, autonomy, and relatedness.",
      },
      {
        title: "Autonomy: The First Element",
        text: "Management is great if you want compliance. But if you want engagement, self-direction works better. The good news is that the ingredients of autonomous motivation are already present in most workplaces. The bad news is that many businesses haven't recognized this fact and still operate under assumptions of Theory X. True autonomous motivation involves four essential aspects: autonomy over task, time, technique, and team. Autonomy over task means having discretion over what you do. Autonomy over time means having flexibility over when you do it. Autonomy over technique means having control over how you do it. And autonomy over team means having a say over whom you do it with. Companies that offer autonomy, sometimes in radical doses, are outperforming their more controlling counterparts.",
      },
      {
        title: "Mastery: The Second Element",
        text: "Mastery is the desire to get better and better at something that matters. The science shows that mastery has three peculiar qualities. Mastery is a mindset: It requires the capacity to see your abilities not as finite, but as infinitely improvable. Mastery is a pain: It demands effort, grit, and deliberate practice. And mastery is an asymptote: It's impossible to fully realize, which makes it simultaneously frustrating and alluring. The most successful people, the evidence reveals, often aren't directly pursuing conventional notions of success. They're working hard and persisting through difficulties because of their internal desire to control their lives, learn about their world, and accomplish something that endures.",
      },
    ],
  };

  return (
    chapters[bookTitle as keyof typeof chapters] || [
      {
        title: "Sample Chapter",
        text: "This is a sample chapter with relevant content for business and leadership topics.",
      },
    ]
  );
}

export default router;

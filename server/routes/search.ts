import { Router } from "express";
import { Client } from "pg";

const router = Router();

interface DatabaseSearchResult {
  chapter_title: string;
  chapter_text_snippet: string;
  book_title: string;
  author_name: string;
  cover_url: string;
  isbn_13: string;
  distance: number;
  chapter_number?: number;
}

interface FormattedChapterMatch {
  chapter: string;
  title: string;
  pages: string;
  relevance: string;
  relevanceScore: number;
  keyTopics: string[];
  why: string;
}

interface FormattedBook {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  amazonLink: string;
  rating?: number;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  isbn?: string;
  relevantChapters?: FormattedChapterMatch[];
  chapterRelevanceScore?: number;
}

// Placeholder function to simulate sentence-transformers
function generateQueryEmbedding(query: string): number[] {
  const vector = [];
  for (let i = 0; i < 384; i++) {
    vector.push((Math.random() - 0.5) * 2);
  }
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => val / magnitude);
}

// Database search endpoint
router.get("/", async (req, res) => {
  try {
    const { q: query } = req.query;

    if (!query || typeof query !== "string" || query.trim() === "") {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    // Generate query embedding
    const queryEmbedding = generateQueryEmbedding(query.trim());

    // Connect to database
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });

    await client.connect();

    try {
      const embeddingString = `[${queryEmbedding.join(",")}]`;

      const result = await client.query(
        `
        SELECT 
          c.id as chapter_id,
          c.chapter_number,
          c.chapter_title, 
          SUBSTRING(c.chapter_text, 1, 500) AS chapter_text_snippet,
          b.id as book_id,
          b.title AS book_title,
          b.author_name,
          b.cover_url,
          b.isbn_13,
          b.summary as book_description,
          b.publication_year,
          b.genres,
          c.vector_embedding <=> $1::vector AS distance
        FROM chapters c
        JOIN books b ON c.book_id = b.id
        WHERE c.chapter_text IS NOT NULL 
          AND c.vector_embedding IS NOT NULL
          AND b.title IS NOT NULL
        ORDER BY distance ASC
        LIMIT 15;
      `,
        [embeddingString],
      );

      // Group results by book
      const bookMap = new Map<
        string,
        {
          book: Partial<FormattedBook>;
          chapters: DatabaseSearchResult[];
        }
      >();

      result.rows.forEach((row) => {
        const bookId = row.book_id.toString();

        if (!bookMap.has(bookId)) {
          bookMap.set(bookId, {
            book: {
              id: bookId,
              title: row.book_title,
              author: row.author_name || "Unknown Author",
              cover:
                row.cover_url ||
                `https://via.placeholder.com/300x400/4361EE/FFFFFF?text=${encodeURIComponent(row.book_title?.split(" ").slice(0, 3).join(" ") || "Book")}`,
              description: row.book_description || "",
              amazonLink: `https://www.amazon.com/s?k=${encodeURIComponent(row.book_title)}${row.isbn_13 ? `+${row.isbn_13}` : ""}&tag=summifyai-20`,
              publishedDate: row.publication_year?.toString(),
              isbn: row.isbn_13,
              categories: row.genres || [],
              relevantChapters: [],
            },
            chapters: [],
          });
        }

        bookMap.get(bookId)!.chapters.push({
          chapter_title: row.chapter_title || "Untitled Chapter",
          chapter_text_snippet: row.chapter_text_snippet || "",
          book_title: row.book_title,
          author_name: row.author_name || "Unknown Author",
          cover_url: row.cover_url,
          isbn_13: row.isbn_13,
          distance: parseFloat(row.distance) || 1.0,
          chapter_number: row.chapter_number,
        });
      });

      // Format results for frontend compatibility
      const formattedBooks: FormattedBook[] = [];

      bookMap.forEach(({ book, chapters }) => {
        const relevantChapters: FormattedChapterMatch[] = chapters
          .slice(0, 3)
          .map((chapter, index) => {
            const relevanceScore = Math.max(
              10,
              Math.round((1 - chapter.distance) * 100),
            );

            return {
              chapter: chapter.chapter_number
                ? `Chapter ${chapter.chapter_number}`
                : `Section ${index + 1}`,
              title: chapter.chapter_title,
              pages: "1-20", // Placeholder - would need actual page numbers from database
              relevance: `${relevanceScore}% relevant to "${query}"`,
              relevanceScore,
              keyTopics: extractKeyTopics(chapter.chapter_text_snippet, query),
              why: generateWhyExplanation(
                chapter.chapter_text_snippet,
                query,
                chapter.chapter_title,
              ),
            };
          });

        if (relevantChapters.length > 0) {
          const avgScore =
            relevantChapters.reduce((sum, ch) => sum + ch.relevanceScore, 0) /
            relevantChapters.length;

          formattedBooks.push({
            ...book,
            relevantChapters,
            chapterRelevanceScore: avgScore,
          } as FormattedBook);
        }
      });

      // Sort by average chapter relevance score
      formattedBooks.sort(
        (a, b) =>
          (b.chapterRelevanceScore || 0) - (a.chapterRelevanceScore || 0),
      );

      res.json({
        books: formattedBooks.slice(0, 10),
        totalResults: formattedBooks.length,
        query: query.trim(),
      });
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error("Database search error:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
});

// Helper functions
function extractKeyTopics(text: string, query: string): string[] {
  const queryWords = query.toLowerCase().split(/\s+/);
  const words = text.toLowerCase().split(/\W+/);

  const topics = new Set<string>();
  queryWords.forEach((qWord) => {
    if (qWord.length > 3) {
      words.forEach((word) => {
        if (word.includes(qWord) || qWord.includes(word)) {
          topics.add(word.charAt(0).toUpperCase() + word.slice(1));
        }
      });
    }
  });

  // Add some general topics based on common patterns
  const generalTopics = [
    "Leadership",
    "Strategy",
    "Communication",
    "Management",
    "Development",
    "Skills",
    "Performance",
    "Innovation",
  ];

  const result = Array.from(topics).slice(0, 3);
  while (result.length < 3 && generalTopics.length > 0) {
    const topic = generalTopics.shift()!;
    if (!result.includes(topic)) {
      result.push(topic);
    }
  }

  return result;
}

function generateWhyExplanation(
  text: string,
  query: string,
  chapterTitle: string,
): string {
  const snippets = [
    `This chapter provides practical insights into ${query.toLowerCase()} through detailed examples and frameworks.`,
    `"${chapterTitle}" directly addresses key aspects of ${query.toLowerCase()} with actionable strategies.`,
    `The content explores fundamental principles of ${query.toLowerCase()} that can be immediately applied.`,
    `This section offers valuable perspectives on ${query.toLowerCase()} backed by research and real-world applications.`,
  ];

  return snippets[Math.floor(Math.random() * snippets.length)];
}

export default router;

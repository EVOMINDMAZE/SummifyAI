import { Handler } from "@netlify/functions";
import { Client } from "pg";

// Note: In production, sentence-transformers would need to be available
// For now, we'll use a placeholder that generates random vectors
// In a real deployment, you'd need to configure Python dependencies

interface SearchResult {
  chapter_title: string;
  chapter_text_snippet: string;
  book_title: string;
  author_name: string;
  cover_url: string;
  isbn_13: string;
  distance: number;
}

// Placeholder function to simulate sentence-transformers
// In production, this would use the actual sentence-transformers library
function generateQueryEmbedding(query: string): number[] {
  // For now, generate a normalized random vector of 384 dimensions
  // This is just for demonstration - real implementation would use sentence-transformers
  const vector = [];
  for (let i = 0; i < 384; i++) {
    vector.push((Math.random() - 0.5) * 2);
  }

  // Normalize the vector
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  return vector.map((val) => val / magnitude);
}

export const handler: Handler = async (event) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  // Handle OPTIONS request for CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    // Extract query parameter
    const query = event.queryStringParameters?.q;

    if (!query || query.trim() === "") {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Query parameter "q" is required' }),
      };
    }

    // Generate query embedding
    // Note: In production, this would use sentence-transformers
    const queryEmbedding = generateQueryEmbedding(query.trim());

    // Connect to Neon database
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await client.connect();

    try {
      // Execute vector search query
      // Note: The embedding array needs to be formatted properly for PostgreSQL
      const embeddingString = `[${queryEmbedding.join(",")}]`;

      const result = await client.query(
        `
        SELECT 
          c.chapter_title, 
          SUBSTRING(c.chapter_text, 1, 300) AS chapter_text_snippet,
          b.title AS book_title,
          b.author_name,
          b.cover_url,
          b.isbn_13,
          c.vector_embedding <=> $1::vector AS distance
        FROM chapters c
        JOIN books b ON c.book_id = b.id
        WHERE c.chapter_text IS NOT NULL 
          AND c.vector_embedding IS NOT NULL
          AND b.title IS NOT NULL
        ORDER BY distance ASC
        LIMIT 10;
      `,
        [embeddingString],
      );

      // Format results
      const searchResults: SearchResult[] = result.rows.map((row) => ({
        chapter_title: row.chapter_title || "Untitled Chapter",
        chapter_text_snippet: row.chapter_text_snippet || "",
        book_title: row.book_title,
        author_name: row.author_name || "Unknown Author",
        cover_url:
          row.cover_url ||
          `https://via.placeholder.com/300x400/4361EE/FFFFFF?text=${encodeURIComponent(row.book_title?.split(" ").slice(0, 3).join(" ") || "Book")}`,
        isbn_13: row.isbn_13 || "",
        distance: parseFloat(row.distance) || 1.0,
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(searchResults),
      };
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error("Search error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      }),
    };
  }
};

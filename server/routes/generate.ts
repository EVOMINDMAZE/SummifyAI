import { Request, Response } from "express";
import { Pool } from "pg";
import { bookSearchService } from "../services/bookSearchService";
import { aiService } from "../services/aiService";

// Database connection (reuse from neon.ts)
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

console.log(
  "Database URL status:",
  process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL
    ? "Found"
    : "Missing",
);

interface GenerateRequest {
  topic: string;
  userId: number;
  maxBooks?: number;
}

interface GeneratedResult {
  id: string;
  topic: string;
  books: any[];
  summary: string;
  keyInsights: string[];
  quotes: string[];
  generatedAt: string;
  userId: number;
}

// Store active generation sessions for progress tracking
const activeSessions = new Map<string, any>();

export async function handleGenerateStart(req: Request, res: Response) {
  try {
    const { topic, userId, maxBooks = 5 }: GenerateRequest = req.body;

    console.log("Generate request:", { topic, userId, maxBooks });

    if (!topic || !userId) {
      return res.status(400).json({
        error: "Topic and userId are required",
      });
    }

    // Validate user and check query limits
    const client = await pool.connect();
    try {
      const userResult = await client.query(
        "SELECT * FROM users WHERE id = $1",
        [userId],
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = userResult.rows[0];

      // Check query limits for free users
      if (user.tier === "free" && user.queries_used >= user.query_limit) {
        return res.status(429).json({
          error: "Query limit reached",
          message: "Please upgrade to premium for unlimited searches",
        });
      }

      // Generate unique session ID
      const sessionId = `gen_${Date.now()}_${userId}`;

      // Store session info
      activeSessions.set(sessionId, {
        topic,
        userId,
        startTime: Date.now(),
        progress: 0,
        status: "starting",
      });

      // Start async generation process
      generateAsync(sessionId, topic, userId, maxBooks);

      // Return session ID for progress tracking
      res.json({
        sessionId,
        message: "Generation started",
        estimatedTime: 30, // seconds
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Generate start error:", error);
    res.status(500).json({
      error: "Failed to start generation",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function handleGenerateProgress(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;

    const session = activeSessions.get(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({
      sessionId,
      progress: session.progress,
      status: session.status,
      currentOperation: session.currentOperation,
      estimatedTimeLeft: session.estimatedTimeLeft,
      result: session.result,
    });
  } catch (error) {
    console.error("Progress check error:", error);
    res.status(500).json({
      error: "Failed to get progress",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function generateAsync(
  sessionId: string,
  topic: string,
  userId: number,
  maxBooks: number,
) {
  const client = await pool.connect();

  try {
    // Update session progress
    const updateProgress = (
      progress: number,
      operation: string,
      timeLeft?: number,
    ) => {
      const session = activeSessions.get(sessionId);
      if (session) {
        session.progress = progress;
        session.currentOperation = operation;
        session.estimatedTimeLeft = timeLeft;
        session.status = progress >= 100 ? "completed" : "processing";
      }
    };

    updateProgress(5, "Initializing search...", 25);

    // Step 1: Search for books
    updateProgress(10, "Searching for relevant books...", 20);
    const books = await bookSearchService.searchBooks(topic, maxBooks);

    updateProgress(30, "Books found, analyzing content...", 15);

    // Step 2: Generate AI summary
    const aiResult = await aiService.generateSummary(
      topic,
      books,
      (progress, operation) => {
        updateProgress(
          30 + progress * 0.6,
          operation,
          Math.max(5, 20 - progress * 0.2),
        );
      },
    );

    updateProgress(95, "Saving results...", 2);

    // Step 3: Save to database
    const summaryData = {
      topic,
      books,
      summary: aiResult.summary,
      keyInsights: aiResult.keyInsights,
      quotes: aiResult.quotes,
      generatedAt: new Date().toISOString(),
      userId,
    };

    const insertResult = await client.query(
      `INSERT INTO summaries (user_id, topic, content, key_insights, quotes, books_data, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
       RETURNING id`,
      [
        userId,
        topic,
        aiResult.summary,
        JSON.stringify(aiResult.keyInsights),
        JSON.stringify(aiResult.quotes),
        JSON.stringify(books),
      ],
    );

    const summaryId = insertResult.rows[0].id;

    // Update user query count
    await client.query(
      "UPDATE users SET queries_used = queries_used + 1 WHERE id = $1",
      [userId],
    );

    updateProgress(100, "Generation complete!", 0);

    // Store final result
    const session = activeSessions.get(sessionId);
    if (session) {
      session.result = {
        id: summaryId,
        ...summaryData,
      };

      // Clean up session after 5 minutes
      setTimeout(
        () => {
          activeSessions.delete(sessionId);
        },
        5 * 60 * 1000,
      );
    }
  } catch (error) {
    console.error("Generation error:", error);

    const session = activeSessions.get(sessionId);
    if (session) {
      session.status = "error";
      session.error = error instanceof Error ? error.message : "Unknown error";
    }
  } finally {
    client.release();
  }
}

export async function handleGetRecentSummaries(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT id, topic, content, key_insights, quotes, books_data, created_at 
         FROM summaries 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2`,
        [userId, limit],
      );

      const summaries = result.rows.map((row) => ({
        id: row.id,
        topic: row.topic,
        summary: row.content,
        keyInsights: JSON.parse(row.key_insights || "[]"),
        quotes: JSON.parse(row.quotes || "[]"),
        books: JSON.parse(row.books_data || "[]"),
        generatedAt: row.created_at,
        userId: parseInt(userId),
      }));

      res.json({ summaries });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get summaries error:", error);
    res.status(500).json({
      error: "Failed to get summaries",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

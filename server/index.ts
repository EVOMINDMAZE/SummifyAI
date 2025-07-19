import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";

// Load environment variables first
dotenv.config();
import { handleDemo } from "./routes/demo";
import {
  handleNeonExecute,
  handleUserSignIn,
  handleUserSignUp,
  handleGetUserSummaries,
  handleUpdateCredits,
  handleRecordShare,
  handleUpdateUserSettings,
} from "./routes/neon";
import {
  handleGenerateStart,
  handleGenerateProgress,
  handleGetRecentSummaries,
} from "./routes/generate";
import { handleTopicAnalysis } from "./routes/topicAnalysis";
import {
  handleSubmitRating,
  handleGetRatingStats,
  handleGetUserRating,
  handleGetTopRatedChapters,
} from "./routes/ratings";
import searchRoutes from "./routes/search";

export function createServer() {
  const app = express();

  // Rate limiting for API endpoints
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use("/api/", limiter);

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  // Debug endpoint to check API key status
  app.get("/api/debug/keys", (_req, res) => {
    res.json({
      openai: process.env.OPENAI_API_KEY
        ? process.env.OPENAI_API_KEY.includes("demo")
          ? "demo"
          : "real"
        : "missing",
      googleBooks: process.env.GOOGLE_BOOKS_API_KEY
        ? process.env.GOOGLE_BOOKS_API_KEY.includes("demo")
          ? "demo"
          : "real"
        : "missing",
      database:
        process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL
          ? "configured"
          : "missing",
    });
  });

  // Fix database schema endpoint
  app.post("/api/debug/fix-schema", async (_req, res) => {
    try {
      const { Pool } = await import("pg");
      const pool = new Pool({
        connectionString:
          process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });

      const client = await pool.connect();
      try {
        // Drop existing columns with wrong types and recreate with correct types
        await client.query(`
          ALTER TABLE summaries
          DROP COLUMN IF EXISTS key_insights,
          DROP COLUMN IF EXISTS quotes,
          DROP COLUMN IF EXISTS books_data
        `);

        await client.query(`
          ALTER TABLE summaries
          ADD COLUMN key_insights JSONB DEFAULT '[]',
          ADD COLUMN quotes JSONB DEFAULT '[]',
          ADD COLUMN books_data JSONB DEFAULT '[]'
        `);

        res.json({ message: "Schema updated successfully" });
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Schema fix failed",
      });
    }
  });

  // Debug endpoint to check database tables
  app.get("/api/debug/tables", async (_req, res) => {
    try {
      const { Pool } = await import("pg");
      const pool = new Pool({
        connectionString:
          process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      });

      const client = await pool.connect();
      try {
        const tablesResult = await client.query(`
          SELECT table_name
          FROM information_schema.tables
          WHERE table_schema = 'public'
        `);

        const summariesColumns = await client.query(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'summaries'
          ORDER BY ordinal_position
        `);

        const usersExist = await client.query(`
          SELECT COUNT(*) as count FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'users'
        `);

        let userCount = 0;
        if (parseInt(usersExist.rows[0].count) > 0) {
          const userCountResult = await client.query(
            "SELECT COUNT(*) as count FROM users",
          );
          userCount = parseInt(userCountResult.rows[0].count);
        }

        res.json({
          tables: tablesResult.rows.map((r) => r.table_name),
          usersTableExists: parseInt(usersExist.rows[0].count) > 0,
          userCount,
          summariesColumns: summariesColumns.rows,
        });
      } finally {
        client.release();
      }
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Database check failed",
      });
    }
  });

  app.get("/api/demo", handleDemo);

  // Neon database routes
  app.post("/api/neon/execute", handleNeonExecute);
  app.post("/api/auth/signin", handleUserSignIn);
  app.post("/api/auth/signup", handleUserSignUp);
  app.get("/api/users/:userId/summaries", handleGetUserSummaries);
  app.post("/api/users/:userId/credits", handleUpdateCredits);
  app.put("/api/users/:userId/settings", handleUpdateUserSettings);
  app.post("/api/shares", handleRecordShare);

  // Generation API routes
  app.post("/api/generate/start", handleGenerateStart);
  app.get("/api/generate/progress/:sessionId", handleGenerateProgress);
  app.get("/api/users/:userId/recent-summaries", handleGetRecentSummaries);

  // Topic analysis route
  app.post("/api/topic/analyze", handleTopicAnalysis);

  // Rating routes
  app.post("/api/ratings", handleSubmitRating);
  app.get("/api/ratings/:bookId/:chapterId", handleGetRatingStats);
  app.get("/api/ratings/user/:userId/:bookId/:chapterId", handleGetUserRating);
  app.get("/api/ratings/top/:searchTopic", handleGetTopRatedChapters);

  return app;
}

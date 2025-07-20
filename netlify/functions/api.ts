import { Handler } from "@netlify/functions";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Import route handlers directly to avoid ES module issues
import searchRoutes from "../../server/routes/search.js";
import enrichRoutes from "../../server/routes/enrich.js";
import queryAnalysisRoutes from "../../server/routes/queryAnalysis.js";
import databaseSearchRoutes from "../../server/routes/databaseSearch.js";

// Load environment variables for serverless function
dotenv.config();

// Log environment status for debugging
console.log("Environment check:", {
  DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Missing",
  NETLIFY_DATABASE_URL: process.env.NETLIFY_DATABASE_URL ? "Set" : "Missing",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "Set" : "Missing",
  GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY ? "Set" : "Missing",
});

// Create Express app directly without using createServer
function createApp() {
  const app = express();

  // Trust proxy for rate limiting
  app.set("trust proxy", 1);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
    });
  });

  // API routes
  app.use("/search", searchRoutes);
  app.use("/enrich", enrichRoutes);
  app.use("/topic", queryAnalysisRoutes);
  app.use("/database", databaseSearchRoutes);

  // Fallback for unknown routes
  app.use("*", (req, res) => {
    res.status(404).json({
      error: "API route not found",
      path: req.originalUrl,
      availableRoutes: ["/health", "/search", "/enrich", "/topic", "/database"],
    });
  });

  return app;
}

// Use serverless-http to wrap the Express app
import serverless from "serverless-http";
export const handler = serverless(createApp());

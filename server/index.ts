import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Import properly structured routes (that export Express routers)
import searchRoutes from "./routes/search.js";
import enrichRoutes from "./routes/enrich.js";
import queryAnalysisRoutes from "./routes/queryAnalysis.js";
import databaseSearchRoutes from "./routes/databaseSearch.js";

// Import individual handlers
import { handleDemo } from "./routes/demo.js";
import { handleNeonExecute } from "./routes/neon.js";
import { handleSubmitRating } from "./routes/ratings.js";

// Load environment variables
dotenv.config();

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // limit each IP to 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api", limiter);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      database: process.env.DATABASE_URL ? "configured" : "missing",
      openai: process.env.OPENAI_API_KEY ? "configured" : "missing",
    });
  });

  // Router-based routes
  app.use("/api/search", searchRoutes);
  app.use("/api/enrich", enrichRoutes);
  app.use("/api/topic", queryAnalysisRoutes);
  app.use("/api/database", databaseSearchRoutes);

  // Individual handler routes
  app.get("/api/demo", handleDemo);
  app.post("/api/neon/execute", handleNeonExecute);
  app.post("/api/ratings/submit", handleSubmitRating);

  // Error handling middleware
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("Server error:", err);
      res.status(500).json({
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    },
  );

  // 404 handler
  app.use("*", (req, res) => {
    res.status(404).json({
      error: "Route not found",
      path: req.originalUrl,
    });
  });

  return app;
}

// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const app = createServer();
  const port = parseInt(process.env.PORT || "8080");

  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(
      `🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? "configured" : "MISSING"}`,
    );
    console.log(
      `💾 Database: ${process.env.DATABASE_URL ? "configured" : "MISSING"}`,
    );
  });
}

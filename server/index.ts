import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
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

// Load environment variables
dotenv.config();

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

  return app;
}

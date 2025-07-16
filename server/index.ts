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

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

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

  return app;
}

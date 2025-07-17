import serverless from "serverless-http";
import dotenv from "dotenv";

import { createServer } from "../../server";

// Load environment variables for serverless function
dotenv.config();

// Log environment status for debugging
console.log("Environment check:", {
  DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Missing",
  NETLIFY_DATABASE_URL: process.env.NETLIFY_DATABASE_URL ? "Set" : "Missing",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "Set" : "Missing",
  GOOGLE_BOOKS_API_KEY: process.env.GOOGLE_BOOKS_API_KEY ? "Set" : "Missing",
});

export const handler = serverless(createServer());

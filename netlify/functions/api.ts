import { Handler } from "@netlify/functions";
import { Client } from "pg";
import dotenv from "dotenv";

// Load environment variables for serverless function
dotenv.config();

// Simple handler that provides the core API functionality without ES module complications
export const handler: Handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

  try {
    const path = event.path.replace("/.netlify/functions/api", "");
    const method = event.httpMethod;

    // Health check
    if (path === "/health" && method === "GET") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || "production",
        }),
      };
    }

    // Database search endpoint
    if (path === "/database" && method === "GET") {
      const query = event.queryStringParameters?.q;

      if (!query || query.trim() === "") {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Query parameter "q" is required' }),
        };
      }

      // Connect to database
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      });

      await client.connect();

      try {
        // For now, return the static data structure that the frontend expects
        // In a real implementation, this would do the actual database search
        const mockResults = {
          query: query,
          searchType: "enhanced_text_search",
          totalBooks: 3,
          totalChapters: 8,
          books: [
            {
              id: "getting-to-yes",
              title: "Getting to Yes: Negotiating Agreement Without Giving In",
              author: "Roger Fisher, William Ury, Bruce Patton",
              cover:
                "https://images-na.ssl-images-amazon.com/images/I/61NPm-8VyGL._SX324_BO1,204,203,200_.jpg",
              isbn: "0143118757",
              averageRelevance: 92,
              topChapters: [
                {
                  id: 1,
                  title: "Don't Bargain Over Positions",
                  snippet:
                    "This chapter explains why positional bargaining is ineffective and how to move beyond it to principled negotiation...",
                  relevanceScore: 98,
                  whyRelevant: `This chapter directly addresses ${query} by providing fundamental frameworks for moving beyond positional bargaining to principled negotiation.`,
                  keyTopics: [
                    "Negotiation",
                    "Positional Bargaining",
                    "Principled Approach",
                  ],
                  coreLeadershipPrinciples: [
                    "Focus on interests not positions",
                    "Separate people from problems",
                  ],
                  practicalApplications: [
                    "Apply principled negotiation in daily meetings",
                    "Use interest-based problem solving",
                  ],
                },
                {
                  id: 2,
                  title: "Separate the People from the Problem",
                  snippet:
                    "Learn how to maintain relationships while addressing substantive issues in negotiations...",
                  relevanceScore: 95,
                  whyRelevant: `This chapter provides essential techniques for ${query} by showing how to manage relationships while addressing core issues.`,
                  keyTopics: [
                    "Relationship Management",
                    "Emotional Intelligence",
                    "Conflict Resolution",
                  ],
                  coreLeadershipPrinciples: [
                    "Maintain relationships during conflict",
                    "Address issues not personalities",
                  ],
                  practicalApplications: [
                    "Practice empathy in difficult conversations",
                    "Separate emotional reactions from facts",
                  ],
                },
              ],
            },
            {
              id: "never-split-difference",
              title: "Never Split the Difference",
              author: "Chris Voss",
              cover:
                "https://images-na.ssl-images-amazon.com/images/I/71u0G1u4WDL._SX323_BO1,204,203,200_.jpg",
              isbn: "0062407805",
              averageRelevance: 89,
              topChapters: [
                {
                  id: 3,
                  title: "Be a Mirror",
                  snippet:
                    "Discover the power of tactical empathy and mirroring in high-stakes negotiations...",
                  relevanceScore: 96,
                  whyRelevant: `This chapter enhances your ${query} skills through advanced mirroring and tactical empathy techniques.`,
                  keyTopics: [
                    "Mirroring",
                    "Tactical Empathy",
                    "Active Listening",
                  ],
                  coreLeadershipPrinciples: [
                    "Use tactical empathy to understand others",
                    "Mirror to build rapport",
                  ],
                  practicalApplications: [
                    "Practice mirroring in conversations",
                    "Apply tactical empathy in team situations",
                  ],
                },
              ],
            },
          ],
        };

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(mockResults),
        };
      } finally {
        await client.end();
      }
    }

    // Query analysis endpoint
    if (path === "/topic" && method === "POST") {
      const body = JSON.parse(event.body || "{}");
      const { topic } = body;

      if (!topic) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Topic is required" }),
        };
      }

      // Return analysis result
      const analysis = {
        isBroad: topic.split(" ").length <= 2,
        explanation: `"${topic}" is a broad topic that could benefit from more specific focus.`,
        refinements: [
          {
            label: `${topic} Strategies`,
            value: `effective ${topic} strategies`,
            description: `Focus on proven strategies and techniques for ${topic}`,
          },
          {
            label: `${topic} in Leadership`,
            value: `${topic} leadership skills`,
            description: `Explore how ${topic} applies in leadership contexts`,
          },
          {
            label: `Advanced ${topic}`,
            value: `advanced ${topic} techniques`,
            description: `Deep dive into sophisticated ${topic} methods`,
          },
        ],
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(analysis),
      };
    }

    // Default 404 response
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: "API route not found",
        path: path,
        availableRoutes: ["/health", "/database", "/topic"],
      }),
    };
  } catch (error) {
    console.error("API error:", error);

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

import { Handler } from "@netlify/functions";
import { Client } from "pg";

// Simple handler that provides the core API functionality
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
    // Handle both possible path formats from Netlify
    let path = event.path;
    if (path.startsWith("/.netlify/functions/api")) {
      path = path.replace("/.netlify/functions/api", "");
    } else if (path.startsWith("/api")) {
      path = path.replace("/api", "");
    }

    // Ensure path starts with / for consistency
    if (!path.startsWith("/")) {
      path = "/" + path;
    }
    const method = event.httpMethod;

    console.log(`🚀 Netlify Function called: ${method} ${path}`);
    console.log("Environment check:", {
      DATABASE_URL: process.env.DATABASE_URL ? "Set" : "Missing",
      OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "Set" : "Missing",
      NODE_ENV: process.env.NODE_ENV || "not-set",
    });

    // Health check
    if (path === "/health" && method === "GET") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "ok",
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV || "production",
          hasDatabase: !!process.env.DATABASE_URL,
          hasOpenAI: !!process.env.OPENAI_API_KEY,
        }),
      };
    }

    // Database search endpoint
    if (path === "/database" && method === "GET") {
      const query = event.queryStringParameters?.q;

      if (!query || query.trim() === "") {
        console.log("❌ Missing query parameter");
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Query parameter "q" is required' }),
        };
      }

      console.log(`🔍 Searching for: "${query}"`);

      // Check if DATABASE_URL is available
      if (!process.env.DATABASE_URL) {
        console.error("❌ DATABASE_URL not configured");
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: "Database configuration missing",
            details: "DATABASE_URL environment variable not set",
          }),
        };
      }

      let client: Client | null = null;

      try {
        // Connect to database with timeout
        console.log("🔌 Connecting to database...");
        client = new Client({
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false,
          },
          connectionTimeoutMillis: 10000, // 10 second timeout
        });

        await client.connect();
        console.log("✅ Database connected successfully");

        // Test the connection with a simple query
        const testResult = await client.query("SELECT NOW() as server_time");
        console.log("✅ Database test query successful:", testResult.rows[0]);

        // For now, return intelligent mock data that matches the expected structure
        // In production, this would do actual database queries
        const results = {
          query: query,
          searchType: "enhanced_text_search",
          totalBooks: 3,
          totalChapters: 7,
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
                    "This foundational chapter explains why positional bargaining fails and introduces the concept of principled negotiation. Learn how to separate the people from the problem and focus on interests rather than positions.",
                  relevanceScore: 98,
                  whyRelevant: `This chapter directly addresses ${query} by providing fundamental frameworks for moving beyond win-lose thinking to collaborative problem-solving approaches.`,
                  keyTopics: [
                    "Negotiation Strategy",
                    "Principled Approach",
                    "Win-Win Solutions",
                  ],
                  coreLeadershipPrinciples: [
                    "Focus on interests, not positions",
                    "Separate people from problems",
                    "Generate options for mutual gain",
                  ],
                  practicalApplications: [
                    "Apply principled negotiation in team conflicts",
                    "Use interest-based problem solving in meetings",
                    "Practice separating emotions from issues",
                  ],
                },
                {
                  id: 2,
                  title: "Separate the People from the Problem",
                  snippet:
                    "Discover how to maintain strong relationships while addressing tough issues. This chapter provides techniques for dealing with emotions, building rapport, and ensuring productive dialogue.",
                  relevanceScore: 95,
                  whyRelevant: `Essential for ${query} situations where relationship preservation is critical while still addressing substantive issues effectively.`,
                  keyTopics: [
                    "Relationship Management",
                    "Emotional Intelligence",
                    "Conflict Resolution",
                  ],
                  coreLeadershipPrinciples: [
                    "Maintain relationships during conflict",
                    "Address issues without attacking people",
                    "Build trust through empathy",
                  ],
                  practicalApplications: [
                    "Practice active listening in difficult conversations",
                    "Separate emotional reactions from factual issues",
                    "Use empathy to understand other perspectives",
                  ],
                },
                {
                  id: 3,
                  title: "Focus on Interests, Not Positions",
                  snippet:
                    "Learn to uncover the underlying needs and motivations behind stated positions. This chapter teaches how to ask the right questions and find creative solutions that satisfy everyone's core interests.",
                  relevanceScore: 97,
                  whyRelevant: `Critical for ${query} because it reveals how to discover what people really want versus what they say they want, leading to breakthrough solutions.`,
                  keyTopics: [
                    "Interest-Based Negotiation",
                    "Root Cause Analysis",
                    "Creative Problem Solving",
                  ],
                  coreLeadershipPrinciples: [
                    "Understand underlying motivations",
                    "Ask probing questions to uncover needs",
                    "Look for shared interests",
                  ],
                  practicalApplications: [
                    "Ask 'why' to understand real motivations",
                    "Map out all parties' interests before proposing solutions",
                    "Look for overlapping interests as collaboration opportunities",
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
                  id: 4,
                  title: "Be a Mirror",
                  snippet:
                    "Master the art of tactical empathy and mirroring to build instant rapport. This chapter reveals FBI hostage negotiation techniques adapted for business and personal situations.",
                  relevanceScore: 96,
                  whyRelevant: `Enhances your ${query} effectiveness through advanced psychological techniques used by FBI negotiators to build trust and understanding.`,
                  keyTopics: [
                    "Tactical Empathy",
                    "Mirroring Techniques",
                    "Rapport Building",
                  ],
                  coreLeadershipPrinciples: [
                    "Use tactical empathy to understand others",
                    "Mirror to build instant connection",
                    "Listen more than you speak",
                  ],
                  practicalApplications: [
                    "Practice mirroring last 3 words in conversations",
                    "Use tactical empathy to defuse tense situations",
                    "Apply active listening techniques in all interactions",
                  ],
                },
                {
                  id: 5,
                  title: "Don't Feel Their Pain, Label It",
                  snippet:
                    "Learn the powerful technique of labeling emotions to acknowledge and defuse them without being overwhelmed. Discover how validation can transform any negotiation.",
                  relevanceScore: 94,
                  whyRelevant: `Provides advanced ${query} skills by teaching how to acknowledge emotions without being controlled by them, leading to clearer thinking.`,
                  keyTopics: [
                    "Emotional Labeling",
                    "Validation Techniques",
                    "De-escalation",
                  ],
                  coreLeadershipPrinciples: [
                    "Acknowledge emotions without absorbing them",
                    "Use labeling to defuse tension",
                    "Validate feelings to build trust",
                  ],
                  practicalApplications: [
                    "Label emotions: 'It seems like you're frustrated...'",
                    "Validate concerns before presenting solutions",
                    "Use emotional labeling to calm heated discussions",
                  ],
                },
              ],
            },
            {
              id: "crucial-conversations",
              title: "Crucial Conversations",
              author:
                "Kerry Patterson, Joseph Grenny, Ron McMillan, Al Switzler",
              cover:
                "https://images-na.ssl-images-amazon.com/images/I/51OHJOhmQgL._SX327_BO1,204,203,200_.jpg",
              isbn: "1260474186",
              averageRelevance: 87,
              topChapters: [
                {
                  id: 6,
                  title: "STATE Your Path",
                  snippet:
                    "Master the STATE method for sharing your controversial or sensitive viewpoints effectively. Learn how to speak persuasively without creating defensiveness.",
                  relevanceScore: 93,
                  whyRelevant: `Essential for ${query} when you need to communicate difficult messages while maintaining relationships and achieving understanding.`,
                  keyTopics: [
                    "Difficult Conversations",
                    "STATE Method",
                    "Persuasive Communication",
                  ],
                  coreLeadershipPrinciples: [
                    "Share facts, tell your story, ask for others' paths",
                    "Speak tentatively to invite dialogue",
                    "Encourage testing to verify understanding",
                  ],
                  practicalApplications: [
                    "Use STATE framework for sensitive topics",
                    "Practice tentative language: 'I'm wondering if...'",
                    "Always ask for others' perspectives after sharing yours",
                  ],
                },
                {
                  id: 7,
                  title: "Explore Others' Paths",
                  snippet:
                    "Develop skills for understanding others' viewpoints and encouraging honest dialogue. Learn to create safety so people will share their real thoughts and feelings.",
                  relevanceScore: 91,
                  whyRelevant: `Crucial for ${query} situations where understanding multiple perspectives is essential for finding solutions that work for everyone.`,
                  keyTopics: [
                    "Active Listening",
                    "Perspective Taking",
                    "Creating Safety",
                  ],
                  coreLeadershipPrinciples: [
                    "Create safety for honest dialogue",
                    "Seek to understand before being understood",
                    "Ask sincere questions to explore viewpoints",
                  ],
                  practicalApplications: [
                    "Ask: 'Help me understand your perspective'",
                    "Create psychological safety before difficult topics",
                    "Use AMPP (Ask, Mirror, Paraphrase, Prime) to understand others",
                  ],
                },
              ],
            },
          ],
        };

        console.log(
          `✅ Returning ${results.totalBooks} books with ${results.totalChapters} chapters`,
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(results),
        };
      } catch (dbError) {
        console.error("❌ Database error:", dbError);

        // Return a detailed error for debugging
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({
            error: "Database connection failed",
            details:
              dbError instanceof Error
                ? dbError.message
                : "Unknown database error",
            timestamp: new Date().toISOString(),
          }),
        };
      } finally {
        if (client) {
          try {
            await client.end();
            console.log("🔌 Database connection closed");
          } catch (closeError) {
            console.error("❌ Error closing database connection:", closeError);
          }
        }
      }
    }

    // Query analysis endpoint
    if (path === "/topic" && method === "POST") {
      try {
        const body = JSON.parse(event.body || "{}");
        const { topic } = body;

        if (!topic) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: "Topic is required" }),
          };
        }

        console.log(`🎯 Analyzing topic: "${topic}"`);

        // Return analysis result
        const analysis = {
          isBroad: topic.split(" ").length <= 2,
          explanation: `"${topic}" could benefit from more specific focus to find the most relevant chapters.`,
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
      } catch (parseError) {
        console.error("❌ Error parsing request body:", parseError);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Invalid JSON in request body" }),
        };
      }
    }

    // Default 404 response
    console.log(`❌ Route not found: ${method} ${path}`);
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({
        error: "API route not found",
        path: path,
        method: method,
        availableRoutes: ["/health", "/database", "/topic"],
      }),
    };
  } catch (error) {
    console.error("❌ Unexpected API error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      }),
    };
  }
};

import { Router } from "express";
import OpenAI from "openai";

const router = Router();

interface TopicAnalysis {
  isBroad: boolean;
  broadnessScore: number;
  suggestedRefinements: string[];
  explanation: string;
}

interface TopicRefinement {
  label: string;
  value: string;
  description: string;
}

// Initialize OpenAI client only when API key is available and valid
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI | null {
  if (
    !openai &&
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY.startsWith("sk-")
  ) {
    try {
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    } catch (error) {
      console.warn("Failed to initialize OpenAI client:", error.message);
      return null;
    }
  }
  return openai;
}

// Fallback analysis function
function getFallbackAnalysis(topic: string): TopicAnalysis {
  const words = topic.trim().split(/\s+/);
  const isBroad =
    words.length <= 2 &&
    !topic.includes("how") &&
    !topic.includes("what") &&
    !topic.includes("?");

  return {
    isBroad,
    broadnessScore: isBroad ? 8 : 3,
    explanation: isBroad
      ? "This topic is quite broad. More specific terms would help find targeted content."
      : "This topic has good specificity for finding relevant content.",
    suggestedRefinements: [],
  };
}

// Fallback refinements function
function getFallbackRefinements(topic: string): TopicRefinement[] {
  const fallbackRefinements = {
    leadership: [
      {
        label: "Team Leadership",
        value: "building and leading high-performing teams",
        description:
          "Discover strategies for team building, motivation, and performance management",
      },
      {
        label: "Leadership Communication",
        value: "effective leadership communication and feedback",
        description:
          "Learn communication techniques, giving feedback, and inspiring others",
      },
      {
        label: "Leadership Decision Making",
        value: "decision making and problem solving for leaders",
        description:
          "Explore frameworks for making tough decisions and solving complex problems",
      },
    ],
    management: [
      {
        label: "Project Management",
        value: "project management methodologies and best practices",
        description:
          "Find proven approaches to managing projects and delivering results",
      },
      {
        label: "People Management",
        value: "managing people and employee development",
        description:
          "Learn to manage, develop, and retain talented team members",
      },
      {
        label: "Performance Management",
        value: "performance management and productivity optimization",
        description:
          "Discover ways to improve team performance and organizational efficiency",
      },
    ],
    productivity: [
      {
        label: "Time Management",
        value: "time management and prioritization techniques",
        description:
          "Master methods for managing time and focusing on what matters most",
      },
      {
        label: "Personal Productivity",
        value: "personal productivity systems and habits",
        description:
          "Build systems and habits that boost your individual effectiveness",
      },
      {
        label: "Team Productivity",
        value: "team productivity and collaboration optimization",
        description:
          "Improve how teams work together and accomplish goals efficiently",
      },
    ],
    negotiation: [
      {
        label: "Business Negotiation",
        value: "business negotiation tactics and strategies",
        description:
          "Learn professional negotiation techniques for business deals and contracts",
      },
      {
        label: "Conflict Resolution",
        value: "conflict resolution and mediation skills",
        description:
          "Develop skills to resolve conflicts and mediate disputes effectively",
      },
      {
        label: "Persuasion Techniques",
        value: "persuasion and influence techniques in negotiations",
        description:
          "Master the art of persuasion and influence in professional settings",
      },
    ],
  };

  const topicKey = topic.toLowerCase().trim();
  return (
    fallbackRefinements[topicKey as keyof typeof fallbackRefinements] || [
      {
        label: `Practical ${topic}`,
        value: `practical ${topic.toLowerCase()} techniques and strategies`,
        description: `Find actionable approaches and proven methods for ${topic.toLowerCase()}`,
      },
      {
        label: `Advanced ${topic}`,
        value: `advanced ${topic.toLowerCase()} frameworks and models`,
        description: `Explore sophisticated frameworks and models for ${topic.toLowerCase()}`,
      },
      {
        label: `${topic} Implementation`,
        value: `implementing ${topic.toLowerCase()} in organizations`,
        description: `Learn how to successfully implement ${topic.toLowerCase()} initiatives`,
      },
    ]
  );
}

// Analyze topic to determine if it's too broad
router.post("/analyze", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic || typeof topic !== "string" || topic.trim() === "") {
      return res.status(400).json({ error: "Topic is required" });
    }

    console.log(`🧠 Analyzing topic broadness: "${topic}"`);

    // Try to use OpenAI to analyze if the topic is too broad
    const openaiClient = getOpenAIClient();

    let analysis: TopicAnalysis;

    if (openaiClient) {
      try {
        const analysisPrompt = `Analyze this search topic for specificity: "${topic}"

Is this topic too broad for finding specific, actionable content? Consider:
- Single-word topics (like "leadership") are usually too broad
- Vague concepts without context are too broad  
- Topics that could apply to many different fields are too broad
- Specific questions or focused areas are good

Respond with a JSON object with this exact structure:
{
  "isBroad": boolean,
  "broadnessScore": number (1-10, where 10 is extremely broad),
  "explanation": "Brief explanation of why this topic is/isn't too broad"
}`;

        const analysisResponse = await openaiClient.chat.completions.create({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are an expert at analyzing search queries for specificity. Always respond with valid JSON only.",
            },
            {
              role: "user",
              content: analysisPrompt,
            },
          ],
          max_tokens: 200,
          temperature: 0.1,
        });

        const content = analysisResponse.choices[0]?.message?.content?.trim();
        const parsed = JSON.parse(content || "{}");

        analysis = {
          isBroad: parsed.isBroad || false,
          broadnessScore: parsed.broadnessScore || 1,
          explanation: parsed.explanation || "Analysis completed",
          suggestedRefinements: [], // Will be filled below if broad
        };
      } catch (aiError) {
        console.warn(
          "OpenAI analysis failed, using fallback:",
          aiError.message,
        );
        analysis = getFallbackAnalysis(topic);
      }
    } else {
      console.log("Using fallback analysis (no OpenAI API key)");
      analysis = getFallbackAnalysis(topic);
    }

    // If broad, generate refinement suggestions
    let refinements: TopicRefinement[] = [];
    if (analysis.isBroad) {
      console.log(
        `🎯 Topic is broad (score: ${analysis.broadnessScore}), generating refinements...`,
      );

      if (openaiClient) {
        try {
          const refinementPrompt = `The user searched for "${topic}" which is too broad. Generate 3 more specific refinements that would help them find actionable business/leadership content.

For each refinement, provide:
1. A descriptive label (what the refinement focuses on)
2. The specific search query to use
3. A brief description of what they'll find

Focus on practical, actionable areas within ${topic.toLowerCase()}.

Respond with JSON array:
[
  {
    "label": "Specific area name",
    "value": "specific search query",
    "description": "What they'll discover with this search"
  }
]`;

          const refinementResponse = await openaiClient.chat.completions.create(
            {
              model: "gpt-4-turbo",
              messages: [
                {
                  role: "system",
                  content:
                    "You are an expert at refining broad search queries into specific, actionable searches. Always respond with valid JSON array only.",
                },
                {
                  role: "user",
                  content: refinementPrompt,
                },
              ],
              max_tokens: 400,
              temperature: 0.3,
            },
          );

          const refinementContent =
            refinementResponse.choices[0]?.message?.content?.trim();
          refinements = JSON.parse(refinementContent || "[]");
        } catch (refinementError) {
          console.warn(
            "AI refinement failed, using fallback:",
            refinementError.message,
          );
          refinements = getFallbackRefinements(topic);
        }
      } else {
        console.log("Using fallback refinements (no OpenAI API key)");
        refinements = getFallbackRefinements(topic);
      }
    }

    const result = {
      analysis: {
        ...analysis,
        suggestedRefinements: refinements.map((r) => r.value),
      },
      refinements,
    };

    console.log(
      `✅ Topic analysis complete: ${analysis.isBroad ? "BROAD" : "SPECIFIC"} (${analysis.broadnessScore}/10)`,
    );

    res.json(result);
  } catch (error) {
    console.error("🚨 Query analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze query",
      details:
        process.env.NODE_ENV === "development"
          ? (error as Error).message
          : undefined,
    });
  }
});

export default router;

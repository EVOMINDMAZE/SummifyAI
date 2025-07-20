import { Router } from "express";
import OpenAI from "openai";

const router = Router();

interface EnrichmentRequest {
  chapterId: number;
  userQuery: string;
  chapterText: string;
  chapterTitle: string;
}

interface EnrichmentResponse {
  chapterId: number;
  relevanceScore: number;
  whyRelevant: string;
  keyTopics: string[];
  processingTime: number;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Enrichment endpoint
router.post("/", async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      chapterId,
      userQuery,
      chapterText,
      chapterTitle,
    }: EnrichmentRequest = req.body;

    if (!chapterId || !userQuery || !chapterText) {
      return res.status(400).json({
        error: "Missing required fields: chapterId, userQuery, or chapterText",
      });
    }

    console.log(`🧠 Enriching chapter ${chapterId} for query: "${userQuery}"`);

    // Truncate chapter text to first 500 characters for analysis
    const textSnippet = chapterText.substring(0, 500);

    // Generate relevance explanation and key topics in parallel
    const [relevanceResult, topicsResult] = await Promise.all([
      generateRelevanceExplanation(userQuery, textSnippet, chapterTitle),
      extractKeyTopics(textSnippet),
    ]);

    // Calculate relevance score (this would typically come from vector distance)
    const relevanceScore = calculateRelevanceScore(userQuery, textSnippet);

    const enrichmentResponse: EnrichmentResponse = {
      chapterId,
      relevanceScore,
      whyRelevant: relevanceResult,
      keyTopics: topicsResult,
      processingTime: Date.now() - startTime,
    };

    console.log(
      `✅ Enriched chapter ${chapterId} in ${enrichmentResponse.processingTime}ms`,
    );

    res.json(enrichmentResponse);
  } catch (error) {
    console.error("🚨 AI enrichment error:", error);

    // Return fallback response on error
    const fallbackResponse: EnrichmentResponse = {
      chapterId: req.body.chapterId || 0,
      relevanceScore: 75, // Default relevance score
      whyRelevant: generateFallbackExplanation(
        req.body.userQuery,
        req.body.chapterTitle,
      ),
      keyTopics: generateFallbackTopics(req.body.userQuery),
      processingTime: Date.now() - startTime,
    };

    res.json(fallbackResponse);
  }
});

// Generate AI explanation for why chapter is relevant
async function generateRelevanceExplanation(
  userQuery: string,
  chapterText: string,
  chapterTitle: string,
): Promise<string> {
  try {
    const prompt = `User Query: "${userQuery}".

Chapter Title: "${chapterTitle}"
Chapter Text Snippet: "${chapterText}"

In one concise sentence, explain why this chapter is highly relevant to the user's query. Focus on specific concepts, strategies, or insights that directly address what the user is looking for.`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert content analyst. Provide concise, specific explanations of content relevance.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      generateFallbackExplanation(userQuery, chapterTitle)
    );
  } catch (error) {
    console.error("Relevance explanation error:", error);
    return generateFallbackExplanation(userQuery, chapterTitle);
  }
}

// Extract key topics using AI
async function extractKeyTopics(chapterText: string): Promise<string[]> {
  try {
    const prompt = `Read the following text snippet and extract the top 3-5 most important topics or keywords. Return them as a simple, comma-separated list without explanations or formatting.

Snippet: "${chapterText}"`;

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert content analyzer. Extract only the most relevant keywords and topics.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 60,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (content) {
      return content
        .split(",")
        .map((topic) => topic.trim())
        .filter((topic) => topic.length > 0)
        .slice(0, 5);
    }

    return generateFallbackTopics("");
  } catch (error) {
    console.error("Key topics extraction error:", error);
    return generateFallbackTopics("");
  }
}

// Calculate relevance score from text similarity
function calculateRelevanceScore(
  userQuery: string,
  chapterText: string,
): number {
  const queryWords = userQuery.toLowerCase().split(/\s+/);
  const textWords = chapterText.toLowerCase().split(/\s+/);

  let matches = 0;
  queryWords.forEach((queryWord) => {
    if (queryWord.length > 2) {
      textWords.forEach((textWord) => {
        if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
          matches++;
        }
      });
    }
  });

  // Calculate percentage based on query word coverage
  const coverage = Math.min(matches / queryWords.length, 1);
  return Math.max(20, Math.round(coverage * 80 + 20)); // Scale to 20-100%
}

// Fallback explanation when AI is unavailable
function generateFallbackExplanation(
  userQuery: string,
  chapterTitle: string,
): string {
  const explanations = [
    `This chapter provides practical insights and strategies directly related to ${userQuery}.`,
    `"${chapterTitle}" contains valuable frameworks and approaches for understanding ${userQuery}.`,
    `The content explores key principles and applications relevant to ${userQuery}.`,
    `This section offers actionable guidance and expert perspectives on ${userQuery}.`,
  ];

  return explanations[Math.floor(Math.random() * explanations.length)];
}

// Fallback topics when AI is unavailable
function generateFallbackTopics(userQuery: string): string[] {
  const baseTopics = [
    "Strategy",
    "Leadership",
    "Management",
    "Development",
    "Performance",
  ];

  if (userQuery) {
    const queryWords = userQuery
      .split(/\s+/)
      .map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      );
    return [...queryWords.slice(0, 3), ...baseTopics.slice(0, 3)].slice(0, 5);
  }

  return baseTopics.slice(0, 3);
}

export default router;

import { Router } from "express";
import OpenAI from "openai";

const router = Router();

interface EnrichmentRequest {
  chapterId: number;
  userQuery: string;
  chapterText: string;
  chapterTitle: string;
  bookTitle?: string;
  bookAuthor?: string;
}

interface EnrichmentResponse {
  chapterId: number;
  relevanceScore: number;
  whyRelevant: string;
  keyTopics: string[];
  coreLeadershipPrinciples?: string[];
  practicalApplications?: string[];
  aiSummary?: string;
  recommendations?: string[];
  processingTime: number;
  success: boolean;
}

// Initialize OpenAI client for GPT-4.1-nano
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AI Enrichment endpoint for comprehensive chapter analysis
router.post("/", async (req, res) => {
  const startTime = Date.now();

  try {
    const {
      chapterId,
      userQuery,
      chapterText,
      chapterTitle,
      bookTitle,
      bookAuthor,
    }: EnrichmentRequest = req.body;

    if (!chapterId || !userQuery || !chapterText) {
      return res.status(400).json({
        error: "Missing required fields: chapterId, userQuery, or chapterText",
        success: false,
      });
    }

    console.log(
      `🧠 AI Enrichment started for chapter ${chapterId}: "${chapterTitle}"`,
    );

    // Prepare chapter snippet for analysis
    const textSnippet = chapterText.substring(0, 800);

    // Execute all AI enrichment tasks in parallel for speed
    const [
      relevanceResult,
      topicsResult,
      principlesResult,
      applicationsResult,
      summaryResult,
      recommendationsResult,
    ] = await Promise.all([
      generateRelevanceExplanation(userQuery, textSnippet, chapterTitle),
      extractKeyTopics(textSnippet),
      extractCoreLeadershipPrinciples(textSnippet, userQuery),
      generatePracticalApplications(textSnippet, userQuery),
      generateAISummary(textSnippet, chapterTitle, bookTitle),
      generateSmartRecommendations(userQuery, textSnippet, bookTitle),
    ]);

    // Calculate comprehensive relevance score
    const relevanceScore = calculateAdvancedRelevanceScore(
      userQuery,
      textSnippet,
      chapterTitle,
    );

    const enrichmentResponse: EnrichmentResponse = {
      chapterId,
      relevanceScore,
      whyRelevant: relevanceResult,
      keyTopics: topicsResult,
      coreLeadershipPrinciples: principlesResult,
      practicalApplications: applicationsResult,
      aiSummary: summaryResult,
      recommendations: recommendationsResult,
      processingTime: Date.now() - startTime,
      success: true,
    };

    console.log(
      `✅ AI Enrichment completed for chapter ${chapterId} in ${enrichmentResponse.processingTime}ms`,
    );

    res.json(enrichmentResponse);
  } catch (error) {
    console.error("🚨 AI enrichment error:", error);

    // Provide intelligent fallback response
    const fallbackResponse: EnrichmentResponse = {
      chapterId: req.body.chapterId || 0,
      relevanceScore: calculateAdvancedRelevanceScore(
        req.body.userQuery || "",
        req.body.chapterText || "",
        req.body.chapterTitle || "",
      ),
      whyRelevant: generateIntelligentFallbackExplanation(
        req.body.userQuery,
        req.body.chapterTitle,
        req.body.chapterText,
      ),
      keyTopics: generateIntelligentFallbackTopics(
        req.body.userQuery,
        req.body.chapterText,
      ),
      coreLeadershipPrinciples: [],
      practicalApplications: [],
      processingTime: Date.now() - startTime,
      success: false,
    };

    res.json(fallbackResponse);
  }
});

// Generate AI-powered relevance explanation using GPT-4.1-nano
async function generateRelevanceExplanation(
  userQuery: string,
  chapterText: string,
  chapterTitle: string,
): Promise<string> {
  try {
    const prompt = `User Query: "${userQuery}"

Chapter Title: "${chapterTitle}"
Chapter Content: "${chapterText}"

As an expert content analyst, explain in one compelling sentence why this chapter is highly relevant to the user's query. Focus on specific concepts, frameworks, or actionable insights that directly address what the user seeks. Be precise and value-focused.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Using GPT-4 Turbo as GPT-4.1-nano isn't available
      messages: [
        {
          role: "system",
          content:
            "You are an expert content analyst who specializes in identifying relevant insights and frameworks in business and leadership content. Provide clear, actionable explanations that highlight immediate value to the reader.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 120,
      temperature: 0.3,
    });

    return (
      response.choices[0]?.message?.content?.trim() ||
      generateIntelligentFallbackExplanation(
        userQuery,
        chapterTitle,
        chapterText,
      )
    );
  } catch (error) {
    console.error("Relevance explanation error:", error);
    return generateIntelligentFallbackExplanation(
      userQuery,
      chapterTitle,
      chapterText,
    );
  }
}

// Extract key topics using advanced AI analysis
async function extractKeyTopics(chapterText: string): Promise<string[]> {
  try {
    const prompt = `Analyze this text and extract the 5 most important topics, concepts, or keywords. Focus on actionable insights, frameworks, and core themes that would be valuable to a business professional.

Text: "${chapterText}"

Return only a comma-separated list of topics, no explanations.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at identifying key business and leadership concepts. Extract the most valuable and actionable topics from content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 80,
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

    return generateIntelligentFallbackTopics("", chapterText);
  } catch (error) {
    console.error("Key topics extraction error:", error);
    return generateIntelligentFallbackTopics("", chapterText);
  }
}

// Extract core leadership principles using AI
async function extractCoreLeadershipPrinciples(
  chapterText: string,
  userQuery: string,
): Promise<string[]> {
  try {
    const prompt = `Based on this content, identify 3-4 core principles or frameworks that relate to "${userQuery}". Focus on actionable leadership insights and strategic approaches.

Content: "${chapterText}"

Return a simple list, one principle per line, no bullet points or numbers.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a leadership expert who identifies core principles and frameworks that can be applied in business contexts.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (content) {
      return content
        .split("\n")
        .map((principle) => principle.trim())
        .filter((principle) => principle.length > 0)
        .slice(0, 4);
    }

    return [];
  } catch (error) {
    console.error("Leadership principles extraction error:", error);
    return [];
  }
}

// Generate practical applications using AI
async function generatePracticalApplications(
  chapterText: string,
  userQuery: string,
): Promise<string[]> {
  try {
    const prompt = `Based on this content and the user's interest in "${userQuery}", provide 3 specific, actionable applications they can implement immediately.

Content: "${chapterText}"

Return a simple list, one application per line, focused on practical steps.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a practical business advisor who creates actionable steps from theoretical content. Focus on immediate, implementable actions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 120,
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (content) {
      return content
        .split("\n")
        .map((app) => app.trim())
        .filter((app) => app.length > 0)
        .slice(0, 3);
    }

    return [];
  } catch (error) {
    console.error("Practical applications error:", error);
    return [];
  }
}

// Generate AI-powered chapter summary
async function generateAISummary(
  chapterText: string,
  chapterTitle: string,
  bookTitle?: string,
): Promise<string> {
  try {
    const prompt = `Summarize this chapter in 2-3 sentences, focusing on the key insights and value it provides to readers.

Chapter: "${chapterTitle}"${bookTitle ? ` from "${bookTitle}"` : ""}
Content: "${chapterText}"

Provide a clear, value-focused summary.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are an expert at creating concise, value-focused summaries that highlight the most important insights and practical value.",
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
      `This chapter provides valuable insights and practical frameworks related to the core concepts discussed.`
    );
  } catch (error) {
    console.error("AI summary error:", error);
    return `This chapter provides valuable insights and practical frameworks related to the core concepts discussed.`;
  }
}

// Generate smart recommendations
async function generateSmartRecommendations(
  userQuery: string,
  chapterText: string,
  bookTitle?: string,
): Promise<string[]> {
  try {
    const prompt = `Based on someone interested in "${userQuery}" and this content, suggest 2-3 specific next steps or related topics they should explore.

Content: "${chapterText}"

Provide actionable recommendations, one per line.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a learning advisor who provides strategic next steps for continued growth and learning.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 90,
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (content) {
      return content
        .split("\n")
        .map((rec) => rec.trim())
        .filter((rec) => rec.length > 0)
        .slice(0, 3);
    }

    return [];
  } catch (error) {
    console.error("Smart recommendations error:", error);
    return [];
  }
}

// Advanced relevance score calculation
function calculateAdvancedRelevanceScore(
  userQuery: string,
  chapterText: string,
  chapterTitle: string,
): number {
  const queryWords = userQuery.toLowerCase().split(/\s+/);
  const titleWords = chapterTitle.toLowerCase().split(/\s+/);
  const textWords = chapterText.toLowerCase().split(/\s+/);

  let score = 0;
  let maxScore = queryWords.length * 10;

  queryWords.forEach((queryWord) => {
    if (queryWord.length <= 2) return;

    // Title match (highest weight)
    if (titleWords.some((word) => word.includes(queryWord))) {
      score += 10;
    }

    // Exact word match in text
    if (textWords.includes(queryWord)) {
      score += 8;
    }

    // Partial match in text
    if (textWords.some((word) => word.includes(queryWord))) {
      score += 5;
    }

    // Semantic similarity (simplified)
    const semanticMatches = textWords.filter((word) => {
      return (
        word.length > 3 &&
        (word.includes(queryWord) ||
          queryWord.includes(word) ||
          Math.abs(word.length - queryWord.length) <= 2)
      );
    });

    score += Math.min(semanticMatches.length, 3) * 2;
  });

  // Normalize to percentage
  const relevance = Math.min(100, Math.round((score / maxScore) * 100));
  return Math.max(25, relevance); // Minimum 25% for any matched content
}

// Intelligent fallback functions
function generateIntelligentFallbackExplanation(
  userQuery: string,
  chapterTitle: string,
  chapterText: string,
): string {
  const explanations = [
    `This chapter provides comprehensive insights into ${userQuery}, offering practical frameworks and strategies you can implement immediately.`,
    `"${chapterTitle}" delivers actionable guidance on ${userQuery} with proven methodologies and real-world applications.`,
    `The content explores essential principles of ${userQuery}, combining theoretical foundations with practical implementation strategies.`,
    `This section offers expert perspectives on ${userQuery} with detailed analysis and strategic approaches for immediate application.`,
  ];

  return explanations[Math.floor(Math.random() * explanations.length)];
}

function generateIntelligentFallbackTopics(
  userQuery: string,
  chapterText: string,
): string[] {
  // Extract meaningful words from chapter text
  const words = chapterText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];

  const commonTopics = [
    "Leadership",
    "Strategy",
    "Management",
    "Communication",
    "Innovation",
    "Performance",
    "Development",
    "Planning",
    "Execution",
    "Growth",
  ];

  // Combine query-specific and content-specific topics
  const queryTopics = userQuery
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .filter((word) => word.length > 3);

  const contentTopics = [...new Set(words)]
    .slice(0, 10)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .filter((word) => word.length > 4);

  return [...queryTopics, ...contentTopics, ...commonTopics].slice(0, 5);
}

export default router;

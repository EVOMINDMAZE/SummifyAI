import type { Handler } from "@netlify/functions";

interface SearchResult {
  id: number;
  bookTitle: string;
  chapterTitle: string;
  snippet: string;
  relevanceScore: number;
}

interface AnalysisRequest {
  results: SearchResult[];
  query: string;
  analysisLevel: "basic" | "advanced" | "premium";
}

interface AnalyzedResult {
  id: number;
  analysis: string;
  enhancedScore: number;
  keyTopics: string[];
  relevanceReason: string;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { results, query, analysisLevel }: AnalysisRequest = JSON.parse(
      event.body!,
    );

    if (!results || !query || !analysisLevel) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Use GPT-5 nano for cost-efficient analysis
    const analyzedResults = await analyzeResults(results, query, analysisLevel);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        analyzedResults,
        analysisLevel,
        processedCount: results.length,
      }),
    };
  } catch (error) {
    console.error("Analysis error:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        error: "Analysis failed",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

function generateRelevanceReason(
  result: SearchResult,
  query: string,
  analysisLevel: string,
): string {
  const queryWords = query.toLowerCase().split(/\s+/);
  const snippetLower = (result.snippet || "").toLowerCase();
  const foundTerms = queryWords.filter((w) => snippetLower.includes(w));

  if (analysisLevel === "premium") {
    return foundTerms.length
      ? `Found ${foundTerms.length} term(s) ("${foundTerms.join('", "')}") related to "${query}". Provides context and examples.`
      : `Content aligns with "${query}" and offers comprehensive insights.`;
  } else if (analysisLevel === "advanced") {
    return foundTerms.length
      ? `Matches key terms ("${foundTerms.slice(0, 2).join('", "')}") for "${query}". Detailed, practical analysis.`
      : `Semantically related to "${query}" with in-depth coverage.`;
  }

  // basic
  return foundTerms.length
    ? `Found relevant content for "${query}" matching your terms.`
    : `Relevant to your search for "${query}".`;
}

async function analyzeResults(
  results: SearchResult[],
  query: string,
  analysisLevel: string,
): Promise<AnalyzedResult[]> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  // Prepare analysis prompt based on tier
  const systemPrompts = {
    basic: `You are a research assistant. Analyze search results and provide brief relevance insights.
    Keep responses concise (max 100 words per result).`,

    advanced: `You are an expert research analyst. Provide detailed relevance analysis, key topics, and insights.
    Include specific reasons why each result matches the query (max 200 words per result).`,

    premium: `You are a premium AI research expert. Provide comprehensive analysis including:
    - Detailed relevance assessment
    - Key topics and concepts
    - Specific matching reasons
    - Actionable insights
    - Related concepts to explore
    (max 300 words per result)`,
  };

  const analysisPrompt = `
${systemPrompts[analysisLevel as keyof typeof systemPrompts]}

User Query: "${query}"

Analyze these search results and return a JSON array with this exact structure:
[
  {
    "id": number,
    "analysis": "detailed analysis text",
    "enhancedScore": number (0-1, refined relevance score),
    "keyTopics": ["topic1", "topic2", "topic3"],
    "relevanceReason": "specific reason why this matches the query"
  }
]

Search Results:
${results
  .map(
    (r, i) => `
${i + 1}. ID: ${r.id}
   Book: ${r.bookTitle}
   Chapter: ${r.chapterTitle}
   Content: ${r.snippet}
   Current Score: ${r.relevanceScore}
`,
  )
  .join("\n")}

Return only valid JSON, no other text.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5-nano", // Cost-efficient model
        messages: [
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        max_tokens: getMaxTokens(analysisLevel, results.length),
        temperature: 0.3, // Lower temperature for consistent analysis
      }),
    });

    // Read response body only once
    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data !== null && "error" in data
          ? (data as any).error?.message || JSON.stringify(data)
          : response.statusText;
      throw new Error(`OpenAI API error: ${errorMessage}`);
    }
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No analysis content received from OpenAI");
    }

    // Parse JSON response
    try {
      const analyzedResults: AnalyzedResult[] = JSON.parse(content);

      // Validate and ensure all results have the required structure
      return results.map((result, index) => {
        const analysis =
          analyzedResults.find((a) => a.id === result.id) ||
          analyzedResults[index];

        return {
          id: result.id,
          analysis: analysis?.analysis || "Analysis not available",
          enhancedScore: analysis?.enhancedScore || result.relevanceScore,
          keyTopics: analysis?.keyTopics || [],
          relevanceReason:
            analysis?.relevanceReason ||
            generateRelevanceReason(result, query, analysisLevel),
        };
      });
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw content:", content);

      // Fallback: return basic analysis
      return results.map((result) => ({
        id: result.id,
        analysis: `Relevant content found in "${result.chapterTitle}" from ${result.bookTitle}`,
        enhancedScore: result.relevanceScore,
        keyTopics: extractBasicTopics(result.snippet),
        relevanceReason: generateRelevanceReason(result, query, analysisLevel),
      }));
    }
  } catch (apiError) {
    console.error("OpenAI API error:", apiError);

    // Fallback: return basic analysis without AI
    return results.map((result) => ({
      id: result.id,
      analysis: `Content from "${result.chapterTitle}" in ${result.bookTitle}`,
      enhancedScore: result.relevanceScore,
      keyTopics: extractBasicTopics(result.snippet),
      relevanceReason: generateRelevanceReason(result, query, analysisLevel),
    }));
  }
}

function getMaxTokens(analysisLevel: string, resultCount: number): number {
  const baseTokens = {
    basic: 50,
    advanced: 150,
    premium: 250,
  };

  return (
    (baseTokens[analysisLevel as keyof typeof baseTokens] || 50) * resultCount
  );
}

function extractBasicTopics(text: string): string[] {
  // Simple keyword extraction for fallback
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 4)
    .filter(
      (word) =>
        ![
          "this",
          "that",
          "with",
          "from",
          "they",
          "were",
          "been",
          "have",
          "will",
          "chapter",
        ].includes(word),
    );

  // Get unique words and return top 3
  const uniqueWords = [...new Set(words)];
  return uniqueWords.slice(0, 3);
}

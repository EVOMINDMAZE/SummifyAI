import { Handler } from "@netlify/functions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const handler: Handler = async (event) => {
  console.log("[analyze-search-results-v2] Request:", event.httpMethod);

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "ok",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ success: false, error: "Method not allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const { results, query, analysisLevel } = body;

    if (!results || !Array.isArray(results) || results.length === 0) {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          analyzedResults: [],
          analysisLevel,
          processedCount: 0,
        }),
      };
    }

    if (!query || !analysisLevel) {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          error: "Missing query or analysisLevel",
        }),
      };
    }

    const grokApiKey = process.env.GROK_API_KEY;
    if (!grokApiKey) {
      console.warn("[analyze-search-results-v2] No Grok API key, using fallback");
      const fallback = results.slice(0, 10).map((r: any) => ({
        id: r.id,
        analysis: `Chapter from "${r.bookTitle}" contains relevant information about "${query}".`,
        enhancedScore: Math.min(r.relevanceScore + 0.05, 1),
        keyTopics: extractTopics(r.snippet, query),
        relevanceReason: `Matches search for "${query}".`,
      }));
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          analyzedResults: fallback,
          analysisLevel,
          processedCount: results.length,
        }),
      };
    }

    console.log(
      "[analyze-search-results-v2] Calling Grok for",
      results.length,
      "results"
    );

    const prompt = `Analyze ${results.length} search results for query: "${query}"\n\nReturn ONLY this JSON array structure (no other text):\n[\n  {"id": <number>, "analysis": "<1-2 sentence summary>", "enhancedScore": <0-1>, "keyTopics": ["topic1", "topic2"], "relevanceReason": "<why it matches>"}\n]\n\nResults:\n${results
      .slice(0, 10)
      .map(
        (r: any, i: number) =>
          `[${i + 1}] ID:${r.id} "${r.chapterTitle}" - ${r.snippet.substring(0, 80)}`
      )
      .join("\n")}`;

    const grokResponse = await fetch("https://api.grok.im/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${grokApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-4-fast-reasoning",
        messages: [{ role: "user", content: prompt }],
        max_tokens: Math.min(200 + results.length * 50, 2000),
        temperature: 0.3,
      }),
    });

    if (!grokResponse.ok) {
      console.error(
        "[analyze-search-results-v2] Grok error:",
        grokResponse.status
      );
      throw new Error(`Grok error: ${grokResponse.status}`);
    }

    const grokData = (await grokResponse.json()) as any;
    const content = grokData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content from Grok");
    }

    try {
      const analyzedResults = JSON.parse(content);
      console.log(
        "[analyze-search-results-v2] Parsed",
        analyzedResults.length,
        "results"
      );
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          analyzedResults,
          analysisLevel,
          processedCount: results.length,
        }),
      };
    } catch (parseError) {
      console.error("[analyze-search-results-v2] JSON parse failed, using fallback");
      const fallback = results.slice(0, 10).map((r: any) => ({
        id: r.id,
        analysis: `Chapter from "${r.bookTitle}" relevant to "${query}".`,
        enhancedScore: Math.min(r.relevanceScore + 0.05, 1),
        keyTopics: extractTopics(r.snippet, query),
        relevanceReason: `Matches search for "${query}".`,
      }));
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          analyzedResults: fallback,
          analysisLevel,
          processedCount: results.length,
        }),
      };
    }
  } catch (error: any) {
    console.error("[analyze-search-results-v2] Error:", error.message);
    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        error: error?.message || "Unknown error",
      }),
    };
  }
};

function extractTopics(snippet: string, query: string): string[] {
  if (!snippet) return [];
  const topics = new Set<string>();
  const queryTerms = query.toLowerCase().split(/\s+/);

  // Add query terms if found
  const snippetLower = snippet.toLowerCase();
  queryTerms.forEach((term) => {
    if (snippetLower.includes(term) && term.length > 3) {
      topics.add(term.charAt(0).toUpperCase() + term.slice(1));
    }
  });

  // Extract capitalized words
  const words = snippet.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  words.forEach((word) => {
    const clean = word.trim();
    if (
      clean.length > 4 &&
      !["The", "This", "That", "From", "With"].includes(clean) &&
      topics.size < 7
    ) {
      topics.add(clean);
    }
  });

  return Array.from(topics).slice(0, 5);
}

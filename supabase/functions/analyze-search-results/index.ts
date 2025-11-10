import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

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

function generateRelevanceReason(
  result: SearchResult,
  query: string,
  analysisLevel: string,
): string {
  const queryWords = query.toLowerCase().split(/\s+/);
  const snippetLower = (result.snippet || "").toLowerCase();

  // Check which query terms appear in the snippet
  const foundTerms = queryWords.filter((word) => snippetLower.includes(word));

  // Generate tier-specific fallback text based on search type and analysis level
  let relevanceReason = "";

  if (analysisLevel === "premium") {
    if (foundTerms.length > 0) {
      relevanceReason = `Found ${foundTerms.length} relevant term${foundTerms.length > 1 ? "s" : ""} ("${foundTerms.join('", "')}") in chapter content related to "${query}". This chapter provides relevant context and examples for deeper understanding.`;
    } else {
      relevanceReason = `Chapter content aligns with search query "${query}". Contains comprehensive information and insights for research and learning.`;
    }
  } else if (analysisLevel === "advanced") {
    if (foundTerms.length > 0) {
      const topTerms = foundTerms.slice(0, 2).join('", "');
      relevanceReason = `Matches key terms from your search ("${topTerms}") in the context of "${query}". This chapter provides detailed insights and practical analysis relevant to your research.`;
    } else {
      relevanceReason = `This chapter is semantically related to "${query}". Contains in-depth content and analysis relevant to your research needs.`;
    }
  } else {
    // Basic level for free users
    if (foundTerms.length > 0) {
      relevanceReason = `Found relevant content for "${query}" in this chapter. Chapter contains information matching your search terms.`;
    } else {
      relevanceReason = `This chapter is relevant to your search for "${query}". Chapter content addresses topics related to your query.`;
    }
  }

  return relevanceReason;
}

function generateFallbackAnalyses(
  results: SearchResult[],
  query: string,
  analysisLevel: string,
): AnalyzedResult[] {
  return results.map((result) => {
    const relevanceReason = generateRelevanceReason(
      result,
      query,
      analysisLevel,
    );

    // Generate a more detailed analysis based on snippet content
    let analysis = "";
    const snippetPreview = result.snippet.substring(0, 150);

    if (analysisLevel === "premium") {
      analysis = `Chapter "${result.chapterTitle}" from "${result.bookTitle}" provides comprehensive information related to "${query}". The chapter contains detailed discussion about relevant topics with examples and context. Key content: ${snippetPreview}... This resource offers valuable insights for deeper understanding and research into your query.`;
    } else if (analysisLevel === "advanced") {
      analysis = `Chapter "${result.chapterTitle}" from "${result.bookTitle}" covers important aspects of "${query}". Contains relevant discussion and analysis: ${snippetPreview}... A valuable resource for your research.`;
    } else {
      analysis = `Chapter "${result.chapterTitle}" from "${result.bookTitle}" is related to "${query}". Content preview: ${snippetPreview}...`;
    }

    // Extract potential topics from snippet
    const keyTopics = extractKeyTopicsFromSnippet(result.snippet, query);

    return {
      id: result.id,
      analysis,
      enhancedScore: Math.min(result.relevanceScore + 0.05, 1),
      keyTopics,
      relevanceReason,
    };
  });
}

function extractKeyTopicsFromSnippet(snippet: string, query: string): string[] {
  if (!snippet) return [];

  const topics = new Set<string>();
  const queryTerms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2);

  // 1. Add relevant query terms as primary topics
  const snippetLower = snippet.toLowerCase();
  queryTerms.forEach((term) => {
    if (snippetLower.includes(term) && term.length > 3) {
      topics.add(term.charAt(0).toUpperCase() + term.slice(1));
    }
  });

  // 2. Extract noun phrases and capitalized terms
  const capitalizedWords =
    snippet.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];

  capitalizedWords.forEach((word) => {
    const cleanWord = word.trim();
    // Only add meaningful topics (longer than 4 chars, not generic)
    if (
      cleanWord.length > 4 &&
      !["The", "This", "That", "From", "With"].includes(cleanWord) &&
      topics.size < 7
    ) {
      topics.add(cleanWord);
    }
  });

  // 3. Extract common noun phrases related to the query
  const nounPhrases =
    snippet.match(
      /\b(?:the\s+)?[A-Z][a-z]+(?:\s+(?:of|for|in|and)\s+[A-Z][a-z]+)*/gi,
    ) || [];
  nounPhrases.slice(0, 2).forEach((phrase) => {
    if (topics.size < 7 && phrase.length > 5) {
      topics.add(phrase.trim());
    }
  });

  return Array.from(topics).slice(0, 7);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { results, query, analysisLevel }: AnalysisRequest = await req.json();

    if (!results || !query || !analysisLevel) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    const grokApiKey = Deno.env.get("GROK_API_KEY");
    if (!grokApiKey) {
      return new Response(
        JSON.stringify({ error: "Grok API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        },
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Analyze results with caching
    const analyzedResults = await analyzeResults(
      results,
      query,
      analysisLevel,
      supabase,
      grokApiKey,
    );

    return new Response(
      JSON.stringify({
        analyzedResults,
        analysisLevel,
        processedCount: results.length,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  } catch (error) {
    console.error("Analysis error:", error.message);
    return new Response(
      JSON.stringify({
        error: "Analysis failed",
        details: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      },
    );
  }
});

async function analyzeResults(
  results: SearchResult[],
  query: string,
  analysisLevel: string,
  supabase: any,
  grokApiKey: string,
): Promise<AnalyzedResult[]> {
  // Check cache for existing analyses
  console.log(`📋 Checking cache for analyses...`);
  const cachedAnalyses: Record<number, any> = {};

  for (const result of results) {
    const { data: cached } = await supabase
      .from("search_analysis_cache")
      .select("*")
      .eq("chapter_id", result.id)
      .eq("query_text", query)
      .eq("analysis_level", analysisLevel)
      .maybeSingle();

    if (cached) {
      console.log(`✅ Cache hit for chapter ${result.id}`);
      cachedAnalyses[result.id] = cached;

      // Update usage stats
      await supabase.rpc("update_cache_usage", {
        cache_type: "analysis",
        cache_id: cached.id,
      });
    }
  }

  // Separate results that need analysis
  const resultsNeedingAnalysis = results.filter((r) => !cachedAnalyses[r.id]);

  // If all results are cached, return immediately
  if (resultsNeedingAnalysis.length === 0) {
    console.log(`✅ All results found in cache!`);
    return results.map((result) => {
      const cached = cachedAnalyses[result.id];
      return {
        id: result.id,
        analysis: cached.analysis_text,
        enhancedScore: cached.enhanced_score,
        keyTopics: cached.key_topics || [],
        relevanceReason: cached.relevance_reason,
      };
    });
  }

  // Generate analyses for remaining results
  console.log(
    `🧠 Generating analysis for ${resultsNeedingAnalysis.length} results...`,
  );

  const systemPrompts = {
    basic: `You are a research assistant. Analyze search results and provide brief relevance insights.
    For each result, identify how it relates to the query and extract 3-5 key topics.
    Keep analysis concise (50-100 words per result).
    Output ONLY valid JSON, no additional text.`,

    advanced: `You are an expert research analyst. Provide detailed relevance analysis for each search result.
    For each result:
    - Explain how it specifically relates to the query (100-150 words)
    - Extract 3-5 key topics from the content
    - Provide a specific reason why it matches the query
    - Rate relevance on a scale of 0-1
    Output ONLY valid JSON, no additional text.`,

    premium: `You are a premium AI research expert. Provide comprehensive analysis for each search result including:
    - Detailed relevance assessment explaining specific connections to the query (150-200 words)
    - Key concepts, topics, and themes (5-7 items)
    - Specific matching reasons with evidence from the snippet
    - Confidence score (0-1) based on relevance strength
    - Optional: Related concepts to explore further
    Ensure high-quality, insightful analysis that helps understand why each result matters.
    Output ONLY valid JSON, no additional text.`,
  };

  const analysisPrompt = `
${systemPrompts[analysisLevel as keyof typeof systemPrompts]}

User Query: "${query}"

Analyze these ${resultsNeedingAnalysis.length} search results and return a JSON array with this exact structure. Be thorough, specific, and insightful:

[
  {
    "id": <number - match the ID exactly>,
    "analysis": "<comprehensive analysis of how this chapter relates to the query - should be 1-3 sentences explaining the connection and why it's valuable>",
    "enhancedScore": <number between 0 and 1 - refined relevance score based on content quality and match>,
    "keyTopics": [<3-7 key topics extracted from the chapter content and query>],
    "relevanceReason": "<specific, detailed reason why this chapter matches the search query - reference specific concepts or themes>"
  }
]

IMPORTANT:
- Return ONLY the JSON array, no other text
- Ensure all strings are properly escaped
- Match IDs exactly as provided
- Make "analysis" substantive and helpful (2-3 sentences minimum for premium, 1-2 for advanced, 1 for basic)
- Extract topics that are most relevant to the query

Search Results to Analyze:
${resultsNeedingAnalysis
  .map(
    (r, i) => `
[${i + 1}] ID: ${r.id}
Book: "${r.bookTitle}"
Chapter: "${r.chapterTitle}"
Content Preview: ${r.snippet.substring(0, 200)}...
Current Relevance Score: ${(r.relevanceScore * 100).toFixed(1)}%
`,
  )
  .join("\n")}`;

  const maxTokens = getMaxTokens(analysisLevel, resultsNeedingAnalysis.length);

  let newAnalyses: AnalyzedResult[] = [];

  try {
    const response = await fetch("https://api.grok.im/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${grokApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-4-fast-reasoning",
        messages: [
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data !== null && "error" in data
          ? (data as any).error?.message || JSON.stringify(data)
          : response.statusText;
      console.error(`⚠️ Grok API error: ${errorMessage}`);
      throw new Error(`Grok API error: ${errorMessage}`);
    }

    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error("⚠️ No analysis content received from Grok");
      throw new Error("No analysis content received from Grok");
    }

    try {
      newAnalyses = JSON.parse(content);
    } catch (parseError) {
      console.error(
        "⚠️ Failed to parse AI response, using fallback analysis:",
        parseError,
      );
      newAnalyses = generateFallbackAnalyses(
        resultsNeedingAnalysis,
        query,
        analysisLevel,
      );
    }
  } catch (grokError) {
    console.error(
      "⚠️ Grok API call failed, generating fallback analyses:",
      grokError instanceof Error ? grokError.message : String(grokError),
    );
    newAnalyses = generateFallbackAnalyses(
      resultsNeedingAnalysis,
      query,
      analysisLevel,
    );
  }

  // Cache the new analyses
  console.log(`💾 Storing ${newAnalyses.length} analyses in cache...`);
  for (const analysis of newAnalyses) {
    const result = resultsNeedingAnalysis.find((r) => r.id === analysis.id);
    if (result) {
      const { error } = await supabase.from("search_analysis_cache").insert({
        chapter_id: analysis.id,
        query_text: query,
        analysis_level: analysisLevel,
        analysis_text: analysis.analysis,
        enhanced_score: analysis.enhancedScore,
        key_topics: analysis.keyTopics,
        relevance_reason: analysis.relevanceReason,
      });

      if (error) {
        console.warn(
          `⚠️ Failed to cache analysis for chapter ${analysis.id}: ${error.message}`,
        );
      }
    }
  }

  // Combine cached and new analyses
  const allAnalyses = results.map((result) => {
    const cached = cachedAnalyses[result.id];
    const newAnalysis = newAnalyses.find((a) => a.id === result.id);

    if (cached) {
      return {
        id: result.id,
        analysis: cached.analysis_text,
        enhancedScore: cached.enhanced_score,
        keyTopics: cached.key_topics || [],
        relevanceReason: cached.relevance_reason,
      };
    }

    if (newAnalysis) {
      return newAnalysis;
    }

    // Generate a descriptive fallback for any missing analyses
    const fallbackReason = generateRelevanceReason(
      result,
      query,
      analysisLevel,
    );
    return {
      id: result.id,
      analysis: `This chapter from "${result.bookTitle}" relates to your search for "${query}".`,
      enhancedScore: result.relevanceScore,
      keyTopics: extractKeyTopicsFromSnippet(result.snippet, query),
      relevanceReason: fallbackReason,
    };
  });

  return allAnalyses;
}

function getMaxTokens(analysisLevel: string, resultCount: number): number {
  const baseTokens =
    analysisLevel === "basic" ? 100 : analysisLevel === "advanced" ? 200 : 300;
  return Math.min(baseTokens * resultCount + 100, 4000);
}

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
        }
      );
    }

    const grokApiKey = Deno.env.get("GROK_API_KEY");
    if (!grokApiKey) {
      return new Response(
        JSON.stringify({ error: "Grok API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
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
      grokApiKey
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
      }
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
      }
    );
  }
});

async function analyzeResults(
  results: SearchResult[],
  query: string,
  analysisLevel: string,
  supabase: any,
  openaiApiKey: string
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
    `🧠 Generating analysis for ${resultsNeedingAnalysis.length} results...`
  );

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
${resultsNeedingAnalysis
  .map(
    (r, i) => `
${i + 1}. ID: ${r.id}
   Book: ${r.bookTitle}
   Chapter: ${r.chapterTitle}
   Content: ${r.snippet}
   Current Score: ${r.relevanceScore}
`
  )
  .join("\n")}

Return only valid JSON, no other text.`;

  const maxTokens = getMaxTokens(analysisLevel, resultsNeedingAnalysis.length);

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
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
    throw new Error(`OpenAI API error: ${errorMessage}`);
  }

  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("No analysis content received from OpenAI");
  }

  let newAnalyses: AnalyzedResult[] = [];

  try {
    newAnalyses = JSON.parse(content);
  } catch {
    console.error("Failed to parse AI response, using fallback analysis");
    newAnalyses = resultsNeedingAnalysis.map((result) => ({
      id: result.id,
      analysis: "Analysis not available",
      enhancedScore: result.relevanceScore,
      keyTopics: [],
      relevanceReason: "Matches search criteria",
    }));
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
          `⚠️ Failed to cache analysis for chapter ${analysis.id}: ${error.message}`
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

    return (
      newAnalysis || {
        id: result.id,
        analysis: "Analysis not available",
        enhancedScore: result.relevanceScore,
        keyTopics: [],
        relevanceReason: "Matches search criteria",
      }
    );
  });

  return allAnalyses;
}

function getMaxTokens(analysisLevel: string, resultCount: number): number {
  const baseTokens =
    analysisLevel === "basic"
      ? 100
      : analysisLevel === "advanced"
        ? 200
        : 300;
  return Math.min(baseTokens * resultCount + 100, 4000);
}

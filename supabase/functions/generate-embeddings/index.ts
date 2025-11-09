import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { text, query } = await req.json();
    const searchText = text || query;

    if (!searchText || searchText.trim() === "") {
      return new Response(
        JSON.stringify({ error: "Text is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Initialize Supabase client for cache lookups
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceRoleKey =
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Check cache first
    console.log(`📋 Checking cache for embedding: "${searchText}"`);
    const { data: cachedEmbedding } = await supabase
      .from("search_embeddings_cache")
      .select("*")
      .eq("query_text", searchText)
      .single();

    if (cachedEmbedding) {
      console.log(`✅ Cache hit! Returning cached embedding`);
      // Update usage stats
      await supabase.rpc("update_cache_usage", {
        cache_type: "embedding",
        cache_id: cachedEmbedding.id,
      });

      return new Response(
        JSON.stringify({
          success: true,
          embedding: cachedEmbedding.embedding,
          dimensions: cachedEmbedding.embedding.length,
          model: "text-embedding-3-small",
          cached: true,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Generate new embedding
    console.log(`🧠 Generating new embedding for: "${searchText}"`);

    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: searchText.trim(),
        encoding_format: "float",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage =
        typeof data === "object" && data !== null && "error" in data
          ? (data as any).error?.message || JSON.stringify(data)
          : JSON.stringify(data);
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${errorMessage}`
      );
    }

    const embedding = data.data[0].embedding;

    // Store in cache
    console.log(`💾 Storing embedding in cache`);
    const { error: cacheError } = await supabase
      .from("search_embeddings_cache")
      .insert({
        query_text: searchText,
        embedding: embedding,
      })
      .select()
      .single();

    if (cacheError) {
      console.warn(`⚠️ Failed to cache embedding: ${cacheError.message}`);
      // Continue even if caching fails
    }

    console.log(
      `✅ Embedding generated successfully (${embedding.length} dimensions)`
    );

    return new Response(
      JSON.stringify({
        success: true,
        embedding: embedding,
        dimensions: embedding.length,
        model: "text-embedding-3-small",
        cached: false,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error) {
    console.error("❌ Error:", error.message);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        data: null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});

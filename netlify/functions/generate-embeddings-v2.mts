import { Handler } from "@netlify/functions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const handler: Handler = async (event) => {
  console.log("[generate-embeddings-v2] Request:", event.httpMethod);

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
    const { text, query } = body;
    const searchText = text || query;

    if (!searchText || searchText.trim() === "") {
      return {
        statusCode: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ success: false, error: "Text is required" }),
      };
    }

    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return {
        statusCode: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: "OpenAI API key not configured",
        }),
      };
    }

    console.log("[generate-embeddings-v2] Calling OpenAI...");
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[generate-embeddings-v2] OpenAI error:", errorText);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: `OpenAI error: ${response.status}`,
        }),
      };
    }

    const data = (await response.json()) as any;
    const embedding = data.data?.[0]?.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      return {
        statusCode: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          success: false,
          error: "Invalid embedding response",
        }),
      };
    }

    console.log(
      "[generate-embeddings-v2] Success, returning",
      embedding.length,
      "dimensions"
    );

    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        embedding: embedding,
        dimensions: embedding.length,
        model: "text-embedding-3-small",
      }),
    };
  } catch (error: any) {
    console.error("[generate-embeddings-v2] Error:", error.message);
    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: false,
        error: error?.message || "Unknown error",
      }),
    };
  }
};

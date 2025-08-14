import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { text, query } = await req.json();
    const searchText = text || query;

    if (!searchText || searchText.trim() === "") {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get OpenAI API key from Netlify environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    console.log(
      `🧠 Netlify Function: Generating embeddings for text: "${searchText}"`,
    );

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
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = await response.json();
    const embedding = data.data[0].embedding;

    console.log(
      `✅ Netlify Function: Embeddings generated successfully (${embedding.length} dimensions)`,
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          embedding: embedding,
          dimensions: embedding.length,
          model: "text-embedding-3-small",
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("❌ Netlify Function Error:", error.message);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        data: null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

export const config: Config = {
  path: "/api/generate-embeddings",
};

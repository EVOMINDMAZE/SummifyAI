import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { topic } = await req.json();

    if (!topic) {
      return new Response(JSON.stringify({ error: 'Topic is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get OpenAI API key from Netlify environment variables
    const openaiApiKey = Netlify.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`🧠 Netlify Function: Analyzing topic "${topic}"`);

    const prompt = `Analyze the search topic "${topic}" for a business book search platform:

1. Is this topic too broad or specific enough?
2. Suggest 3 refined search variations that would yield better results
3. Explain why each refinement is useful

Respond with JSON:
{
  "isBroad": boolean,
  "explanation": "explanation of topic specificity",
  "refinements": [
    {
      "label": "display name",
      "value": "search term",
      "description": "why this refinement helps"
    }
  ]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert search analyst for business books. Always respond with valid JSON only.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0]?.message?.content?.trim() || '{}');

    console.log('✅ Netlify Function: Topic analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      data: {
        isBroad: result.isBroad || false,
        explanation: result.explanation || `Analysis of "${topic}" completed successfully.`,
        refinements: Array.isArray(result.refinements) ? result.refinements.slice(0, 3) : []
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Netlify Function Error:', error.message);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      fallback: {
        isBroad: topic.split(' ').length <= 2,
        explanation: topic.split(' ').length <= 2
          ? `"${topic}" is quite broad. More specific terms would help find targeted content.`
          : `"${topic}" has good specificity for finding relevant content.`,
        refinements: [
          {
            label: `${topic} Strategies`,
            value: `${topic} strategies`,
            description: `Focus on practical ${topic} techniques and approaches`,
          },
          {
            label: `Advanced ${topic}`,
            value: `advanced ${topic}`,
            description: `Expert-level ${topic} methods and frameworks`,
          },
          {
            label: `${topic} Applications`,
            value: `${topic} applications`,
            description: `Real-world ${topic} use cases and implementations`,
          },
        ],
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config: Config = {
  path: "/api/analyze-topic"
};

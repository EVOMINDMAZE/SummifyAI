import type { Context, Config } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { chapter, query } = await req.json();

    if (!chapter || !query) {
      return new Response(JSON.stringify({ error: 'Chapter data and query are required' }), {
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

    console.log(`📄 Netlify Function: Analyzing chapter "${chapter.chapter_title}" for query "${query}"`);

    const prompt = `As an expert content analyst, analyze this chapter for a user searching for "${query}":

Title: "${chapter.chapter_title}"
Content: ${chapter.chapter_text?.substring(0, 800) || ''}

Provide a JSON response with detailed analysis:
{
  "relevanceScore": number (25-100, how relevant this specific chapter is to "${query}"),
  "whyRelevant": "2-3 sentence explanation of WHY you chose this chapter and HOW it specifically helps with ${query}. Be specific about what the user will learn.",
  "keyTopics": ["topic1", "topic2", "topic3"],
  "coreLeadershipPrinciples": ["principle1", "principle2"],
  "practicalApplications": ["application1", "application2"],
  "aiExplanation": "Detailed explanation of why this chapter is valuable for someone seeking ${query} knowledge"
}

Focus on being specific about the practical value and direct relevance to the user's search query.`;

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
            content: 'You are an expert content analyst. Always respond with valid JSON only.'
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const aiResult = JSON.parse(data.choices[0]?.message?.content?.trim() || '{}');

    const enrichedChapter = {
      id: chapter.id,
      title: chapter.chapter_title,
      snippet: chapter.chapter_text?.substring(0, 300) || '',
      relevanceScore: Math.min(
        100,
        Math.max(
          25,
          aiResult.relevanceScore || Math.round((1 - (chapter.similarity_score || 0.5)) * 100)
        )
      ),
      whyRelevant: aiResult.whyRelevant || 
        `This chapter directly addresses ${query} by providing practical frameworks and actionable strategies that you can implement immediately in your work.`,
      keyTopics: Array.isArray(aiResult.keyTopics) ? aiResult.keyTopics.slice(0, 4) : [],
      coreLeadershipPrinciples: Array.isArray(aiResult.coreLeadershipPrinciples) 
        ? aiResult.coreLeadershipPrinciples.slice(0, 3) 
        : ["Apply systematic thinking", "Focus on measurable results"],
      practicalApplications: Array.isArray(aiResult.practicalApplications) 
        ? aiResult.practicalApplications.slice(0, 3) 
        : [
            `Apply these ${query} insights to daily practice`,
            "Implement systematic approaches"
          ],
      aiExplanation: aiResult.aiExplanation || 
        `Selected for its comprehensive coverage of ${query} concepts with proven methodologies and real-world applications.`
    };

    console.log('✅ Netlify Function: Chapter analysis completed successfully');

    return new Response(JSON.stringify({
      success: true,
      data: enrichedChapter
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ Netlify Function Error:', error.message);
    
    // Return fallback enrichment
    const fallbackEnrichment = {
      id: chapter?.id || 0,
      title: chapter?.chapter_title || 'Unknown Chapter',
      snippet: chapter?.chapter_text?.substring(0, 300) || '',
      relevanceScore: Math.max(25, Math.round((chapter?.similarity_score || 0.5) * 100)),
      whyRelevant: `This chapter provides relevant insights for ${query} through practical frameworks and actionable strategies.`,
      keyTopics: ["Leadership", "Strategy", "Management"],
      coreLeadershipPrinciples: [
        "Apply evidence-based methods",
        "Focus on measurable outcomes"
      ],
      practicalApplications: [
        `Implement these ${query} strategies in your daily work`,
        "Apply systematic approaches to achieve better results"
      ],
      aiExplanation: `Our analysis identified this chapter as relevant to ${query} due to its coverage of essential concepts and proven methodologies.`
    };

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      data: fallbackEnrichment
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config: Config = {
  path: "/api/analyze-chapter"
};

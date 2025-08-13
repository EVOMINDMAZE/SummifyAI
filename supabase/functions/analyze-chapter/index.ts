import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface ChapterAnalysisRequest {
  chapterId: string;
  chapterTitle: string;
  chapterSummary: string;
  bookTitle: string;
  bookAuthor: string;
  userQuery: string;
}

interface ChapterAnalysisResponse {
  chapterId: string;
  relevanceScore: number;
  whyRelevant: string;
  keyTopics: string[];
  confidence: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration is missing');
    }

    const { chapterId, chapterTitle, chapterSummary, bookTitle, bookAuthor, userQuery }: ChapterAnalysisRequest = await req.json();

    if (!chapterId || !chapterTitle || !chapterSummary || !userQuery) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Analyzing chapter "${chapterTitle}" for query: "${userQuery}"`);

    // Create detailed prompt for OpenAI
    const analysisPrompt = `
You are an expert business book analyst. Analyze how relevant this chapter is to a user's search query.

USER QUERY: "${userQuery}"

BOOK: "${bookTitle}" by ${bookAuthor}
CHAPTER: "${chapterTitle}"
CHAPTER SUMMARY: "${chapterSummary}"

Please provide a detailed analysis in the following JSON format:
{
  "relevanceScore": <number between 0-100>,
  "whyRelevant": "<specific explanation of why this chapter matches the user's query, mentioning concrete concepts and frameworks>",
  "keyTopics": ["<topic1>", "<topic2>", "<topic3>"],
  "confidence": <number between 0-100 indicating your confidence in this analysis>
}

Guidelines:
- relevanceScore: 90-100 = Extremely relevant (directly addresses the query with specific methods)
- relevanceScore: 70-89 = Highly relevant (covers the topic with useful insights)
- relevanceScore: 50-69 = Moderately relevant (touches on the topic but not the main focus)
- relevanceScore: 30-49 = Somewhat relevant (tangentially related)
- relevanceScore: 0-29 = Not relevant (little to no connection)

Be specific in your "whyRelevant" explanation. Mention actual concepts, frameworks, or methodologies from the chapter that relate to the query.
`;

    // Call OpenAI API for analysis
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert business book analyst who provides precise relevance scores and detailed explanations for how book chapters match user queries. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIResult = await openAIResponse.json();
    const analysisText = openAIResult.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis returned from OpenAI');
    }

    console.log('Raw OpenAI response:', analysisText);

    // Parse the JSON response
    let analysis: ChapterAnalysisResponse;
    try {
      const parsedAnalysis = JSON.parse(analysisText);
      analysis = {
        chapterId,
        relevanceScore: Math.min(100, Math.max(0, parsedAnalysis.relevanceScore || 0)),
        whyRelevant: parsedAnalysis.whyRelevant || `This chapter provides insights relevant to ${userQuery}.`,
        keyTopics: Array.isArray(parsedAnalysis.keyTopics) ? parsedAnalysis.keyTopics.slice(0, 5) : [],
        confidence: Math.min(100, Math.max(0, parsedAnalysis.confidence || 50))
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fallback analysis if JSON parsing fails
      analysis = {
        chapterId,
        relevanceScore: 50,
        whyRelevant: `This chapter from "${bookTitle}" discusses concepts related to ${userQuery}, offering practical insights and methodologies that can be applied to your specific needs.`,
        keyTopics: [userQuery.split(' ')[0] || 'business'],
        confidence: 30
      };
    }

    console.log(`✅ Analysis complete for chapter ${chapterId}: ${analysis.relevanceScore}% relevance`);

    // Store the analysis in Supabase for caching
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    try {
      await supabase
        .from('chapter_analyses')
        .upsert({
          chapter_id: chapterId,
          user_query: userQuery,
          relevance_score: analysis.relevanceScore,
          why_relevant: analysis.whyRelevant,
          key_topics: analysis.keyTopics,
          confidence: analysis.confidence,
          analyzed_at: new Date().toISOString()
        });
    } catch (dbError) {
      console.warn('Failed to cache analysis in database:', dbError);
      // Continue anyway, don't fail the entire request
    }

    return new Response(
      JSON.stringify(analysis),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Chapter analysis error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze chapter',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface Chapter {
  id: string;
  title: string;
  summary: string;
  book_title: string;
  book_author: string;
}

interface BatchAnalysisRequest {
  chapters: Chapter[];
  userQuery: string;
}

interface ChapterAnalysis {
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

    const { chapters, userQuery }: BatchAnalysisRequest = await req.json();

    if (!chapters || !Array.isArray(chapters) || chapters.length === 0 || !userQuery) {
      return new Response(
        JSON.stringify({ error: 'Missing chapters array or userQuery' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Batch analyzing ${chapters.length} chapters for query: "${userQuery}"`);

    // Process chapters in batches to avoid token limits
    const batchSize = 3; // Process 3 chapters at a time
    const results: ChapterAnalysis[] = [];

    for (let i = 0; i < chapters.length; i += batchSize) {
      const batch = chapters.slice(i, i + batchSize);
      
      // Create batch analysis prompt
      const batchPrompt = `
You are an expert business book analyst. Analyze how relevant these chapters are to the user's search query.

USER QUERY: "${userQuery}"

CHAPTERS TO ANALYZE:
${batch.map((chapter, index) => `
${index + 1}. BOOK: "${chapter.book_title}" by ${chapter.book_author}
   CHAPTER: "${chapter.title}"
   SUMMARY: "${chapter.summary}"
   CHAPTER_ID: "${chapter.id}"
`).join('\n')}

Please provide analysis for each chapter in the following JSON format:
{
  "analyses": [
    {
      "chapterId": "${batch[0]?.id}",
      "relevanceScore": <number between 0-100>,
      "whyRelevant": "<specific explanation>",
      "keyTopics": ["<topic1>", "<topic2>", "<topic3>"],
      "confidence": <number between 0-100>
    }
    // ... for each chapter
  ]
}

Guidelines:
- 90-100: Extremely relevant (directly addresses query with specific methods)
- 70-89: Highly relevant (covers topic with useful insights)
- 50-69: Moderately relevant (touches on topic)
- 30-49: Somewhat relevant (tangentially related)
- 0-29: Not relevant

Be specific in explanations. Mention actual concepts and frameworks.
`;

      try {
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
                content: 'You are an expert business book analyst. Always respond with valid JSON containing analyses for all requested chapters.'
              },
              {
                role: 'user',
                content: batchPrompt
              }
            ],
            temperature: 0.3,
            max_tokens: 1500,
          }),
        });

        if (!openAIResponse.ok) {
          console.error(`OpenAI API error for batch ${i / batchSize + 1}:`, await openAIResponse.text());
          // Add fallback analyses for this batch
          batch.forEach(chapter => {
            results.push({
              chapterId: chapter.id,
              relevanceScore: 50,
              whyRelevant: `This chapter from "${chapter.book_title}" discusses concepts related to ${userQuery}.`,
              keyTopics: [userQuery.split(' ')[0] || 'business'],
              confidence: 30
            });
          });
          continue;
        }

        const openAIResult = await openAIResponse.json();
        const analysisText = openAIResult.choices[0]?.message?.content;

        if (analysisText) {
          try {
            const parsedResult = JSON.parse(analysisText);
            if (parsedResult.analyses && Array.isArray(parsedResult.analyses)) {
              results.push(...parsedResult.analyses.map((analysis: any) => ({
                chapterId: analysis.chapterId,
                relevanceScore: Math.min(100, Math.max(0, analysis.relevanceScore || 0)),
                whyRelevant: analysis.whyRelevant || `This chapter provides insights relevant to ${userQuery}.`,
                keyTopics: Array.isArray(analysis.keyTopics) ? analysis.keyTopics.slice(0, 5) : [],
                confidence: Math.min(100, Math.max(0, analysis.confidence || 50))
              })));
            } else {
              throw new Error('Invalid response format');
            }
          } catch (parseError) {
            console.error('Failed to parse batch response:', parseError);
            // Add fallback for this batch
            batch.forEach(chapter => {
              results.push({
                chapterId: chapter.id,
                relevanceScore: 50,
                whyRelevant: `This chapter from "${chapter.book_title}" discusses concepts related to ${userQuery}.`,
                keyTopics: [userQuery.split(' ')[0] || 'business'],
                confidence: 30
              });
            });
          }
        }

        // Small delay between batches to respect rate limits
        if (i + batchSize < chapters.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (error) {
        console.error(`Error processing batch ${i / batchSize + 1}:`, error);
        // Add fallback for failed batch
        batch.forEach(chapter => {
          results.push({
            chapterId: chapter.id,
            relevanceScore: 40,
            whyRelevant: `This chapter from "${chapter.book_title}" may contain relevant insights for ${userQuery}.`,
            keyTopics: [userQuery.split(' ')[0] || 'business'],
            confidence: 25
          });
        });
      }
    }

    console.log(`✅ Batch analysis complete: processed ${results.length} chapters`);

    // Cache results in Supabase
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const cacheData = results.map(result => ({
          chapter_id: result.chapterId,
          user_query: userQuery,
          relevance_score: result.relevanceScore,
          why_relevant: result.whyRelevant,
          key_topics: result.keyTopics,
          confidence: result.confidence,
          analyzed_at: new Date().toISOString()
        }));

        await supabase
          .from('chapter_analyses')
          .upsert(cacheData);
        
        console.log(`📊 Cached ${cacheData.length} analyses in database`);
      } catch (dbError) {
        console.warn('Failed to cache batch results:', dbError);
      }
    }

    return new Response(
      JSON.stringify({ analyses: results }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Batch analysis error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze chapters',
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

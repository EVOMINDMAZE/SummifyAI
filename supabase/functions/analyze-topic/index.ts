import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const grokApiKey = Deno.env.get('GROK_API_KEY');

interface TopicAnalysisRequest {
  topic: string;
}

interface TopicAnalysisResponse {
  isBroad: boolean;
  explanation: string;
  refinements: Array<{
    label: string;
    value: string;
    description: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { topic }: TopicAnalysisRequest = await req.json();

    if (!topic || topic.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Topic is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Analyzing topic: "${topic}"`);

    // Quick check for obviously broad topics
    const broadTopics = ['leadership', 'management', 'business', 'strategy', 'communication', 'marketing', 'sales'];
    const isBroadTopic = broadTopics.some(broad => 
      topic.toLowerCase().includes(broad) && topic.split(' ').length <= 2
    );

    if (!isBroadTopic || !grokApiKey) {
      // Return immediately for specific topics or when AI is not available
      return new Response(
        JSON.stringify({
          isBroad: false,
          explanation: `Your search for "${topic}" is specific enough to find relevant chapters.`,
          refinements: []
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // For broad topics, provide AI-powered refinement suggestions
    const analysisPrompt = `
Analyze this search topic and determine if it's too broad for finding specific business book chapters.

TOPIC: "${topic}"

If this topic is broad, suggest 3-4 more specific refinements that would help users find better chapters.

Respond in JSON format:
{
  "isBroad": true/false,
  "explanation": "explanation text",
  "refinements": [
    {
      "label": "Specific aspect name",
      "value": "specific search query",
      "description": "why this refinement is useful"
    }
  ]
}

Guidelines:
- Only mark as broad if the topic could match thousands of chapters
- Refinements should be specific, actionable topics
- Focus on practical business applications
`;

    try {
      const grokResponse = await fetch('https://api.grok.im/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${grokApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'grok-4-fast-reasoning',
          messages: [
            {
              role: 'system',
              content: 'You are a business book search expert. Help users refine broad topics into specific, actionable searches. Always respond with valid JSON.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 400,
        }),
      });

      if (!grokResponse.ok) {
        throw new Error(`Grok API error: ${grokResponse.status}`);
      }

      const grokResult = await grokResponse.json();
      const analysisText = grokResult.choices[0]?.message?.content;

      if (analysisText) {
        const analysis = JSON.parse(analysisText);
        console.log(`✅ Topic analysis complete: ${analysis.isBroad ? 'broad' : 'specific'}`);
        
        return new Response(
          JSON.stringify(analysis),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
    } catch (aiError) {
      console.warn('AI analysis failed, using fallback:', aiError);
    }

    // Fallback refinements for common broad topics
    const fallbackRefinements: Record<string, any> = {
      'leadership': {
        isBroad: true,
        explanation: 'Leadership is a broad topic. Here are more specific areas to explore:',
        refinements: [
          {
            label: 'Team Leadership',
            value: 'team leadership strategies for managers',
            description: 'Focus on managing and motivating teams'
          },
          {
            label: 'Remote Leadership',
            value: 'remote leadership and virtual teams',
            description: 'Leading distributed and remote teams'
          },
          {
            label: 'Crisis Leadership',
            value: 'crisis leadership and change management',
            description: 'Leading through difficult times and change'
          }
        ]
      },
      'management': {
        isBroad: true,
        explanation: 'Management covers many areas. Try these specific focuses:',
        refinements: [
          {
            label: 'Project Management',
            value: 'project management methodologies and tools',
            description: 'Specific project management techniques'
          },
          {
            label: 'Performance Management',
            value: 'employee performance management strategies',
            description: 'Managing and improving team performance'
          },
          {
            label: 'Time Management',
            value: 'time management and productivity techniques',
            description: 'Personal and team productivity methods'
          }
        ]
      }
    };

    const fallback = fallbackRefinements[topic.toLowerCase()];
    if (fallback) {
      return new Response(
        JSON.stringify(fallback),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }

    // Default response for specific topics
    return new Response(
      JSON.stringify({
        isBroad: false,
        explanation: `Your search for "${topic}" is specific enough to find relevant chapters.`,
        refinements: []
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Topic analysis error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze topic',
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

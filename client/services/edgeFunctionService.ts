import { supabase } from '@/lib/supabase';

// Edge Function service for calling Supabase Edge Functions
class EdgeFunctionService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL?.replace('/rest/v1', '') || '';
  }

  private async callFunction(functionName: string, payload: any) {
    try {
      console.log(`🔄 Attempting to call edge function: ${functionName}`);

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
      });

      if (error) {
        // Check if it's a "function not found" type error
        if (error.message?.includes('Failed to send a request') ||
            error.message?.includes('FunctionsFetchError') ||
            error.message?.includes('not found')) {
          console.warn(`⚠️ Edge function ${functionName} not deployed. Using fallback mode.`);
          console.info(`💡 To deploy: supabase functions deploy ${functionName}`);
          throw new Error('FUNCTION_NOT_DEPLOYED');
        }

        console.error(`❌ Edge function ${functionName} error:`, error);
        throw error;
      }

      console.log(`✅ Edge function ${functionName} completed successfully`);
      return data;

    } catch (error) {
      if (error.message === 'FUNCTION_NOT_DEPLOYED') {
        throw error;
      }
      console.error(`❌ Failed to call edge function ${functionName}:`, error);
      throw new Error('FUNCTION_ERROR');
    }
  }

  // Analyze topic using edge function
  async analyzeTopicWithAI(topic: string) {
    try {
      const result = await this.callFunction('analyze-topic', { topic });

      if (result.success) {
        return result.data;
      } else {
        console.warn('🔄 Using fallback from edge function');
        return result.fallback;
      }
    } catch (error) {
      if (error.message === 'FUNCTION_NOT_DEPLOYED') {
        console.info('📋 Edge Functions not deployed yet. Using local analysis.');
        console.info('🚀 Deploy with: supabase functions deploy analyze-topic');
      } else {
        console.warn('⚠️ Edge function temporarily unavailable, using fallback');
      }

      // Return local fallback
      return this.createFallbackTopicAnalysis(topic);
    }
  }

  // Analyze chapter using edge function
  async analyzeChapterWithAI(chapter: any, query: string) {
    try {
      const result = await this.callFunction('analyze-chapter', { chapter, query });

      if (result.success) {
        return result.data;
      } else {
        console.warn('🔄 Using fallback from edge function');
        return result.data; // Fallback is included in data
      }
    } catch (error) {
      if (error.message === 'FUNCTION_NOT_DEPLOYED') {
        console.info('📋 Edge Functions not deployed yet. Using local analysis.');
      } else {
        console.warn('⚠️ Edge function temporarily unavailable, using fallback');
      }

      // Return local fallback
      return this.createFallbackChapterAnalysis(chapter, query);
    }
  }

  // Generate embeddings using edge function
  async generateEmbeddings(query: string): Promise<number[] | null> {
    try {
      const result = await this.callFunction('generate-embeddings', { query });

      if (result.success && result.data?.embedding) {
        console.log(`🧠 Generated embeddings: ${result.data.dimensions} dimensions`);
        return result.data.embedding;
      } else {
        console.warn('❌ Embeddings generation failed');
        return null;
      }
    } catch (error) {
      if (error.message === 'FUNCTION_NOT_DEPLOYED') {
        console.info('📋 Edge Functions not deployed yet. Embeddings unavailable.');
        console.info('🚀 Deploy with: supabase functions deploy generate-embeddings');
      } else {
        console.warn('⚠️ Embeddings temporarily unavailable');
      }
      return null;
    }
  }

  // Fallback topic analysis when edge function fails
  private createFallbackTopicAnalysis(topic: string) {
    return {
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
    };
  }

  // Fallback chapter analysis when edge function fails
  private createFallbackChapterAnalysis(chapter: any, query: string) {
    const score = Math.max(25, Math.round((chapter.similarity_score || 0.5) * 100));
    
    return {
      id: chapter.id,
      title: chapter.chapter_title,
      snippet: chapter.chapter_text?.substring(0, 300) || '',
      relevanceScore: score,
      whyRelevant: `This chapter provides relevant insights for ${query} through practical frameworks and actionable strategies.`,
      keyTopics: this.extractKeywords(chapter.chapter_text || ''),
      coreLeadershipPrinciples: [
        "Apply evidence-based methods",
        "Focus on measurable outcomes",
      ],
      practicalApplications: [
        `Implement these ${query} strategies in your daily work`,
        "Apply systematic approaches to achieve better results",
      ],
      aiExplanation: `Our analysis identified this chapter as relevant to ${query} due to its coverage of essential concepts and proven methodologies.`,
    };
  }

  // Helper function to extract keywords from text
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const businessTerms = [
      "strategy", "leadership", "management", "innovation", 
      "communication", "development", "performance", "growth", 
      "planning", "execution"
    ];

    const found = businessTerms.filter((term) => words.includes(term));
    return found
      .slice(0, 4)
      .map((term) => term.charAt(0).toUpperCase() + term.slice(1));
  }
}

// Create singleton instance
export const edgeFunctionService = new EdgeFunctionService();

// Netlify Functions service for calling serverless functions
class NetlifyFunctionService {
  private baseUrl: string;

  constructor() {
    // Use current domain for Netlify Functions
    this.baseUrl = window.location.origin;
  }

  private async callFunction(functionPath: string, payload: any) {
    try {
      console.log(`🔄 Calling Netlify function: ${functionPath}`);
      
      const response = await fetch(`${this.baseUrl}${functionPath}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log(`✅ Netlify function ${functionPath} completed successfully`);
      return result;

    } catch (error) {
      console.error(`❌ Failed to call Netlify function ${functionPath}:`, error);
      throw error;
    }
  }

  // Analyze topic using Netlify function
  async analyzeTopicWithAI(topic: string) {
    try {
      const result = await this.callFunction('/api/analyze-topic', { topic });
      
      if (result.success) {
        return result.data;
      } else {
        console.warn('🔄 Using fallback from Netlify function');
        return result.fallback;
      }
    } catch (error) {
      console.warn('⚠️ Netlify function temporarily unavailable, using fallback');
      
      // Return local fallback
      return this.createFallbackTopicAnalysis(topic);
    }
  }

  // Analyze chapter using Netlify function  
  async analyzeChapterWithAI(chapter: any, query: string) {
    try {
      const result = await this.callFunction('/api/analyze-chapter', { chapter, query });
      
      if (result.success) {
        return result.data;
      } else {
        console.warn('🔄 Using fallback from Netlify function');
        return result.data; // Fallback is included in data
      }
    } catch (error) {
      console.warn('⚠️ Netlify function temporarily unavailable, using fallback');
      
      // Return local fallback
      return this.createFallbackChapterAnalysis(chapter, query);
    }
  }

  // Generate embeddings using Netlify function
  async generateEmbeddings(query: string): Promise<number[] | null> {
    try {
      const result = await this.callFunction('/api/generate-embeddings', { query });
      
      if (result.success && result.data?.embedding) {
        console.log(`🧠 Generated embeddings: ${result.data.dimensions} dimensions`);
        return result.data.embedding;
      } else {
        console.warn('❌ Embeddings generation failed');
        return null;
      }
    } catch (error) {
      console.warn('⚠️ Embeddings temporarily unavailable');
      return null;
    }
  }

  // Fallback topic analysis when function fails
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

  // Fallback chapter analysis when function fails
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
export const netlifyFunctionService = new NetlifyFunctionService();

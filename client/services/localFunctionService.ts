// Local development service to simulate Netlify Functions
// This allows testing the app locally without deploying functions

class LocalFunctionService {
  // Simulate topic analysis locally
  async analyzeTopicWithAI(topic: string) {
    console.log(`🔧 Local development: Analyzing topic "${topic}"`);

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      isBroad: topic.split(" ").length <= 2,
      explanation:
        topic.split(" ").length <= 2
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

  // Simulate chapter analysis locally
  async analyzeChapterWithAI(chapter: any, query: string) {
    console.log(
      `🔧 Local development: Analyzing chapter "${chapter.chapter_title}"`,
    );

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const score = Math.max(
      25,
      Math.round((chapter.similarity_score || 0.7) * 100),
    );

    return {
      id: chapter.id,
      title: chapter.chapter_title,
      snippet: chapter.chapter_text?.substring(0, 300) || "",
      relevanceScore: score,
      whyRelevant: `This chapter provides excellent insights for ${query} through practical frameworks and actionable strategies.`,
      keyTopics: this.extractKeywords(chapter.chapter_text || ""),
      coreLeadershipPrinciples: [
        "Apply evidence-based methods",
        "Focus on measurable outcomes",
        "Build sustainable systems",
      ],
      practicalApplications: [
        `Implement these ${query} strategies in your daily work`,
        "Apply systematic approaches to achieve better results",
        "Use data-driven decision making",
      ],
      aiExplanation: `Our local analysis identified this chapter as highly relevant to ${query} due to its comprehensive coverage and proven methodologies.`,
    };
  }

  // Simulate embeddings generation (return null for now)
  async generateEmbeddings(query: string): Promise<number[] | null> {
    console.log(
      `🔧 Local development: Embeddings for "${query}" not available locally`,
    );
    return null;
  }

  // Helper function to extract keywords from text
  private extractKeywords(text: string): string[] {
    const words = text.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
    const businessTerms = [
      "strategy",
      "leadership",
      "management",
      "innovation",
      "communication",
      "development",
      "performance",
      "growth",
      "planning",
      "execution",
      "productivity",
      "teamwork",
    ];

    const found = businessTerms.filter((term) => words.some(word => word === term));
    return found
      .slice(0, 4)
      .map((term) => term.charAt(0).toUpperCase() + term.slice(1));
  }
}

// Export singleton instance
export const localFunctionService = new LocalFunctionService();

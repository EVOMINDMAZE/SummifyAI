import { supabase, supabaseUrl } from "@/lib/supabase";

export interface SearchTier {
  name: string;
  maxQueries: number;
  features: SearchFeature[];
  description: string;
  upgradeMessage?: string;
}

export interface SearchFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface SearchResult {
  id: number;
  bookTitle: string;
  chapterTitle: string;
  relevanceScore: number;
  snippet: string;
  summarySnippet?: string;
  searchType: "summary" | "chapter" | "fulltext";
  aiAnalysis?: string;
  whyRelevant?: string;
  keyTopics?: string[];
}

export interface TieredSearchResponse {
  results: SearchResult[];
  searchTier: SearchTier;
  queriesUsed: number;
  queriesRemaining: number;
  upgradeRequired: boolean;
  upgradeMessage?: string;
  totalBooksFound: number;
  totalChaptersFound: number;
}

// Define search tiers and their capabilities
export const SEARCH_TIERS: Record<string, SearchTier> = {
  free: {
    name: "Free",
    maxQueries: 10,
    features: [
      {
        id: "summary_search",
        name: "Summary Search",
        description:
          "Search through chapter summaries for quick concept discovery",
        enabled: true,
      },
      {
        id: "basic_ai",
        name: "Basic AI Insights",
        description: "Get basic relevance scoring and key topics",
        enabled: true,
      },
    ],
    description: "Perfect for casual readers and students getting started",
    upgradeMessage:
      "Upgrade to Scholar for deeper chapter search and more queries!",
  },
  scholar: {
    name: "Scholar",
    maxQueries: 500,
    features: [
      {
        id: "summary_search",
        name: "Summary Search",
        description: "Lightning-fast concept discovery through summaries",
        enabled: true,
      },
      {
        id: "chapter_search",
        name: "Chapter Content Search",
        description: "Deep semantic search through full chapter content",
        enabled: true,
      },
      {
        id: "advanced_ai",
        name: "Advanced AI Analysis",
        description: "Detailed relevance analysis and key topic extraction",
        enabled: true,
      },
      {
        id: "export_results",
        name: "Export Results",
        description: "Download your search results and analyses",
        enabled: true,
      },
    ],
    description: "Ideal for researchers and serious learners",
    upgradeMessage:
      "Upgrade to Professional for word-by-word precision search!",
  },
  professional: {
    name: "Professional",
    maxQueries: 2000,
    features: [
      {
        id: "summary_search",
        name: "Summary Search",
        description: "Instant concept discovery",
        enabled: true,
      },
      {
        id: "chapter_search",
        name: "Chapter Content Search",
        description: "Deep semantic search through all content",
        enabled: true,
      },
      {
        id: "fulltext_search",
        name: "Word-by-Word Precision",
        description: "Exact phrase matching and word-level analysis",
        enabled: true,
      },
      {
        id: "premium_ai",
        name: "Premium AI Models",
        description: "Most advanced AI analysis with detailed insights",
        enabled: true,
      },
      {
        id: "api_access",
        name: "API Access",
        description: "Integrate search into your own applications",
        enabled: true,
      },
    ],
    description: "Built for professionals and content creators",
  },
  institution: {
    name: "Institution",
    maxQueries: -1, // Unlimited
    features: [
      {
        id: "summary_search",
        name: "Summary Search",
        description: "Instant concept discovery",
        enabled: true,
      },
      {
        id: "chapter_search",
        name: "Chapter Content Search",
        description: "Deep semantic search through all content",
        enabled: true,
      },
      {
        id: "fulltext_search",
        name: "Word-by-Word Precision",
        description: "Exact phrase matching and word-level analysis",
        enabled: true,
      },
      {
        id: "premium_ai",
        name: "Premium AI Models",
        description: "Most advanced AI analysis with detailed insights",
        enabled: true,
      },
      {
        id: "team_collaboration",
        name: "Team Collaboration",
        description: "Share searches and insights with your team",
        enabled: true,
      },
      {
        id: "custom_models",
        name: "Custom AI Models",
        description: "Train models on your specific domain",
        enabled: true,
      },
    ],
    description: "Enterprise-grade search for institutions and large teams",
  },
};

export class TieredSearchService {
  async performSearch(
    query: string,
    userPlan: string = "free",
    userSearchCount: number = 0,
  ): Promise<TieredSearchResponse> {
    const searchTier = SEARCH_TIERS[userPlan] || SEARCH_TIERS.free;

    // Check if user has reached query limit
    if (
      searchTier.maxQueries !== -1 &&
      userSearchCount >= searchTier.maxQueries
    ) {
      return {
        results: [],
        searchTier,
        queriesUsed: userSearchCount,
        queriesRemaining: 0,
        upgradeRequired: true,
        upgradeMessage: `You've reached your ${searchTier.maxQueries} monthly search limit. ${searchTier.upgradeMessage || "Upgrade for more searches!"}`,
      };
    }

    try {
      let results: SearchResult[] = [];

      // Try to generate query embedding for vector search
      let queryEmbedding: number[] | null = null;
      try {
        queryEmbedding = await this.generateEmbedding(query);
      } catch (embeddingError) {
        console.warn(
          "Embedding generation failed, falling back to text search:",
          embeddingError,
        );
      }

      // Only use vector search if embeddings are available
      if (queryEmbedding) {
        if (
          searchTier.features.find((f) => f.id === "summary_search")?.enabled
        ) {
          // Stage 1: Fast summary search (all tiers)
          const summaryResults = await this.searchSummaryEmbeddings(
            query,
            queryEmbedding,
          );
          results = [...results, ...summaryResults];
        }

        if (
          searchTier.features.find((f) => f.id === "chapter_search")?.enabled
        ) {
          // Stage 2: Deep chapter search (Scholar+)
          const chapterResults = await this.searchChapterEmbeddings(
            query,
            queryEmbedding,
            results.slice(0, 50),
          );
          results = this.mergeResults(results, chapterResults);
        }
      }

      // Use full-text search for Professional+ tier OR as fallback when no embeddings
      if (
        searchTier.features.find((f) => f.id === "fulltext_search")?.enabled ||
        !queryEmbedding
      ) {
        // Stage 3: Full-text search (Professional+ or fallback)
        const fulltextResults = await this.searchFullText(query);
        results = this.mergeResults(results, fulltextResults);
      }

      // If no results after vector search, try basic text search as fallback for all tiers
      if (results.length === 0) {
        console.log("📄 No vector results, falling back to basic text search...");
        const basicResults = await this.searchBasicText(query);
        results = basicResults;
      }

      // Apply AI analysis based on tier
      if (searchTier.features.find((f) => f.id.includes("ai"))?.enabled) {
        results = await this.addAIAnalysis(results, query, userPlan);
      }

      // Count total books found before limiting results
      const uniqueBooksBeforeLimiting = new Set(results.map((r) => r.bookTitle)).size;
      const totalChaptersBeforeLimiting = results.length;

      // Limit results based on tier
      const maxResults =
        userPlan === "free" ? 5 : userPlan === "scholar" ? 15 : 25;
      results = results.slice(0, maxResults);

      return {
        results,
        searchTier,
        queriesUsed: userSearchCount + 1,
        queriesRemaining:
          searchTier.maxQueries === -1
            ? -1
            : searchTier.maxQueries - userSearchCount - 1,
        upgradeRequired: false,
        totalBooksFound: uniqueBooksBeforeLimiting,
        totalChaptersFound: totalChaptersBeforeLimiting,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Search error:", errorMessage);
      throw new Error(`Search failed: ${errorMessage}`);
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    const trimmedText = text.trim();

    try {
      console.log("🧠 Generating embedding via Supabase edge function...");

      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      // Prepare headers with auth
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      // Construct edge function URL
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/generate-embeddings`;

      console.log("📡 Calling edge function via HTTP...");
      const response = await fetch(edgeFunctionUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({ text: trimmedText }),
      });

      const result = await response.json();
      console.log("📥 Received response:", { status: response.status, success: result?.success });

      if (!response.ok) {
        const errorMsg = result?.error || result?.details || response.statusText;
        console.error("❌ Edge function error:", errorMsg);
        throw new Error(`Edge function error: ${errorMsg}`);
      }

      if (!result?.success) {
        throw new Error(result?.error || "Embedding generation failed");
      }

      const embedding = result.embedding;

      if (!embedding || !Array.isArray(embedding)) {
        throw new Error("Invalid embedding data received");
      }

      console.log(`✅ Embedding generated (${embedding.length} dimensions)`);
      return embedding;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("❌ Embedding generation error:", errorMessage);
      throw new Error(`Embedding generation failed: ${errorMessage}`);
    }
  }

  private async searchSummaryEmbeddings(
    query: string,
    queryEmbedding: number[],
  ): Promise<SearchResult[]> {
    try {
      console.log("📚 Searching chapter summaries with embeddings...");
      // Use Supabase vector similarity search on summary embeddings
      // Use lower threshold (0.5) to catch more results, especially for common words
      const { data, error } = await supabase.rpc("search_summary_embeddings", {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: 50,
      });

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : String(error);
        throw new Error(errorMessage);
      }

      const results = (
        data?.map((row: any) => ({
          id: row.id,
          bookTitle: row.book_title,
          chapterTitle: row.chapter_title,
          relevanceScore: 1 - row.distance, // Convert distance to similarity
          snippet: row.chapter_summary?.substring(0, 200) + "...",
          summarySnippet: row.chapter_summary,
          searchType: "summary" as const,
          whyRelevant: `This chapter summary contains relevant information about your search topic.`,
          keyTopics: this.extractTopicsFromText(row.chapter_summary || ""),
        })) || []
      );

      console.log(`✅ Summary search returned ${results.length} results`);
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn("Summary search error (returning empty results):", errorMessage);
      return [];
    }
  }

  private async searchChapterEmbeddings(
    query: string,
    queryEmbedding: number[],
    candidateResults: SearchResult[],
  ): Promise<SearchResult[]> {
    try {
      // Get candidate IDs from summary search
      const candidateIds = candidateResults.map((r) => r.id);

      if (candidateIds.length === 0) {
        console.log("⚠️ No candidates for chapter embeddings search");
        return [];
      }

      console.log(`��� Searching ${candidateIds.length} candidate chapters with embeddings...`);
      // Search chapter embeddings only for candidates
      const { data, error } = await supabase.rpc("search_chapter_embeddings", {
        query_embedding: queryEmbedding,
        candidate_ids: candidateIds,
        match_threshold: 0.4,  // Lower threshold to catch more matches in chapter content
        match_count: 25,
      });

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : String(error);
        throw new Error(errorMessage);
      }

      const results = (
        data?.map((row: any) => ({
          id: row.id,
          bookTitle: row.book_title,
          chapterTitle: row.chapter_title,
          relevanceScore: 1 - row.distance,
          snippet: this.extractSnippet(row.chapter_text, query),
          searchType: "chapter" as const,
          whyRelevant: `This chapter contains detailed information related to your search query.`,
          keyTopics: this.extractTopicsFromText(row.chapter_text || ""),
        })) || []
      );

      console.log(`✅ Chapter search returned ${results.length} results`);
      return results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn("Chapter search error (returning empty results):", errorMessage);
      return [];
    }
  }

  private async searchFullText(query: string): Promise<SearchResult[]> {
    try {
      console.log("📝 Performing full-text search...");
      // Full-text search using PostgreSQL's text search
      const { data, error } = await supabase.rpc("search_fulltext", {
        search_query: query,
        match_count: 20,
      });

      if (error) {
        const errorMessage = typeof error === 'object' && error !== null && 'message' in error
          ? (error as any).message
          : String(error);
        throw new Error(errorMessage);
      }

      console.log(`✅ Full-text search returned ${data?.length || 0} results`);

      return (
        data?.map((row: any) => ({
          id: row.id,
          bookTitle: row.book_title,
          chapterTitle: row.chapter_title,
          relevanceScore: row.rank,
          snippet: this.extractSnippet(row.chapter_text, query),
          searchType: "fulltext" as const,
          whyRelevant: `This chapter contains exact text matches for your search terms.`,
          keyTopics: this.extractTopicsFromText(row.chapter_text || ""),
        })) || []
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Full-text search error:", errorMessage);
      return [];
    }
  }

  private async addAIAnalysis(
    results: SearchResult[],
    query: string,
    userPlan: string,
  ): Promise<SearchResult[]> {
    // Use gpt-4o-mini for cost-efficient analysis
    const analysisLevel =
      userPlan === "free"
        ? "basic"
        : userPlan === "scholar"
          ? "advanced"
          : "premium";

    const resultsToAnalyze = results.slice(0, 10); // Limit AI analysis for cost control

    try {
      console.log(`🤖 Analyzing ${resultsToAnalyze.length} results with ${analysisLevel} level via Supabase...`);

      // Get current session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      // Prepare headers with auth
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (session?.access_token) {
        headers.Authorization = `Bearer ${session.access_token}`;
      }

      // Construct edge function URL
      const edgeFunctionUrl = `${supabaseUrl}/functions/v1/analyze-search-results`;

      console.log("📡 Calling analysis edge function via HTTP...");
      const response = await fetch(edgeFunctionUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          results: resultsToAnalyze,
          query,
          analysisLevel,
        }),
      });

      const data = await response.json();
      console.log("📥 Received response:", { status: response.status });

      if (!response.ok) {
        const errorMsg = data?.error || data?.details || response.statusText;
        console.error("❌ Analysis edge function error:", errorMsg);
        throw new Error(`Analysis edge function error: ${errorMsg}`);
      }

      const { analyzedResults } = data;

      console.log(`✅ Analysis complete`);

      return results.map((result, index) => ({
        ...result,
        aiAnalysis: analyzedResults[index]?.analysis || undefined,
        relevanceScore:
          analyzedResults[index]?.enhancedScore || result.relevanceScore,
        whyRelevant: analyzedResults[index]?.relevanceReason || result.whyRelevant,
        keyTopics: analyzedResults[index]?.keyTopics || result.keyTopics,
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn("⚠️ AI analysis error (continuing without analysis):", errorMessage);
      return results; // Return results without AI analysis on error
    }
  }

  private extractSnippet(text: string, query: string): string {
    if (!text) return "";

    const words = query.toLowerCase().split(" ");
    const textLower = text.toLowerCase();

    for (const word of words) {
      const index = textLower.indexOf(word);
      if (index !== -1) {
        const start = Math.max(0, index - 100);
        const end = Math.min(text.length, index + 300);
        return "..." + text.substring(start, end) + "...";
      }
    }

    return text.substring(0, 200) + "...";
  }

  private async searchBasicText(query: string): Promise<SearchResult[]> {
    try {
      // Fallback to basic Supabase text search
      const { data, error } = await supabase
        .from("chapters")
        .select(
          `
          id,
          chapter_title,
          chapter_text,
          chapter_summary,
          books!inner(title)
        `,
        )
        .or(
          `chapter_title.ilike.%${query}%,chapter_text.ilike.%${query}%,chapter_summary.ilike.%${query}%`,
        )
        .limit(20);

      if (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn("Basic search error (returning empty results):", errorMessage);
        return [];
      }

      return (
        data?.map((row: any) => ({
          id: row.id,
          bookTitle: row.books.title,
          chapterTitle: row.chapter_title,
          relevanceScore: 0.5, // Basic relevance score
          snippet: this.extractSnippet(
            row.chapter_text || row.chapter_summary,
            query,
          ),
          searchType: "fulltext" as const,
          whyRelevant: `This chapter contains text that matches your search terms.`,
          keyTopics: this.extractTopicsFromText(
            row.chapter_text || row.chapter_summary || "",
          ),
        })) || []
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("Basic text search error:", errorMessage);
      return [];
    }
  }

  private extractTopicsFromText(text: string): string[] {
    if (!text) return [];

    // Simple keyword extraction for topic generation
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .filter(
        (word) =>
          ![
            "this",
            "that",
            "with",
            "from",
            "they",
            "were",
            "been",
            "have",
            "will",
            "chapter",
            "book",
            "text",
            "information",
            "content",
          ].includes(word),
      );

    // Get unique words and return top 3-5
    const uniqueWords = [...new Set(words)];
    return uniqueWords
      .slice(0, 4)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1));
  }

  private mergeResults(
    existing: SearchResult[],
    newResults: SearchResult[],
  ): SearchResult[] {
    const merged = [...existing];
    const existingIds = new Set(existing.map((r) => r.id));

    for (const result of newResults) {
      if (!existingIds.has(result.id)) {
        merged.push(result);
      } else {
        // Update existing result with better score if available
        const existingIndex = merged.findIndex((r) => r.id === result.id);
        if (
          existingIndex !== -1 &&
          result.relevanceScore > merged[existingIndex].relevanceScore
        ) {
          merged[existingIndex] = { ...merged[existingIndex], ...result };
        }
      }
    }

    return merged.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

export const tieredSearchService = new TieredSearchService();

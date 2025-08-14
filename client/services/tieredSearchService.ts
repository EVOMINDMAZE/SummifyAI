import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

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
}

export interface TieredSearchResponse {
  results: SearchResult[];
  searchTier: SearchTier;
  queriesUsed: number;
  queriesRemaining: number;
  upgradeRequired: boolean;
  upgradeMessage?: string;
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
        console.warn("Embedding generation failed, falling back to text search:", embeddingError);
      }

      // Only use vector search if embeddings are available
      if (queryEmbedding) {
        if (searchTier.features.find((f) => f.id === "summary_search")?.enabled) {
          // Stage 1: Fast summary search (all tiers)
          const summaryResults = await this.searchSummaryEmbeddings(
            query,
            queryEmbedding,
          );
          results = [...results, ...summaryResults];
        }

        if (searchTier.features.find((f) => f.id === "chapter_search")?.enabled) {
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

      // If no results and no embeddings, try basic database search
      if (results.length === 0 && !queryEmbedding) {
        const basicResults = await this.searchBasicText(query);
        results = basicResults;
      }

      // Apply AI analysis based on tier
      if (searchTier.features.find((f) => f.id.includes("ai"))?.enabled) {
        results = await this.addAIAnalysis(results, query, userPlan);
      }

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
      };
    } catch (error) {
      console.error("Search error:", error);
      throw new Error("Search failed. Please try again.");
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Try the new path first, then fall back to old path
      let response = await fetch("/api/generate-embeddings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      // If that fails, try the old Netlify functions path
      if (!response.ok) {
        response = await fetch("/.netlify/functions/generate-embeddings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Embedding API error:", errorText);
        throw new Error(`Failed to generate embedding: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      // Handle both response formats
      const embedding = result.embedding || result.data?.embedding;

      if (!embedding) {
        console.error("No embedding in response:", result);
        throw new Error("No embedding data received");
      }

      return embedding;
    } catch (error) {
      console.error("Embedding generation error:", error);
      throw new Error("Failed to generate embedding");
    }
  }

  private async searchSummaryEmbeddings(
    query: string,
    queryEmbedding: number[],
  ): Promise<SearchResult[]> {
    try {
      // Use Supabase vector similarity search on summary embeddings
      const { data, error } = await supabase.rpc("search_summary_embeddings", {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 50,
      });

      if (error) throw error;

      return (
        data?.map((row: any) => ({
          id: row.id,
          bookTitle: row.book_title,
          chapterTitle: row.chapter_title,
          relevanceScore: 1 - row.distance, // Convert distance to similarity
          snippet: row.chapter_summary?.substring(0, 200) + "...",
          summarySnippet: row.chapter_summary,
          searchType: "summary" as const,
        })) || []
      );
    } catch (error) {
      console.error("Summary search error:", error);
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

      if (candidateIds.length === 0) return [];

      // Search chapter embeddings only for candidates
      const { data, error } = await supabase.rpc("search_chapter_embeddings", {
        query_embedding: queryEmbedding,
        candidate_ids: candidateIds,
        match_threshold: 0.6,
        match_count: 25,
      });

      if (error) throw error;

      return (
        data?.map((row: any) => ({
          id: row.id,
          bookTitle: row.book_title,
          chapterTitle: row.chapter_title,
          relevanceScore: 1 - row.distance,
          snippet: this.extractSnippet(row.chapter_text, query),
          searchType: "chapter" as const,
        })) || []
      );
    } catch (error) {
      console.error("Chapter search error:", error);
      return [];
    }
  }

  private async searchFullText(query: string): Promise<SearchResult[]> {
    try {
      // Full-text search using PostgreSQL's text search
      const { data, error } = await supabase.rpc("search_fulltext", {
        search_query: query,
        match_count: 20,
      });

      if (error) throw error;

      return (
        data?.map((row: any) => ({
          id: row.id,
          bookTitle: row.book_title,
          chapterTitle: row.chapter_title,
          relevanceScore: row.rank,
          snippet: this.extractSnippet(row.chapter_text, query),
          searchType: "fulltext" as const,
        })) || []
      );
    } catch (error) {
      console.error("Full-text search error:", error);
      return [];
    }
  }

  private async addAIAnalysis(
    results: SearchResult[],
    query: string,
    userPlan: string,
  ): Promise<SearchResult[]> {
    // Use GPT-5 nano for cost-efficient analysis
    const analysisLevel =
      userPlan === "free"
        ? "basic"
        : userPlan === "scholar"
          ? "advanced"
          : "premium";

    try {
      const response = await fetch(
        "/.netlify/functions/analyze-search-results",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            results: results.slice(0, 10), // Limit AI analysis for cost control
            query,
            analysisLevel,
          }),
        },
      );

      if (!response.ok) return results;

      const { analyzedResults } = await response.json();

      return results.map((result, index) => ({
        ...result,
        aiAnalysis: analyzedResults[index]?.analysis || undefined,
        relevanceScore:
          analyzedResults[index]?.enhancedScore || result.relevanceScore,
      }));
    } catch (error) {
      console.error("AI analysis error:", error);
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
        .from('chapters')
        .select(`
          id,
          chapter_title,
          chapter_text,
          chapter_summary,
          books!inner(title)
        `)
        .or(`chapter_title.ilike.%${query}%,chapter_text.ilike.%${query}%,chapter_summary.ilike.%${query}%`)
        .limit(20);

      if (error) {
        console.error("Basic search error:", error);
        return [];
      }

      return data?.map((row: any) => ({
        id: row.id,
        bookTitle: row.books.title,
        chapterTitle: row.chapter_title,
        relevanceScore: 0.5, // Basic relevance score
        snippet: this.extractSnippet(row.chapter_text || row.chapter_summary, query),
        searchType: 'fulltext' as const,
      })) || [];

    } catch (error) {
      console.error("Basic text search error:", error);
      return [];
    }
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

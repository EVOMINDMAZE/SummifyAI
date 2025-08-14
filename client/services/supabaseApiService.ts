import { supabase } from "@/lib/supabase";
import type { BookGroup, EnrichedChapter, SearchResults } from "@/lib/supabase";

// Real AI-powered search using existing search-books Edge Function
export async function searchDatabase(query: string): Promise<SearchResults> {
  const startTime = Date.now();

  if (!query || query.trim() === "") {
    throw new Error("Query parameter is required");
  }

  console.log(`🔍 REAL SEARCH using search-books Edge Function for: "${query}"`);

  try {
    // Get current user for search tracking
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    // Call the existing search-books Edge Function
    console.log("🚀 Calling search-books Edge Function...");
    const { data: searchResponse, error: searchError } = await supabase.functions.invoke('search-books', {
      body: {
        query: query.trim(),
        userId: userId,
        skipAnalysis: false, // Let AI analyze the query
        deepSearch: false   // Start with fast summary search
      }
    });

    if (searchError) {
      console.error("❌ Search Edge Function error:", searchError);
      throw new Error(`Search failed: ${searchError.message}`);
    }

    console.log("✅ Search Edge Function response:", searchResponse);

    // Handle query analysis step (if query needs refinement)
    if (searchResponse.step === 'analysis' && searchResponse.result?.isVague) {
      console.log("🤔 Query analysis suggests refinements");
      // For now, we'll skip refinements and search anyway
      // You could implement refinement UI here if needed
      
      // Re-call with skipAnalysis to get results
      const { data: directSearchResponse, error: directSearchError } = await supabase.functions.invoke('search-books', {
        body: {
          query: query.trim(),
          userId: userId,
          skipAnalysis: true, // Skip analysis, search directly
          deepSearch: false
        }
      });

      if (directSearchError) {
        throw new Error(`Search failed: ${directSearchError.message}`);
      }

      return transformSearchResults(directSearchResponse, query, startTime);
    }

    // Handle successful search results
    if (searchResponse.step === 'complete') {
      return transformSearchResults(searchResponse, query, startTime);
    }

    // Handle no results
    if (searchResponse.results && searchResponse.results.length === 0) {
      console.log("📭 No results found");
      return {
        query,
        searchType: "no_results",
        totalBooks: 0,
        totalChapters: 0,
        books: [],
        processingTime: Date.now() - startTime,
      };
    }

    // Fallback transformation
    return transformSearchResults(searchResponse, query, startTime);

  } catch (error) {
    console.error("❌ Search failed:", error);
    
    // Try deep search as fallback
    if (!error.message.includes("deep search")) {
      console.log("🔄 Retrying with deep search...");
      try {
        const { data: deepSearchResponse, error: deepSearchError } = await supabase.functions.invoke('search-books', {
          body: {
            query: query.trim(),
            userId: user?.id,
            skipAnalysis: true,
            deepSearch: true // Use full text search
          }
        });

        if (!deepSearchError && deepSearchResponse.step === 'complete') {
          return transformSearchResults(deepSearchResponse, query, startTime);
        }
      } catch (deepSearchError) {
        console.error("❌ Deep search also failed:", deepSearchError);
      }
    }
    
    return {
      query,
      searchType: "search_failed",
      totalBooks: 0,
      totalChapters: 0,
      books: [],
      processingTime: Date.now() - startTime,
    };
  }
}

// Transform Edge Function response to our frontend format
function transformSearchResults(searchResponse: any, query: string, startTime: number): SearchResults {
  if (!searchResponse.results || !Array.isArray(searchResponse.results)) {
    return {
      query,
      searchType: "no_results",
      totalBooks: 0,
      totalChapters: 0,
      books: [],
      processingTime: Date.now() - startTime,
    };
  }

  console.log(`📚 Transforming ${searchResponse.results.length} book results`);

  const books: BookGroup[] = searchResponse.results.map((bookResult: any) => {
    // Transform chapters from Edge Function format to frontend format
    const transformedChapters: EnrichedChapter[] = bookResult.chapters.map((chapter: any) => {
      const aiAnalysis = chapter.aiAnalysis || {};
      
      return {
        id: chapter.id || chapter.chapter_id,
        title: chapter.chapter_title,
        snippet: aiAnalysis.chapterSummary || chapter.chapter_summary?.substring(0, 300) || "",
        relevanceScore: aiAnalysis.relevanceScore || Math.round((1 - (chapter.similarity || 0.5)) * 100),
        whyRelevant: aiAnalysis.relevanceDescription || `This chapter provides insights relevant to ${query}.`,
        keyTopics: aiAnalysis.keyTopics || [],
        coreLeadershipPrinciples: aiAnalysis.corePrinciples || [],
        practicalApplications: [
          `Apply the concepts from this chapter to your work with ${query}`,
          "Implement the strategies discussed for better results"
        ],
        aiExplanation: aiAnalysis.relevanceDescription || ""
      };
    });

    // Calculate average relevance score for the book
    const averageRelevance = transformedChapters.length > 0
      ? Math.round(transformedChapters.reduce((sum, ch) => sum + ch.relevanceScore, 0) / transformedChapters.length)
      : 0;

    return {
      id: bookResult.book_id?.toString() || Math.random().toString(),
      title: bookResult.book_title || "Unknown Title",
      author: bookResult.book_author || "Unknown Author",
      cover: bookResult.book_cover_url || 
            `https://via.placeholder.com/300x450/FFFD63/0A0B1E?text=${encodeURIComponent((bookResult.book_title || "Book").slice(0, 20))}`,
      isbn: bookResult.isbn_13 || "",
      averageRelevance,
      topChapters: transformedChapters,
    };
  });

  const totalChapters = books.reduce((sum, book) => sum + book.topChapters.length, 0);

  console.log(`✅ Transformed to ${books.length} books with ${totalChapters} total chapters`);

  return {
    query: searchResponse.query || query,
    searchType: "ai_vector_search", // The Edge Function uses AI + vector search
    totalBooks: books.length,
    totalChapters,
    books,
    processingTime: Date.now() - startTime,
  };
}

// Health check function
export async function healthCheck(): Promise<{
  status: string;
  hasDatabase: boolean;
  hasAI: boolean;
}> {
  console.log("🏥 Health Check: Testing search-books Edge Function");

  try {
    // Test the search function with a simple query
    const { data, error } = await supabase.functions.invoke('search-books', {
      body: {
        query: 'leadership',
        skipAnalysis: true,
        deepSearch: false
      }
    });

    if (error) {
      console.error("❌ Health check failed:", error);
      return {
        status: "error",
        hasDatabase: false,
        hasAI: false,
      };
    }

    console.log("✅ Health check successful");
    return {
      status: "ok",
      hasDatabase: true,
      hasAI: true, // The Edge Function includes AI analysis
    };
  } catch (error) {
    console.error("❌ Health check failed:", error);
    return {
      status: "error",
      hasDatabase: false,
      hasAI: false,
    };
  }
}

// Topic analysis - use the existing search function's built-in analysis
export async function analyzeTopicWithAI(topic: string): Promise<any> {
  if (!topic.trim()) return null;

  try {
    console.log(`🧠 Analyzing topic: "${topic}"`);
    
    // Use the search function's built-in query analysis
    const { data, error } = await supabase.functions.invoke('search-books', {
      body: {
        query: topic.trim(),
        skipAnalysis: false, // Let it analyze the query
        deepSearch: false
      }
    });

    if (error) throw error;

    // If the search function suggests the query is vague, return refinement suggestions
    if (data.step === 'analysis' && data.result?.isVague) {
      return {
        isBroad: true,
        explanation: "Your search query could be more specific. Here are some focused alternatives:",
        refinements: data.result.suggestions.map((suggestion: string, index: number) => ({
          label: `Option ${index + 1}`,
          value: suggestion,
          description: `More specific search for better results`
        }))
      };
    }

    // Query is specific enough
    return {
      isBroad: false,
      explanation: `Your search for "${topic}" is specific enough to find relevant chapters.`,
      refinements: []
    };
  } catch (error) {
    console.warn("Topic analysis not available:", error);
    return null;
  }
}

// Export for backwards compatibility
export { searchDatabase as searchChapters };

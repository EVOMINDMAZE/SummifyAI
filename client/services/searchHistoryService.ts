import { supabase } from "@/lib/supabase";

export interface SearchHistoryItem {
  id: string;
  user_id: string;
  query: string;
  results_count: number;
  created_at: string;
  search_results: any; // JSONB field containing the search results
}

export interface SearchHistoryService {
  saveSearch: (userId: string, query: string, results: any) => Promise<void>;
  getUserSearchHistory: (userId: string, limit?: number) => Promise<SearchHistoryItem[]>;
  deleteSearchHistory: (userId: string, searchId: string) => Promise<void>;
  clearAllSearchHistory: (userId: string) => Promise<void>;
  getSearchStats: (userId: string) => Promise<{
    totalSearches: number;
    thisMonthSearches: number;
    topQueries: Array<{ query: string; count: number }>;
  }>;
}

class SearchHistoryServiceImpl implements SearchHistoryService {
  
  async saveSearch(userId: string, query: string, results: any): Promise<void> {
    try {
      console.log(`💾 Saving search history for user ${userId}: "${query}"`);
      
      const { error } = await supabase
        .from('user_searches')
        .insert({
          user_id: userId,
          query: query.trim(),
          results_count: results.totalChapters || 0,
          search_results: results,
        });

      if (error) {
        throw error;
      }

      // Update user's search count
      await this.incrementUserSearchCount(userId);
      
      console.log(`✅ Search history saved successfully`);
    } catch (error) {
      console.error("❌ Failed to save search history:", error);
      throw error;
    }
  }

  async getUserSearchHistory(userId: string, limit: number = 20): Promise<SearchHistoryItem[]> {
    try {
      console.log(`📋 Fetching search history for user ${userId}`);
      
      const { data, error } = await supabase
        .from('user_searches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      console.log(`✅ Retrieved ${data?.length || 0} search history items`);
      return data || [];
    } catch (error) {
      console.error("❌ Failed to fetch search history:", error);
      throw error;
    }
  }

  async deleteSearchHistory(userId: string, searchId: string): Promise<void> {
    try {
      console.log(`🗑️ Deleting search history item ${searchId} for user ${userId}`);
      
      const { error } = await supabase
        .from('user_searches')
        .delete()
        .eq('id', searchId)
        .eq('user_id', userId); // Ensure user can only delete their own searches

      if (error) {
        throw error;
      }

      console.log(`✅ Search history item deleted successfully`);
    } catch (error) {
      console.error("❌ Failed to delete search history:", error);
      throw error;
    }
  }

  async clearAllSearchHistory(userId: string): Promise<void> {
    try {
      console.log(`🗑️ Clearing all search history for user ${userId}`);
      
      const { error } = await supabase
        .from('user_searches')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      console.log(`✅ All search history cleared successfully`);
    } catch (error) {
      console.error("❌ Failed to clear search history:", error);
      throw error;
    }
  }

  async getSearchStats(userId: string): Promise<{
    totalSearches: number;
    thisMonthSearches: number;
    topQueries: Array<{ query: string; count: number }>;
  }> {
    try {
      console.log(`📊 Fetching search statistics for user ${userId}`);
      
      // Get total searches count
      const { count: totalSearches, error: totalError } = await supabase
        .from('user_searches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      if (totalError) {
        throw totalError;
      }

      // Get this month's searches
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: thisMonthSearches, error: monthError } = await supabase
        .from('user_searches')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      if (monthError) {
        throw monthError;
      }

      // Get top queries (simplified - just get recent unique queries)
      const { data: recentQueries, error: queriesError } = await supabase
        .from('user_searches')
        .select('query')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (queriesError) {
        throw queriesError;
      }

      // Count frequency of each query
      const queryCount = new Map<string, number>();
      recentQueries?.forEach(({ query }) => {
        const normalizedQuery = query.toLowerCase().trim();
        queryCount.set(normalizedQuery, (queryCount.get(normalizedQuery) || 0) + 1);
      });

      // Get top 5 most frequent queries
      const topQueries = Array.from(queryCount.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([query, count]) => ({ query, count }));

      console.log(`✅ Search statistics retrieved successfully`);
      
      return {
        totalSearches: totalSearches || 0,
        thisMonthSearches: thisMonthSearches || 0,
        topQueries,
      };
    } catch (error) {
      console.error("❌ Failed to fetch search statistics:", error);
      throw error;
    }
  }

  private async incrementUserSearchCount(userId: string): Promise<void> {
    try {
      // Get current search count
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('search_count')
        .eq('user_id', userId)
        .single();

      if (fetchError) {
        console.warn("Could not fetch user profile for search count update:", fetchError);
        return;
      }

      // Increment search count
      const newSearchCount = (profileData?.search_count || 0) + 1;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ search_count: newSearchCount })
        .eq('user_id', userId);

      if (updateError) {
        console.warn("Could not update user search count:", updateError);
      } else {
        console.log(`📈 User search count updated to ${newSearchCount}`);
      }
    } catch (error) {
      console.warn("Search count update failed:", error);
      // Don't throw error here - search history is more important than count
    }
  }
}

// Export singleton instance
export const searchHistoryService = new SearchHistoryServiceImpl();

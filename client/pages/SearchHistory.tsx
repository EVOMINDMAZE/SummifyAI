import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Clock,
  TrendingUp,
  BookOpen,
  Trash2,
  RotateCcw,
  Calendar,
  BarChart3,
  ArrowRight,
  Eye,
  ChevronRight,
} from "lucide-react";
import {
  searchHistoryService,
  type SearchHistoryItem,
} from "@/services/searchHistoryService";

export default function SearchHistory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [searchStats, setSearchStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadSearchHistory();
      loadSearchStats();
    }
  }, [user]);

  const loadSearchHistory = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const history = await searchHistoryService.getUserSearchHistory(
        user.id,
        50,
      );
      setSearchHistory(history);
    } catch (error) {
      console.error("Failed to load search history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSearchStats = async () => {
    if (!user?.id) return;

    try {
      const stats = await searchHistoryService.getSearchStats(user.id);
      setSearchStats(stats);
    } catch (error) {
      console.error("Failed to load search stats:", error);
    }
  };

  const handleDeleteSearch = async (searchId: string) => {
    if (!user?.id) return;

    try {
      setIsDeleting(searchId);
      await searchHistoryService.deleteSearchHistory(user.id, searchId);
      setSearchHistory((prev) => prev.filter((item) => item.id !== searchId));
    } catch (error) {
      console.error("Failed to delete search:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleClearAllHistory = async () => {
    if (!user?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to clear all your search history? This action cannot be undone.",
    );

    if (confirmed) {
      try {
        await searchHistoryService.clearAllSearchHistory(user.id);
        setSearchHistory([]);
        setSearchStats({ ...searchStats, totalSearches: 0 });
      } catch (error) {
        console.error("Failed to clear search history:", error);
      }
    }
  };

  const handleSearchAgain = (query: string) => {
    navigate(`/generate?topic=${encodeURIComponent(query)}`);
  };

  const handleViewResults = (searchItem: SearchHistoryItem) => {
    // Navigate to results with the saved search data
    navigate("/results", {
      state: {
        searchResults: searchItem.search_results,
        query: searchItem.query,
      },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInHours < 168) {
      // 7 days
      return `${Math.floor(diffInHours / 24)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please sign in to view your search history.
          </p>
          <Button
            onClick={() => navigate("/signin")}
            className="bg-[#FFFD63] hover:bg-[#FFFD63]/90 text-[#0A0B1E] px-8 py-3 rounded-2xl font-bold"
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-[#FFFD63] dark:bg-gray-800 rounded-3xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#0A0B1E] dark:bg-[#FFFD63] rounded-full flex items-center justify-center">
                <Clock className="h-8 w-8 text-[#FFFD63] dark:text-[#0A0B1E]" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0A0B1E] dark:text-white mb-2">
              Your Search History
            </h1>
            <p className="text-[#0A0B1E]/80 dark:text-gray-300 text-lg">
              Revisit your previous searches and discover new insights
            </p>
          </div>
        </div>

        {/* Search Statistics */}
        {searchStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="border-[#FFFD63]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Searches
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {searchStats.totalSearches}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-[#FFFD63]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#FFFD63]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      This Month
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {searchStats.thisMonthSearches}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-[#FFFD63]" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#FFFD63]/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Top Query
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {searchStats.topQueries[0]?.query || "No searches yet"}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-[#FFFD63]" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Searches ({searchHistory.length})
          </h2>
          <div className="flex gap-3">
            <Button
              onClick={() => navigate("/generate")}
              className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63]"
            >
              <Search className="mr-2 h-4 w-4" />
              New Search
            </Button>
            {searchHistory.length > 0 && (
              <Button
                onClick={handleClearAllHistory}
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Search History List */}
        <div className="space-y-4">
          {isLoading ? (
            <Card className="border-[#FFFD63]/20">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFFD63] mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading your search history...
                </p>
              </CardContent>
            </Card>
          ) : searchHistory.length === 0 ? (
            <Card className="border-[#FFFD63]/20">
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No searches yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Start exploring our book database to build your search
                  history.
                </p>
                <Button
                  onClick={() => navigate("/generate")}
                  className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63]"
                >
                  Start Searching
                </Button>
              </CardContent>
            </Card>
          ) : (
            searchHistory.map((searchItem) => (
              <Card
                key={searchItem.id}
                className="border-[#FFFD63]/20 hover:border-[#FFFD63]/50 transition-colors"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Search className="h-5 w-5 text-[#FFFD63]" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {searchItem.query}
                        </h3>
                        <Badge
                          variant="outline"
                          className="bg-[#FFFD63]/10 text-[#0A0B1E] border-[#FFFD63]/30"
                        >
                          {searchItem.results_count} results
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(searchItem.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {searchItem.search_results?.totalBooks || 0} books
                          found
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewResults(searchItem)}
                        className="border-[#FFFD63]/30 hover:bg-[#FFFD63]/5"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Results
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSearchAgain(searchItem.query)}
                        className="border-[#FFFD63]/30 hover:bg-[#FFFD63]/5"
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Search Again
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSearch(searchItem.id)}
                        disabled={isDeleting === searchItem.id}
                        className="text-red-600 hover:bg-red-50"
                      >
                        {isDeleting === searchItem.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Popular Queries */}
        {searchStats?.topQueries && searchStats.topQueries.length > 1 && (
          <Card className="mt-8 border-[#FFFD63]/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-[#FFFD63]" />
                Your Most Searched Topics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {searchStats.topQueries.map((queryItem, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-between h-auto p-4 border-[#FFFD63]/30 hover:bg-[#FFFD63]/5"
                    onClick={() => handleSearchAgain(queryItem.query)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{queryItem.query}</div>
                      <div className="text-xs text-gray-500">
                        {queryItem.count} searches
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

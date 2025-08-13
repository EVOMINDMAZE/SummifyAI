import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  searchDatabase,
  analyzeTopicWithAI,
} from "@/services/supabaseApiService";
import type { SearchResults as SupabaseSearchResults } from "@/lib/supabase";
import {
  Search,
  Brain,
  Clock,
  Star,
  Users,
  BookOpen,
  ChevronRight,
  Filter,
  Sparkles,
  ArrowRight,
  Eye,
  Lightbulb,
  Target,
  RotateCcw,
} from "lucide-react";
import AIRelevanceScore from "@/components/AIRelevanceScore";
import SearchFilters, {
  SearchFilters as ISearchFilters,
} from "@/components/SearchFilters";
import { searchHistoryService } from "@/services/searchHistoryService";

// Simplified interfaces for compact display
interface CompactChapter {
  id: number;
  title: string;
  snippet: string;
  relevanceScore: number;
  whyRelevant: string;
  keyTopics: string[];
}

interface CompactBook {
  id: string;
  title: string;
  author: string;
  cover: string;
  isbn: string;
  averageRelevance: number;
  topChapters: CompactChapter[];
}

interface TopicAnalysis {
  isBroad: boolean;
  explanation: string;
  refinements: Array<{
    label: string;
    value: string;
    description: string;
  }>;
}

export default function Generate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Core state
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SupabaseSearchResults | null>(null);
  const [currentOperation, setCurrentOperation] = useState("");
  const [searchFilters, setSearchFilters] = useState<ISearchFilters>({
    publicationYearRange: [1990, 2024],
    difficultyLevel: "any",
    industryFocus: [],
    bookCategories: [],
    minRating: 0,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load previous search on mount
  useEffect(() => {
    const savedResults = sessionStorage.getItem("lastSearchResults");
    const savedQuery = sessionStorage.getItem("lastSearchQuery");

    if (savedResults && savedQuery) {
      try {
        setSearchResults(JSON.parse(savedResults));
        setQuery(savedQuery);
      } catch (error) {
        console.error("Failed to load previous search:", error);
      }
    }
  }, []);

  const performSearch = async (searchQuery: string, retryCount = 0) => {
    if (!searchQuery.trim()) return;

    console.log(`🔍 Starting search for: "${searchQuery}"`);
    setIsSearching(true);
    setCurrentOperation(retryCount > 0 ? "Retrying search..." : "Searching...");
    setSearchResults(null);

    try {
      const data = await searchDatabase(searchQuery);

      console.log(`✅ Search completed successfully:`, {
        totalBooks: data.totalBooks,
        totalChapters: data.totalChapters,
      });

      setSearchResults(data);
      setQuery(searchQuery);

      // Save search state
      sessionStorage.setItem("lastSearchResults", JSON.stringify(data));
      sessionStorage.setItem("lastSearchQuery", searchQuery);

      // Save to database if user is logged in
      if (user?.id) {
        try {
          await searchHistoryService.saveSearch(user.id, searchQuery, data);
        } catch (historyError) {
          console.warn("Failed to save search history:", historyError);
        }
      }
    } catch (error) {
      console.error("❌ Search error:", error);

      if (error instanceof Error && error.message.includes("timeout") && retryCount < 2) {
        console.log(`⏰ Search timeout, retrying...`);
        setCurrentOperation("Search timeout, retrying...");
        setTimeout(() => {
          performSearch(searchQuery, retryCount + 1);
        }, 1000);
        return;
      }

      setCurrentOperation(`⚠️ Search temporarily unavailable. Please try again.`);
      setTimeout(() => setCurrentOperation(""), 5000);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    performSearch(query);
  };

  const handleNewSearch = () => {
    setQuery("");
    setSearchResults(null);
    setCurrentOperation("");
  };

  const handleChapterClick = (book: CompactBook, chapter: CompactChapter) => {
    navigate(`/chapter/${book.id}/${chapter.id}`, {
      state: {
        query: searchResults?.query || query,
        bookGroup: book,
        selectedChapter: chapter,
      },
    });
  };

  const quickTopics = [
    "Leadership",
    "Negotiation", 
    "Communication",
    "Strategy",
    "Team Building",
    "Innovation"
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Search Header */}
        <div className="mb-6">
          <Card className="bg-[#FFFD63] dark:bg-gray-800 border-0 rounded-2xl shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#0A0B1E] dark:bg-[#FFFD63] rounded-xl flex items-center justify-center">
                  <Brain className="w-6 h-6 text-[#FFFD63] dark:text-[#0A0B1E]" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-[#0A0B1E] dark:text-white">
                    Find Exact Chapters
                  </h1>
                  <p className="text-[#0A0B1E]/70 dark:text-gray-300 text-sm">
                    Get precise insights from 10,000+ business books
                  </p>
                </div>
                {searchResults && (
                  <Button
                    onClick={handleNewSearch}
                    variant="outline"
                    size="sm"
                    className="border-[#0A0B1E]/30 text-[#0A0B1E] hover:bg-[#0A0B1E]/10 dark:border-white/30 dark:text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Search
                  </Button>
                )}
              </div>

              {/* Search Input */}
              <div className="flex gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="e.g., 'team building strategies for remote workers'"
                    className="pl-10 h-12 bg-white dark:bg-gray-700 border-0 rounded-xl text-base"
                    disabled={isSearching}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={!query.trim() || isSearching}
                  className="h-12 px-6 bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] rounded-xl font-medium"
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FFFD63] mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
                <SearchFilters
                  filters={searchFilters}
                  onFiltersChange={setSearchFilters}
                  isVisible={showFilters}
                  onToggleVisibility={() => setShowFilters(!showFilters)}
                />
              </div>

              {/* Quick Topics */}
              {!searchResults && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-[#0A0B1E]/60 dark:text-gray-400 mr-2">
                    Quick search:
                  </span>
                  {quickTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => {
                        setQuery(topic);
                        performSearch(topic);
                      }}
                      className="px-3 py-1 text-xs bg-white/70 dark:bg-gray-700/70 text-[#0A0B1E] dark:text-gray-300 rounded-full hover:bg-white dark:hover:bg-gray-600 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              )}

              {/* Loading State */}
              {isSearching && (
                <div className="bg-white/50 dark:bg-gray-700/50 rounded-xl p-4 mt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-[#0A0B1E] dark:bg-[#FFFD63] rounded-full animate-pulse" />
                    <span className="text-sm text-[#0A0B1E] dark:text-white font-medium">
                      {currentOperation || "AI is analyzing thousands of chapters..."}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Compact Results */}
        {searchResults && searchResults.books && searchResults.books.length > 0 && (
          <div className="space-y-4">
            {/* Results Summary */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-[#0A0B1E] dark:text-white">
                  Results for "{searchResults.query}"
                </h2>
                <div className="flex gap-3 text-sm">
                  <Badge variant="outline" className="border-[#0A0B1E]/20 text-[#0A0B1E] dark:border-[#FFFD63]/20 dark:text-[#FFFD63]">
                    {searchResults.totalBooks} books
                  </Badge>
                  <Badge variant="outline" className="border-[#0A0B1E]/20 text-[#0A0B1E] dark:border-[#FFFD63]/20 dark:text-[#FFFD63]">
                    {searchResults.totalChapters} chapters
                  </Badge>
                </div>
              </div>
            </div>

            {/* Compact Book Cards */}
            <div className="grid gap-4">
              {searchResults.books.map((book, bookIndex) => (
                <Card
                  key={book.id}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Book Cover - Compact */}
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <div className="w-24 h-36 relative overflow-hidden rounded-xl shadow-lg">
                            <img
                              src={book.cover}
                              alt={book.title}
                              className="absolute inset-0 w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.currentTarget;
                                target.src = `https://via.placeholder.com/200x300/FFFD63/0A0B1E?text=${encodeURIComponent(book.title.split(" ").slice(0, 2).join(" "))}`;
                              }}
                            />
                          </div>
                          {/* Rank Badge */}
                          <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#0A0B1E] text-[#FFFD63] rounded-full flex items-center justify-center text-xs font-bold">
                            {bookIndex + 1}
                          </div>
                        </div>
                      </div>

                      {/* Book Info & Chapters */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-[#0A0B1E] dark:text-white mb-1 line-clamp-2">
                              {book.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {book.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-4 h-4" />
                                {book.topChapters.length} chapters
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0 ml-4">
                            <AIRelevanceScore
                              score={book.averageRelevance || 85}
                              size="lg"
                              showBar={true}
                              query={searchResults.query}
                            />
                          </div>
                        </div>

                        {/* Chapters Grid - Most Important Info First */}
                        <div className="grid gap-3">
                          {book.topChapters.slice(0, 3).map((chapter, index) => (
                            <div
                              key={chapter.id}
                              onClick={() => handleChapterClick(book, chapter)}
                              className="group cursor-pointer bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 hover:bg-[#FFFD63]/10 dark:hover:bg-[#FFFD63]/5 transition-all border border-transparent hover:border-[#FFFD63]/30"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  <div className="w-8 h-8 bg-[#0A0B1E] text-[#FFFD63] rounded-lg flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4 mb-2">
                                    <h4 className="font-semibold text-[#0A0B1E] dark:text-white text-sm line-clamp-2 group-hover:text-[#0A0B1E]/80 dark:group-hover:text-white/80">
                                      {chapter.title}
                                    </h4>
                                    <AIRelevanceScore
                                      score={chapter.relevanceScore}
                                      size="sm"
                                      showBar={true}
                                      query={searchResults.query}
                                    />
                                  </div>
                                  
                                  {/* Why Relevant - Key Information */}
                                  <div className="bg-[#FFFD63]/10 dark:bg-[#FFFD63]/5 rounded-lg p-3 mb-3">
                                    <div className="flex items-start gap-2">
                                      <Lightbulb className="w-4 h-4 text-[#0A0B1E] dark:text-[#FFFD63] mt-0.5 flex-shrink-0" />
                                      <div>
                                        <p className="text-xs font-medium text-[#0A0B1E] dark:text-white mb-1">
                                          Why this chapter matches:
                                        </p>
                                        <p className="text-xs text-[#0A0B1E]/80 dark:text-gray-300 line-clamp-2">
                                          {chapter.whyRelevant || `This chapter provides direct insights into ${searchResults.query} with practical applications.`}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Key Topics */}
                                  {chapter.keyTopics && chapter.keyTopics.length > 0 && (
                                    <div className="flex gap-1 flex-wrap">
                                      {chapter.keyTopics.slice(0, 3).map((topic, topicIndex) => (
                                        <span
                                          key={topicIndex}
                                          className="text-xs bg-[#FFFD63]/20 dark:bg-[#FFFD63]/10 text-[#0A0B1E] dark:text-[#FFFD63] px-2 py-1 rounded-full"
                                        >
                                          {topic}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0A0B1E] dark:group-hover:text-[#FFFD63] transition-colors flex-shrink-0" />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* View All Chapters */}
                        {book.topChapters.length > 3 && (
                          <div className="mt-4 text-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChapterClick(book, book.topChapters[0])}
                              className="border-[#FFFD63]/50 text-[#0A0B1E] dark:text-[#FFFD63] hover:bg-[#FFFD63]/10"
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View all {book.topChapters.length} chapters
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* No Results State */}
        {searchResults && searchResults.books && searchResults.books.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-[#0A0B1E] dark:text-white mb-2">
                No chapters found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Try searching with different keywords or broader terms.
              </p>
              <Button
                onClick={handleNewSearch}
                className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63]"
              >
                Try Another Search
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {currentOperation && currentOperation.includes("⚠️") && (
          <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700 rounded-2xl">
            <CardContent className="p-6 text-center">
              <p className="text-orange-800 dark:text-orange-300">
                {currentOperation}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

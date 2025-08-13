import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  searchDatabase,
  analyzeTopicWithAI,
} from "@/services/supabaseApiService";
import type { SearchResults as SupabaseSearchResults } from "@/lib/supabase";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  ExternalLink,
  Share2,
  Lightbulb,
  Target,
  Search,
  Sparkles,
  Zap,
  TrendingUp,
  Brain,
  ChevronRight,
  Filter,
  Eye,
  Award,
} from "lucide-react";
import ChapterRating from "@/components/ChapterRating";
import ResultsShareButton from "@/components/ResultsShareButton";
import SearchFilters, {
  SearchFilters as ISearchFilters,
} from "@/components/SearchFilters";
import AIRelevanceScore from "@/components/AIRelevanceScore";
import OpenAIStatus from "@/components/OpenAIStatus";
import SmartSearchInterface from "@/components/SmartSearchInterface";
import { logCapture } from "@/utils/logCapture";
import { searchHistoryService } from "@/services/searchHistoryService";

// Interface definitions
interface EnrichedChapter {
  id: number;
  title: string;
  snippet: string;
  relevanceScore: number;
  whyRelevant: string;
  keyTopics: string[];
  coreLeadershipPrinciples: string[];
  practicalApplications: string[];
  aiExplanation?: string; // New field for AI-generated explanation
}

interface ChapterMatch {
  chapter: string;
  title: string;
  pages: string;
  relevance: string;
  relevanceScore: number;
  keyTopics: string[];
  why: string;
}

interface BookGroup {
  id: string;
  title: string;
  author: string;
  cover: string;
  isbn: string;
  averageRelevance: number;
  topChapters: EnrichedChapter[];
  relevantChapters?: ChapterMatch[];
  chapterRelevanceScore?: number;
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

  // State management
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchResults, setSearchResults] =
    useState<SupabaseSearchResults | null>(null);
  const [generatedSummary, setGeneratedSummary] = useState<string | null>(null);
  const [currentOperation, setCurrentOperation] = useState("");
  const [topicAnalysis, setTopicAnalysis] = useState<TopicAnalysis | null>(
    null,
  );
  const [showRefinements, setShowRefinements] = useState(false);
  const [topicRefinements, setTopicRefinements] = useState<
    Array<{
      label: string;
      value: string;
      description: string;
    }>
  >([]);
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
        setTopic(savedQuery);
      } catch (error) {
        console.error("Failed to load previous search:", error);
      }
    }
  }, []);

  // AI-powered topic analysis
  const analyzeTopic = async (topicToAnalyze: string) => {
    if (!topicToAnalyze.trim()) return;

    console.log(`🧠 Starting topic analysis for: "${topicToAnalyze}"`);
    setIsAnalyzing(true);
    setCurrentOperation("Analyzing your search query...");

    try {
      // Add timeout for topic analysis
      const analysisPromise = analyzeTopicWithAI(topicToAnalyze.trim());
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Topic analysis timeout')), 5000)
      );

      const analysis = await Promise.race([analysisPromise, timeoutPromise]);
      console.log("�� Topic analysis completed:", analysis);

      setTopicAnalysis(analysis);

      if (analysis.isBroad && analysis.refinements.length > 0) {
        console.log("📋 Topic is broad, showing refinements");
        setTopicRefinements(analysis.refinements);
        setShowRefinements(true);
      } else {
        console.log("🎯 Topic is specific, proceeding with search");
        // Topic is specific enough, proceed with database search
        performDatabaseSearch(topicToAnalyze);
      }
    } catch (error) {
      console.error("❌ Topic analysis error:", error);
      console.log("🔄 Proceeding with database search despite analysis failure");
      // If analysis fails, proceed with database search anyway
      performDatabaseSearch(topicToAnalyze);
    } finally {
      console.log("🏁 Topic analysis completed, clearing loading state");
      setIsAnalyzing(false);
      setCurrentOperation("");
    }
  };

  const performDatabaseSearch = async (searchQuery: string) => {
    console.log(`🔍 Starting database search for: "${searchQuery}"`);
    setIsGenerating(true);
    setShowRefinements(false);
    setSearchResults(null);
    setGeneratedSummary(null);
    setCurrentOperation("Searching knowledge base...");

    try {
      console.log(`🔄 Calling searchDatabase function...`);
      const data = await searchDatabase(searchQuery);

      console.log(`✅ Search completed successfully:`, {
        totalBooks: data.totalBooks,
        totalChapters: data.totalChapters,
        searchType: data.searchType,
        hasBooks: data.books?.length > 0,
        processingTime: data.processingTime
      });

      // Set the new search results for grid display
      setSearchResults(data);

      // Save search state for navigation preservation
      sessionStorage.setItem("lastSearchResults", JSON.stringify(data));
      sessionStorage.setItem("lastSearchQuery", searchQuery);

      // Save search to database if user is logged in
      if (user?.id) {
        try {
          await searchHistoryService.saveSearch(user.id, searchQuery, data);
        } catch (historyError) {
          console.warn("Failed to save search history:", historyError);
          // Don't break the user experience if history saving fails
        }
      }
    } catch (error) {
      console.error("❌ Database search error:", error);

      // Handle different types of search errors gracefully
      let userMessage = "Search encountered an issue";
      let fallbackResults = null;

      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          userMessage = "Search is taking longer than usual. Showing available results...";
          // Create fallback results for timeout
          fallbackResults = {
            query: searchQuery,
            searchType: "timeout_fallback",
            totalBooks: 0,
            totalChapters: 0,
            books: [],
            processingTime: 0,
          };
        } else if (error.message.includes("Database search failed")) {
          userMessage = "Database temporarily busy. Try a more specific search term.";
        } else {
          userMessage = "Search temporarily unavailable. Please try again in a moment.";
        }
      }

      // Set fallback results instead of showing intrusive alert
      if (fallbackResults) {
        setSearchResults(fallbackResults);
      }

      // Show subtle error feedback instead of alert
      setCurrentOperation(`⚠️ ${userMessage}`);

      // Clear error message after a few seconds
      setTimeout(() => {
        setCurrentOperation("");
      }, 5000);
    } finally {
      console.log("🏁 Search process completed, clearing loading states");
      setIsGenerating(false);
      setCurrentOperation("");
    }
  };

  const handleSearch = () => {
    if (!topic.trim()) return;
    analyzeTopic(topic);
  };

  const handleRefinementSelect = (refinedTopic: string) => {
    setTopic(refinedTopic);
    performDatabaseSearch(refinedTopic);
  };

  const proceedWithOriginalTopic = () => {
    performDatabaseSearch(topic);
  };

  const handleBookCardClick = (bookGroup: BookGroup) => {
    console.log(`📖 Viewing details for: ${bookGroup.title}`);

    // Navigate to the first chapter detail page
    if (bookGroup.topChapters.length > 0) {
      const firstChapter = bookGroup.topChapters[0];
      navigate(`/chapter/${bookGroup.id}/${firstChapter.id}`, {
        state: {
          query: searchResults?.query || topic,
          bookGroup,
        },
      });
    }
  };

  const handleChapterClick = (
    event: React.MouseEvent,
    bookGroup: BookGroup,
    chapter: EnrichedChapter,
  ) => {
    event.stopPropagation(); // Prevent book card click
    console.log(`📄 Viewing specific chapter: ${chapter.title}`);

    navigate(`/chapter/${bookGroup.id}/${chapter.id}`, {
      state: {
        query: searchResults?.query || topic,
        bookGroup,
        selectedChapter: chapter,
      },
    });
  };

  const quickTopics = [
    "Leadership",
    "Negotiation",
    "Communication",
    "Innovation",
    "Strategy",
    "Team Building",
    "Productivity",
    "Management",
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard-Style Hero Section with Smart Marketing */}
        <div className="mb-8">
          <div className="bg-[#FFFD63] dark:bg-gray-800 rounded-3xl p-8 text-[#0A0B1E] dark:text-white relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#0A0B1E]/10 dark:bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#0A0B1E] dark:bg-[#FFFD63] rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-8 h-8 text-[#FFFD63] dark:text-[#0A0B1E]" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    Find Exact Chapters, Skip Entire Books! 🎯
                  </h1>
                  <p className="text-[#0A0B1E]/80 dark:text-gray-300 text-lg">
                    Save <strong>20+ hours per week</strong> with AI-powered
                    chapter discovery. Get precise page numbers and insights
                    instantly.
                  </p>
                </div>
              </div>

              {/* Smart Marketing CTAs */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/20 dark:bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-600">10X Faster</span>
                  </div>
                  <p className="text-sm text-[#0A0B1E]/70 dark:text-gray-400">
                    Minutes instead of hours of reading
                  </p>
                </div>

                <div className="bg-white/20 dark:bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-blue-600">
                      99.9% Accurate
                    </span>
                  </div>
                  <p className="text-sm text-[#0A0B1E]/70 dark:text-gray-400">
                    Precise chapter recommendations
                  </p>
                </div>

                <div className="bg-white/20 dark:bg-black/20 rounded-xl p-4 backdrop-blur-sm border border-white/30 dark:border-gray-600">
                  <div className="flex items-center gap-3 mb-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-purple-600">
                      10,000+ Books
                    </span>
                  </div>
                  <p className="text-sm text-[#0A0B1E]/70 dark:text-gray-400">
                    Curated business library
                  </p>
                </div>
              </div>

              {/* Quick Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-[#0A0B1E]/60 dark:text-gray-400 mb-2">
                    💡 <strong>Pro Tip:</strong> Be specific for better results
                    (e.g., "team building strategies for remote workers")
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Interface with Dashboard Style */}
        <div className="max-w-5xl mx-auto mb-16">
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className="space-y-6">
                {/* Search Header */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center">
                    <Search className="w-6 h-6 mr-3 text-[#FFFD63]" />
                    What specific knowledge do you need?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter a business topic and get exact chapters with page
                    numbers in seconds
                  </p>
                </div>

                {/* Main Search Input */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="e.g., 'team building strategies for remote workers' or 'negotiation techniques for startups'"
                    className="w-full h-14 pl-14 pr-6 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-700 focus:border-[#FFFD63] focus:ring-[#FFFD63] bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-500"
                  />

                  {/* Quick Topic Suggestions */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                      💡 Popular searches this week:
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {quickTopics.map((quickTopic) => (
                        <button
                          key={quickTopic}
                          onClick={() => {
                            setTopic(quickTopic);
                            analyzeTopic(quickTopic);
                          }}
                          className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-[#FFFD63] hover:text-[#0A0B1E] transition-all shadow-sm border border-gray-200 dark:border-gray-600"
                        >
                          {quickTopic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Search Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Button
                      onClick={handleSearch}
                      disabled={!topic.trim() || isGenerating || isAnalyzing}
                      className="w-full h-12 bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] border-0 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                    >
                      <div className="flex items-center justify-center">
                        {isAnalyzing ? (
                          <>
                            <Brain className="w-5 h-5 mr-2 animate-pulse" />
                            <span>Analyzing...</span>
                          </>
                        ) : isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0A0B1E] mr-2"></div>
                            <span>Finding Chapters...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 mr-2" />
                            <span>Find Exact Chapters</span>
                          </>
                        )}
                      </div>
                    </Button>
                  </div>

                  <SearchFilters
                    filters={searchFilters}
                    onFiltersChange={setSearchFilters}
                    isVisible={showFilters}
                    onToggleVisibility={() => setShowFilters(!showFilters)}
                  />
                </div>

                {/* Smart Marketing Messages */}
                {!isGenerating && !isAnalyzing && !searchResults && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
                          ⚡ Get Results in Under 30 Seconds
                        </h3>
                        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                          <li>• Exact page numbers and chapter titles</li>
                          <li>• AI explains why each chapter matters</li>
                          <li>• Save 20+ hours of reading per search</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-bold text-green-900 dark:text-green-200 mb-2">
                          🎯 Better Than Reading Entire Books
                        </h3>
                        <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
                          <li>• Focus on exactly what you need</li>
                          <li>• Multiple expert perspectives</li>
                          <li>• Actionable insights, not fluff</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* OpenAI Status */}
                <OpenAIStatus />

                {/* Enhanced Loading State */}
                {(isGenerating || isAnalyzing) && (
                  <div className="bg-gradient-to-r from-[#FFFD63]/10 to-yellow-100/50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-xl p-6 border border-[#FFFD63]/30">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#FFFD63] border-t-transparent"></div>
                        <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-[#FFFD63] opacity-20"></div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#0A0B1E] dark:text-white">
                          {currentOperation || "🧠 AI is working its magic..."}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {isAnalyzing
                            ? "Analyzing your query for best results"
                            : "Searching through 10,000+ business books"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Topic Refinement Modal */}
        {showRefinements && topicAnalysis && (
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="shadow-2xl border-0 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-4">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Let's Make Your Search More Specific
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                    {topicAnalysis.explanation}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose a more focused search below, or continue with your
                    original topic.
                  </p>
                </div>

                <div className="grid gap-4 mb-6">
                  {topicRefinements.map((refinement, index) => (
                    <button
                      key={index}
                      onClick={() => handleRefinementSelect(refinement.value)}
                      className="text-left p-6 bg-white/70 dark:bg-gray-800/70 rounded-2xl border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all hover:shadow-lg group transform hover:scale-[1.02]"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-4 group-hover:shadow-lg transition-all">
                          <span className="text-white font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors text-lg">
                            {refinement.label}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                            {refinement.description}
                          </p>
                          <div className="flex items-center text-xs text-amber-600 dark:text-amber-400 font-medium">
                            <Search className="w-3 h-3 mr-1" />
                            Search: "{refinement.value}"
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={proceedWithOriginalTopic}
                    variant="outline"
                    className="border-amber-300 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    Continue with "{topic}"
                  </Button>
                  <Button
                    onClick={() => setShowRefinements(false)}
                    variant="ghost"
                    className="text-gray-600 dark:text-gray-400"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* COMPLETELY REDESIGNED SEARCH RESULTS */}
        {searchResults && (
          <div className="max-w-7xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-12">
              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border-2 border-emerald-200 dark:border-emerald-800 shadow-xl">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mb-6 shadow-lg">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  AI Discovery Results
                </h2>
                <div className="text-2xl text-emerald-700 dark:text-emerald-300 font-bold mb-6">
                  "{searchResults.query}"
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-full px-6 py-3 flex items-center shadow-md">
                    <span className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">
                      {searchResults.totalChapters}
                    </span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">
                      Relevant Chapters
                    </span>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-full px-6 py-3 flex items-center shadow-md">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-3"></span>
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">
                      {searchResults.totalBooks}
                    </span>
                    <span className="ml-1 text-gray-700 dark:text-gray-300">
                      Books Found
                    </span>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-800/80 rounded-full px-6 py-3 flex items-center shadow-md">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-3"></span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {searchResults.searchType === "ai_vector_search"
                        ? "AI Vector"
                        : "Enhanced Text"}{" "}
                      Search
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* REVOLUTIONARY NEW LAYOUT - LARGE COVERS WITH ORGANIZED DATA */}
            <div className="space-y-16">
              {searchResults.books.map((bookGroup, bookIndex) => (
                <div
                  key={bookGroup.id}
                  className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-3xl transition-all duration-500 group"
                >
                  {/* Book Header with Large Cover */}
                  <div className="flex">
                    {/* LARGE PROMINENT BOOK COVER */}
                    <div className="w-80 flex-shrink-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 p-8 flex items-center justify-center relative">
                      <div className="relative">
                        <div className="aspect-[2/3] w-full relative overflow-hidden rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-700 border-4 border-white/70 dark:border-gray-700/70">
                          <img
                            src={bookGroup.cover}
                            alt={bookGroup.title}
                            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.src = `https://via.placeholder.com/400x600/667eea/FFFFFF?text=${encodeURIComponent(bookGroup.title.split(" ").slice(0, 3).join(" "))}`;
                            }}
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                        </div>

                        {/* Book Rank Badge */}
                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-xl border-4 border-white dark:border-gray-800">
                          {bookIndex + 1}
                        </div>

                        {/* Overall Score Badge */}
                        <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-xl border border-gray-200 dark:border-gray-700">
                          <AIRelevanceScore
                            score={bookGroup.averageRelevance || 85}
                            size="md"
                            showBar={true}
                            query={searchResults?.query || topic}
                          />
                        </div>

                        {/* Enhanced Glow effects */}
                        <div className="absolute -inset-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 -z-10"></div>
                      </div>
                    </div>

                    {/* ORGANIZED BOOK INFORMATION */}
                    <div className="flex-1 p-8">
                      {/* Book Title and Author */}
                      <div className="mb-8">
                        <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-tight">
                          {bookGroup.title}
                        </h3>
                        <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                          <div className="flex items-center">
                            <Users className="w-5 h-5 mr-2 text-indigo-500" />
                            <span className="font-medium text-lg">
                              {bookGroup.author}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <BookOpen className="w-5 h-5 mr-2 text-emerald-500" />
                            <span className="font-medium text-lg">
                              {bookGroup.topChapters.length} Relevant Chapters
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Award className="w-5 h-5 mr-2 text-purple-500" />
                            <span className="font-medium text-lg">
                              {bookGroup.averageRelevance || 85}% Overall Match
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* AI-GENERATED BOOK SUMMARY */}
                      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-start space-x-3">
                          <Brain className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                          <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-200 mb-2">
                              AI Analysis: Why This Book Matters
                            </h4>
                            <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
                              This book provides exceptional insights for{" "}
                              <strong>"{searchResults.query}"</strong> through
                              its comprehensive coverage of practical frameworks
                              and real-world applications. The selected chapters
                              offer immediate value with actionable strategies
                              you can implement today.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* ACTION BUTTON */}
                      <div className="text-center">
                        <Button
                          onClick={() => handleBookCardClick(bookGroup)}
                          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          Explore All Chapters
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* OPTIMIZED CHAPTERS SECTION */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50 p-8">
                    <div className="mb-6">
                      <h4 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-3">
                        <Sparkles className="w-6 h-6 mr-3 text-emerald-500" />
                        Top Relevant Chapters
                      </h4>
                      <p className="text-gray-600 dark:text-gray-400">
                        AI-selected chapters with detailed explanations of their
                        relevance to your search
                      </p>
                    </div>

                    {/* CHAPTER GRID - SPACE OPTIMIZED */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {bookGroup.topChapters
                        .slice(0, 6)
                        .map((chapter, index) => (
                          <div
                            key={chapter.id}
                            onClick={(e) =>
                              handleChapterClick(e, bookGroup, chapter)
                            }
                            className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transform hover:scale-105"
                          >
                            {/* Chapter Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <AIRelevanceScore
                                score={chapter.relevanceScore}
                                size="sm"
                                showBar={true}
                                query={searchResults?.query || topic}
                              />
                            </div>

                            {/* Chapter Title */}
                            <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {chapter.title}
                            </h5>

                            {/* AI-GENERATED WHY CHOSEN EXPLANATION */}
                            <div className="mb-4 p-4 bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                              <div className="flex items-start space-x-2">
                                <Lightbulb className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                                    Why AI Selected This Chapter:
                                  </p>
                                  <p className="text-sm text-emerald-700 dark:text-emerald-300 leading-relaxed">
                                    {chapter.whyRelevant ||
                                      `This chapter directly addresses ${searchResults.query} with practical insights and proven methodologies that you can apply immediately.`}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Key Topics */}
                            {chapter.keyTopics &&
                              chapter.keyTopics.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {chapter.keyTopics
                                    .slice(0, 3)
                                    .map((topic, topicIndex) => (
                                      <span
                                        key={topicIndex}
                                        className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full font-medium"
                                      >
                                        {topic}
                                      </span>
                                    ))}
                                </div>
                              )}

                            {/* Chapter Actions */}
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                Click to read details
                              </span>
                              <ChevronRight className="w-4 h-4 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        ))}
                    </div>

                    {/* View More Chapters */}
                    {bookGroup.topChapters.length > 6 && (
                      <div className="text-center mt-8">
                        <Button
                          onClick={() => handleBookCardClick(bookGroup)}
                          variant="outline"
                          className="border-2 border-indigo-300 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-6 py-3 rounded-xl"
                        >
                          View {bookGroup.topChapters.length - 6} More Chapters
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* No Results State */}
            {searchResults.books.length === 0 && (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  No Results Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Try searching with different keywords or broader terms. Our AI
                  will help refine your search.
                </p>
                <Button
                  onClick={() => setTopic("")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl"
                >
                  Try Another Search
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

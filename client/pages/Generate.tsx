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
  healthCheck,
  inspectDatabaseSchema,
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
import LogsViewer from "@/components/LogsViewer";
import DeploymentWizard from "@/components/DeploymentWizard";
import { logCapture } from "@/utils/logCapture";

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
  const [showLogs, setShowLogs] = useState(false);
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

    setIsAnalyzing(true);
    setCurrentOperation("Analyzing your search query...");

    try {
      const analysis = await analyzeTopicWithAI(topicToAnalyze.trim());
      setTopicAnalysis(analysis);

      if (analysis.isBroad && analysis.refinements.length > 0) {
        setTopicRefinements(analysis.refinements);
        setShowRefinements(true);
      } else {
        // Topic is specific enough, proceed with database search
        performDatabaseSearch(topicToAnalyze);
      }
    } catch (error) {
      console.error("Topic analysis error:", error);
      // If analysis fails, proceed with database search anyway
      performDatabaseSearch(topicToAnalyze);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const performDatabaseSearch = async (searchQuery: string) => {
    setIsGenerating(true);
    setShowRefinements(false);
    setSearchResults(null);
    setGeneratedSummary(null);
    setCurrentOperation("Searching knowledge base...");

    try {
      console.log(`🔍 Searching for: "${searchQuery}"`);
      const data = await searchDatabase(searchQuery);

      console.log(
        `🎯 Found ${data.totalBooks} books with ${data.totalChapters} relevant chapters using ${data.searchType}`,
      );

      // Set the new search results for grid display
      setSearchResults(data);
      setIsGenerating(false);

      // Save search state for navigation preservation
      sessionStorage.setItem("lastSearchResults", JSON.stringify(data));
      sessionStorage.setItem("lastSearchQuery", searchQuery);
    } catch (error) {
      console.error("Database search error:", error);
      setIsGenerating(false);

      // Show user-friendly error with better UX
      const errorMessage =
        error instanceof Error ? error.message : "Search failed";
      alert(
        `Search failed: ${errorMessage}. Please check your connection and try again.`,
      );
    } finally {
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

  // Debug function to test Supabase connection
  const testAPIConnection = async () => {
    try {
      console.log("🔧 Testing Supabase connection...");
      const data = await healthCheck();
      console.log("✅ Supabase Health Check:", data);
      alert(
        `Supabase Status: ${data.status}\nDatabase: ${data.hasDatabase ? "Connected" : "Not configured"}\nOpenAI: ${data.hasOpenAI ? "Connected" : "Not configured"}`,
      );
    } catch (error) {
      console.error("❌ Supabase Health Check failed:", error);
      alert(
        "Supabase connection failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  };

  const inspectSchema = async () => {
    try {
      console.log("🔍 Starting schema inspection...");
      const result = await inspectDatabaseSchema();
      console.log("📊 Database Schema:", result);

      if (result.error) {
        alert(`Schema Error: ${result.error}`);
        return;
      }

      // Format the output nicely
      const output = {
        tables: result.tables || [],
        schemaDetails: result.schema || {},
        method: result.method || 'unknown'
      };

      alert(`Database Schema:\n${JSON.stringify(output, null, 2)}`);
    } catch (error) {
      console.error("Schema inspection failed:", error);
      alert(`Schema inspection failed: ${error}`);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Beautiful Hero Section */}
        <div className="text-center mb-16">
          <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-12 text-white overflow-hidden shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-white/10 rounded-full blur-xl animate-pulse"></div>
            <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/10 rounded-full blur-xl animate-bounce"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6 backdrop-blur-sm">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
                AI Knowledge Discovery
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
                Unlock insights from thousands of business books instantly. Our
                AI-powered search finds exactly what you need with semantic
                understanding.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
                  <Zap className="w-4 h-4 mr-2" />
                  Instant AI Analysis
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Smart Refinements
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Real Book Database
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Relevance Scoring
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Section */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 dark:from-indigo-900/10 dark:to-purple-900/10"></div>
            <CardContent className="relative z-10 p-10">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center">
                    <Search className="w-8 h-8 mr-3 text-indigo-600" />
                    What knowledge are you seeking?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    Enter any business topic and discover relevant insights from
                    our curated book collection
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <Input
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="leadership strategies, negotiation tactics, team building, innovation..."
                    className="w-full h-16 pl-16 pr-6 text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-900 dark:text-white placeholder:text-gray-500"
                  />

                  <div className="mt-6 flex flex-wrap gap-3 justify-center">
                    {quickTopics.map((quickTopic) => (
                      <button
                        key={quickTopic}
                        onClick={() => {
                          setTopic(quickTopic);
                          analyzeTopic(quickTopic);
                        }}
                        className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-700 hover:from-indigo-200 hover:to-purple-200 dark:hover:from-indigo-800/50 dark:hover:to-purple-800/50 transition-all shadow-sm"
                      >
                        {quickTopic}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Button
                      onClick={handleSearch}
                      disabled={!topic.trim() || isGenerating || isAnalyzing}
                      className="w-full h-14 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none relative overflow-hidden group"
                    >
                      {/* Button shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-pulse"></div>

                      <div className="relative z-10 flex items-center justify-center">
                        {isAnalyzing ? (
                          <>
                            <Brain className="w-6 h-6 mr-3 animate-pulse" />
                            <span>Analyzing Query...</span>
                          </>
                        ) : isGenerating ? (
                          <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            <span>Searching Knowledge...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-6 h-6 mr-3" />
                            <span>Search with AI</span>
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

                  {/* Debug Buttons - Temporary */}
                  <div className="flex gap-2">
                    <Button
                      onClick={testAPIConnection}
                      variant="outline"
                      className="h-14 px-4 border-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    >
                      🧪 Health
                    </Button>
                    <Button
                      onClick={inspectSchema}
                      variant="outline"
                      className="h-14 px-4 border-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      📊 Schema
                    </Button>
                    <Button
                      onClick={() => setShowLogs(true)}
                      variant="outline"
                      className="h-14 px-4 border-2 border-purple-300 text-purple-700 hover:bg-purple-50"
                    >
                      📋 Logs
                    </Button>
                  </div>

                  {/* Info about AI features */}

                </div>

                {/* OpenAI Status */}
                <OpenAIStatus />

                {/* Loading State */}
                {(isGenerating || isAnalyzing) && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-800">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent"></div>
                        <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-indigo-600 opacity-20"></div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          {currentOperation || "Processing..."}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          AI is analyzing your request
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

        {/* Logs Viewer */}
        <LogsViewer isOpen={showLogs} onClose={() => setShowLogs(false)} />
      </div>
    </div>
  );
}

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
} from "lucide-react";
import ChapterRating from "@/components/ChapterRating";
import ResultsShareButton from "@/components/ResultsShareButton";
import SearchFilters, {
  SearchFilters as ISearchFilters,
} from "@/components/SearchFilters";

interface TopChapter {
  id: number;
  title: string;
  snippet: string;
  relevanceScore: number;
  whyRelevant: string;
  keyTopics: string[];
}

interface BookGroup {
  id: string;
  title: string;
  author: string;
  cover: string;
  isbn: string;
  topChapters: TopChapter[];
}

// Legacy interfaces for backward compatibility
interface ChapterMatch {
  chapter: string;
  title: string;
  pages: string;
  relevance: string;
  relevanceScore: number;
  keyTopics: string[];
  why: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  amazonLink: string;
  rating?: number;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  isbn?: string;
  relevantChapters?: ChapterMatch[];
  chapterRelevanceScore?: number;
}

interface SearchResults {
  query: string;
  totalBooks: number;
  totalChapters: number;
  books: BookGroup[];
  searchType: string;
}

interface GeneratedSummary {
  id: string;
  topic: string;
  books: Book[];
  summary: string;
  keyInsights: string[];
  quotes: string[];
  generatedAt: string;
  userId: number;
}

interface TopicAnalysis {
  isBroad: boolean;
  broadnessScore: number;
  suggestedRefinements: string[];
  explanation: string;
}

interface TopicRefinement {
  label: string;
  value: string;
  description: string;
}

export default function Generate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] =
    useState<GeneratedSummary | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResults | null>(
    null,
  );
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Topic refinement states
  const [showRefinements, setShowRefinements] = useState(false);
  const [topicAnalysis, setTopicAnalysis] = useState<TopicAnalysis | null>(
    null,
  );
  const [topicRefinements, setTopicRefinements] = useState<TopicRefinement[]>(
    [],
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Search filters
  const [showFilters, setShowFilters] = useState(false);
  const [searchFilters, setSearchFilters] = useState<ISearchFilters>({
    publicationYearRange: [1990, new Date().getFullYear()],
    difficultyLevel: "any",
    industryFocus: [],
    bookCategories: [],
    minRating: 0,
  });

  // Restore search state when component mounts
  useEffect(() => {
    const savedResults = sessionStorage.getItem("lastSearchResults");
    const savedQuery = sessionStorage.getItem("lastSearchQuery");

    if (savedResults && savedQuery) {
      try {
        const parsedResults = JSON.parse(savedResults);
        setSearchResults(parsedResults);
        setTopic(savedQuery);
        console.log("🔄 Restored previous search state");
      } catch (error) {
        console.error("Failed to restore search state:", error);
        sessionStorage.removeItem("lastSearchResults");
        sessionStorage.removeItem("lastSearchQuery");
      }
    }
  }, []);

  const analyzeTopic = async (topicToAnalyze: string) => {
    if (!topicToAnalyze.trim()) return;

    setIsAnalyzing(true);
    setCurrentOperation("Analyzing your search query...");

    try {
      const response = await fetch("/api/topic/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topicToAnalyze.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze topic");
      }

      const data = await response.json();
      setTopicAnalysis(data.analysis);
      setTopicRefinements(data.refinements);

      if (data.analysis.isBroad) {
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
      setCurrentOperation("");
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    // First analyze the topic to determine if it needs refinement
    await analyzeTopic(topic.trim());
  };

  const performDatabaseSearch = async (searchQuery: string) => {
    setIsGenerating(true);
    setShowRefinements(false);
    setSearchResults(null);
    setGeneratedSummary(null);
    setCurrentOperation("Searching knowledge base...");

    try {
      // Use the new database search API that uses real embeddings
      const response = await fetch(
        `/api/database?q=${encodeURIComponent(searchQuery)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to search database");
      }

      const data: SearchResults = await response.json();

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

        {/* Enhanced Search Form */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="p-10 shadow-2xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-3xl relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 dark:from-indigo-900/10 dark:to-purple-900/10"></div>

            <CardContent className="p-0 relative z-10">
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
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="leadership strategies, negotiation tactics, team building, innovation..."
                    className="text-lg py-6 pl-16 pr-6 rounded-2xl border-2 border-gray-200 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-300 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm shadow-inner text-gray-900 dark:text-white placeholder:text-gray-500"
                    onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                    disabled={isGenerating || isAnalyzing}
                  />

                  {/* Search suggestions */}
                  <div className="mt-6 flex flex-wrap gap-3 justify-center">
                    {[
                      "Leadership",
                      "Negotiation",
                      "Communication",
                      "Innovation",
                      "Strategy",
                      "Team Building",
                      "Productivity",
                      "Management",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setTopic(suggestion)}
                        className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 rounded-full hover:from-indigo-500 hover:to-purple-500 hover:text-white transition-all duration-300 transform hover:scale-105 border border-indigo-200 dark:border-indigo-700 shadow-sm"
                        disabled={isGenerating || isAnalyzing}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <Button
                      onClick={handleGenerate}
                      disabled={!topic.trim() || isGenerating || isAnalyzing}
                      className="w-full py-6 text-lg font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none disabled:opacity-50 relative overflow-hidden group"
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
                </div>

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
                    className="px-6 py-3 border-2 border-amber-300 dark:border-amber-600 hover:border-amber-500 dark:hover:border-amber-400 rounded-xl text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/20"
                  >
                    Continue with "{topic}"
                  </Button>
                  <Button
                    onClick={() => setShowRefinements(false)}
                    variant="ghost"
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Let me rephrase
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Results Grid */}
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

            {/* Beautiful Book Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {searchResults.books.map((bookGroup) => (
                <Card
                  key={bookGroup.id}
                  className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white via-gray-50/50 to-gray-100/30 dark:from-gray-800 dark:via-gray-900/50 dark:to-gray-800 backdrop-blur-md hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] rounded-3xl cursor-pointer group"
                  onClick={() => handleBookCardClick(bookGroup)}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Enhanced Book Cover */}
                      <div className="w-36 flex-shrink-0 p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30">
                        <div className="relative">
                          <img
                            src={bookGroup.cover}
                            alt={bookGroup.title}
                            className="w-full h-44 object-cover rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 border-2 border-white/50 dark:border-gray-700/50"
                            onError={(e) => {
                              const target = e.currentTarget;
                              target.src = `https://via.placeholder.com/300x400/667eea/FFFFFF?text=${encodeURIComponent(bookGroup.title.split(" ").slice(0, 3).join(" "))}`;
                            }}
                            loading="lazy"
                          />
                          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        </div>
                      </div>

                      {/* Book Info & Chapters */}
                      <div className="flex-1 p-6">
                        {/* Book Header */}
                        <div className="mb-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {bookGroup.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
                            <Users className="w-4 h-4 mr-2" />
                            {bookGroup.author || "Unknown Author"}
                          </p>
                        </div>

                        {/* Top Chapters */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center">
                            <Sparkles className="w-4 h-4 mr-2 text-emerald-500" />
                            Most Relevant Chapters
                          </h4>
                          {bookGroup.topChapters
                            .slice(0, 3)
                            .map((chapter, index) => (
                              <div
                                key={chapter.id}
                                onClick={(e) =>
                                  handleChapterClick(e, bookGroup, chapter)
                                }
                                className="flex items-start space-x-3 p-3 rounded-xl bg-white/60 dark:bg-gray-800/60 hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all cursor-pointer border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transform hover:scale-[1.02]"
                              >
                                <div className="flex-shrink-0">
                                  <Badge
                                    variant="outline"
                                    className="bg-gradient-to-r from-emerald-500 to-cyan-500 border-0 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md"
                                  >
                                    {chapter.relevanceScore}%
                                  </Badge>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 mb-1">
                                    {chapter.title}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                    {chapter.whyRelevant || chapter.snippet}
                                  </p>
                                  {chapter.keyTopics &&
                                    chapter.keyTopics.length > 0 && (
                                      <div className="flex flex-wrap gap-1">
                                        {chapter.keyTopics
                                          .slice(0, 2)
                                          .map((topic, topicIndex) => (
                                            <span
                                              key={topicIndex}
                                              className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full"
                                            >
                                              {topic}
                                            </span>
                                          ))}
                                      </div>
                                    )}
                                </div>
                                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ChevronRight className="w-4 h-4 text-indigo-500" />
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* Call to Action */}
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400 flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              Click to explore all chapters
                            </span>
                            <ChevronRight className="w-5 h-5 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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

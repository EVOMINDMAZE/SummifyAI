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

  // Note: Authentication no longer required for database search
  // Users can search the database without being logged in

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
        // Topic is specific enough, proceed with generation
        startGeneration(topicToAnalyze);
      }
    } catch (error) {
      console.error("Topic analysis error:", error);
      // If analysis fails, proceed with generation anyway
      startGeneration(topicToAnalyze);
    } finally {
      setIsAnalyzing(false);
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

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to search database");
      }

      const data: SearchResults = await response.json();

      console.log(
        `🎯 Found ${data.totalBooks} books with ${data.totalChapters} relevant chapters`,
      );

      // Set the new search results for grid display
      setSearchResults(data);
      setIsGenerating(false);

      // Save search state for navigation preservation
      sessionStorage.setItem("lastSearchResults", JSON.stringify(data));
      sessionStorage.setItem("lastSearchQuery", searchQuery);
    } catch (error) {
      console.error("AI Vector search error:", error);
      setIsGenerating(false);

      // Show user-friendly error with better UX
      alert("Search failed. Please check your connection and try again.");
    }
  };

  // Note: pollProgress function removed - no longer needed for direct database search

  const handleRefinementSelect = (refinedTopic: string) => {
    setTopic(refinedTopic);
    performDatabaseSearch(refinedTopic);
  };

  const proceedWithOriginalTopic = () => {
    performDatabaseSearch(topic);
  };

  // Helper function to generate summary from search results
  const generateSearchSummary = (books: Book[], query: string): string => {
    const totalChapters = books.reduce(
      (sum, book) => sum + (book.relevantChapters?.length || 0),
      0,
    );

    return `## Database Search Results for \"${query}\"\n\nI found ${totalChapters} highly relevant chapters across ${books.length} books in our comprehensive database. These chapters have been selected based on semantic similarity to your search query using advanced AI vector embeddings.\n\n## Key Findings\n\n• **Comprehensive Coverage**: Our database contains thousands of pre-processed book chapters with AI-generated embeddings for precise semantic search\n• **Relevance Scoring**: Each chapter is ranked by semantic similarity to your query, ensuring you get the most relevant content first\n• **Diverse Sources**: Results span multiple books and authors, giving you varied perspectives on ${query.toLowerCase()}\n\n## How to Use These Results\n\n• **Start with High-Scoring Chapters**: Focus on chapters with 80%+ relevance scores for the most targeted content\n• **Cross-Reference**: Compare insights across different books to build a comprehensive understanding\n• **Deep Dive**: Use the \"Get Book\" links to access full content for chapters that interest you most`;
  };

  // Helper function to generate key insights
  const generateKeyInsights = (books: Book[]): string[] => {
    const insights: string[] = [];

    const avgRelevance =
      books.reduce((sum, book) => {
        const chapterScores =
          book.relevantChapters?.map((ch) => ch.relevanceScore) || [];
        const bookAvg =
          chapterScores.reduce((s, score) => s + score, 0) /
          Math.max(chapterScores.length, 1);
        return sum + bookAvg;
      }, 0) / Math.max(books.length, 1);

    insights.push(
      `Average relevance score of ${Math.round(avgRelevance)}% indicates high-quality matches from our AI-powered semantic search`,
    );

    if (books.length > 5) {
      insights.push(
        `Found content across ${books.length} different books, providing diverse perspectives and comprehensive coverage`,
      );
    }

    const uniqueAuthors = new Set(books.map((book) => book.author)).size;
    if (uniqueAuthors > 3) {
      insights.push(
        `Results include insights from ${uniqueAuthors} different authors, ensuring varied viewpoints and approaches`,
      );
    }

    const recentBooks = books.filter((book) => {
      const year = book.publishedDate ? parseInt(book.publishedDate) : 0;
      return year > 2010;
    }).length;

    if (recentBooks > 0) {
      insights.push(
        `${recentBooks} books from the last decade ensure you get contemporary insights and current best practices`,
      );
    }

    return insights;
  };

  const handleShare = (chapter: ChapterMatch, book: Book) => {
    const shareText = `Check out "${chapter.title}" from "${book.title}" by ${book.author} - ${chapter.relevanceScore}% match for "${topic}"`;

    if (navigator.share) {
      navigator.share({
        title: `${chapter.title} - Chapter Discovery`,
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="text-center mb-16">
          <div className="bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] rounded-3xl p-12 text-white relative overflow-hidden shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-48 translate-x-48 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
            <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-16 -translate-y-16 animate-bounce"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                AI Chapter Discovery
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed">
                Unlock knowledge from thousands of books instantly. Our
                AI-powered semantic search finds the exact chapters you need
                across our comprehensive database.
              </p>
              <div className="flex flex-wrap justify-center gap-4 text-sm">
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  ⚡ Instant Results
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  🧠 AI-Powered
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  📚 1000+ Books
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2">
                  🎯 Semantic Search
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Search Form */}
        <div className="max-w-4xl mx-auto mb-16">
          <Card className="p-10 shadow-2xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-3xl relative overflow-hidden">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10"></div>

            <CardContent className="p-0 relative z-10">
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    What knowledge are you seeking?
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter any topic and discover relevant chapters across our
                    entire book database
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                    <div className="w-6 h-6 text-gray-400">🔍</div>
                  </div>
                  <Input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="leadership, productivity, negotiation, team building, innovation..."
                    className="text-lg py-6 pl-16 pr-6 rounded-2xl border-2 border-gray-200 dark:border-gray-600 focus:border-[#667eea] dark:focus:border-[#667eea] transition-all duration-300 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm shadow-inner"
                    onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                    disabled={isGenerating || isAnalyzing}
                  />

                  {/* Search suggestions */}
                  <div className="mt-4 flex flex-wrap gap-2 justify-center">
                    {[
                      "Leadership",
                      "Productivity",
                      "Negotiation",
                      "Innovation",
                      "Strategy",
                      "Communication",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setTopic(suggestion)}
                        className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-[#667eea] hover:text-white transition-all duration-200 transform hover:scale-105"
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
                      className="w-full py-6 text-lg font-bold bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] hover:from-[#5a67d8] hover:via-[#6b46c1] hover:to-[#ec4899] text-white rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:transform-none disabled:opacity-50 relative overflow-hidden group"
                    >
                      {/* Button shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-pulse"></div>

                      <div className="relative z-10">
                        {isAnalyzing ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            <span>Analyzing Topic...</span>
                          </div>
                        ) : isGenerating ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                            <span>Searching Database...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <BookOpen className="w-6 h-6 mr-3" />
                            <span>Search Knowledge Base</span>
                          </div>
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

                {isGenerating && (
                  <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-center space-x-4">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#667eea] border-t-transparent"></div>
                        <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-[#667eea] opacity-20"></div>
                      </div>
                      <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        Searching with AI...
                      </span>
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
            <Card className="shadow-2xl border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center">
                    <Target className="w-8 h-8 mr-3 text-blue-600" />
                    Let's Make Your Search More Specific
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                    {topicAnalysis.explanation}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose a more specific focus below, or continue with your
                    original topic.
                  </p>
                </div>

                <div className="grid gap-4 mb-6">
                  {topicRefinements.map((refinement, index) => (
                    <button
                      key={index}
                      onClick={() => handleRefinementSelect(refinement.value)}
                      className="text-left p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-lg group"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {refinement.label}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {refinement.description}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            Search: "{refinement.value}"
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={proceedWithOriginalTopic}
                    variant="outline"
                    className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl"
                  >
                    Continue with "{topic}"
                  </Button>
                  <Button
                    onClick={() => setShowRefinements(false)}
                    variant="ghost"
                    className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Let me rephrase
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Compact Grid Results */}
        {searchResults && (
          <div className="max-w-7xl mx-auto">
            {/* Results Header */}
            <div className="text-center mb-12">
              <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20 rounded-3xl p-8 border border-emerald-200 dark:border-emerald-800">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  AI Discovery Results
                </h2>
                <div className="text-xl text-emerald-700 dark:text-emerald-300 font-semibold mb-4">
                  "{searchResults.query}"
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
                  <div className="bg-white/70 dark:bg-gray-800/70 rounded-full px-4 py-2 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                    {searchResults.totalChapters} Relevant Chapters
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/70 rounded-full px-4 py-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {searchResults.totalBooks} Books Found
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/70 rounded-full px-4 py-2 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    {searchResults.searchType === "ai_vector_search"
                      ? "Vector"
                      : "Text"}{" "}
                    Search
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Book Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {searchResults.books.map((bookGroup) => (
                <Card
                  key={bookGroup.id}
                  className="overflow-hidden shadow-xl border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur-md hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] rounded-2xl cursor-pointer"
                  onClick={() => handleBookCardClick(bookGroup)}
                >
                  <CardContent className="p-0">
                    <div className="flex">
                      {/* Compact Book Cover */}
                      <div className="w-32 flex-shrink-0 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30">
                        <img
                          src={bookGroup.cover}
                          alt={bookGroup.title}
                          className="w-full h-40 object-cover rounded-xl shadow-lg"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.src = `https://via.placeholder.com/300x400/667eea/FFFFFF?text=${encodeURIComponent(bookGroup.title.split(" ").slice(0, 3).join(" "))}`;
                          }}
                          loading="lazy"
                        />
                      </div>

                      {/* Book Info & Chapters */}
                      <div className="flex-1 p-6">
                        {/* Book Title & Author */}
                        <div className="mb-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                            {bookGroup.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            by {bookGroup.author}
                          </p>
                        </div>

                        {/* Top Chapters */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                            Most Relevant Chapters
                          </h4>
                          {bookGroup.topChapters
                            .slice(0, 3)
                            .map((chapter, index) => (
                              <div
                                key={chapter.id}
                                className="flex items-start space-x-3"
                              >
                                <Badge
                                  variant="outline"
                                  className="bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-700 dark:text-emerald-400 text-xs font-bold px-2 py-1 rounded-full flex-shrink-0"
                                >
                                  {chapter.relevanceScore}%
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                                    {chapter.title}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                                    {chapter.snippet}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>

                        {/* View Details Button */}
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Click to view all chapters
                            </span>
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Legacy Results (Hidden when using new grid) */}
        {generatedSummary && !searchResults && (
          <div className="space-y-8">
            {/* Enhanced Results Header */}
            <div className="text-center mb-12">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl p-8 border border-emerald-200 dark:border-emerald-800">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Discovery Results
                </h2>
                <div className="text-xl text-emerald-700 dark:text-emerald-300 font-semibold mb-2">
                  "{generatedSummary.topic}"
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
                  <div className="bg-white/70 dark:bg-gray-800/70 rounded-full px-4 py-2 flex items-center">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                    {
                      generatedSummary.books.flatMap(
                        (book) => book.relevantChapters || [],
                      ).length
                    }{" "}
                    Chapters Found
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/70 rounded-full px-4 py-2 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {generatedSummary.books.length} Books Searched
                  </div>
                  <div className="bg-white/70 dark:bg-gray-800/70 rounded-full px-4 py-2 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    AI-Powered Results
                  </div>
                </div>
              </div>

              {/* Share Results Button */}
              <div className="flex justify-center">
                <ResultsShareButton
                  topic={generatedSummary.topic}
                  books={generatedSummary.books}
                  totalChapters={
                    generatedSummary.books.flatMap(
                      (book) => book.relevantChapters || [],
                    ).length
                  }
                />
              </div>
            </div>

            {/* Chapter Results */}
            <div className="space-y-8">
              {generatedSummary.books.flatMap((book, bookIndex) =>
                (book.relevantChapters || []).map((chapter, chapterIndex) => (
                  <Card
                    key={`${book.id}-${chapterIndex}`}
                    className="overflow-hidden shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur-md hover:shadow-3xl transition-all duration-500 transform hover:scale-[1.02] rounded-3xl"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Enhanced Book Cover */}
                        <div className="lg:w-80 flex-shrink-0 p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30">
                          <div className="relative group transform transition-transform duration-300 hover:scale-105">
                            <img
                              src={book.cover}
                              alt={book.title}
                              className="w-full h-80 object-cover rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 border-4 border-white/50 dark:border-gray-700/50"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.dataset.retried) {
                                  target.dataset.retried = "true";
                                  target.src = book.cover.replace(
                                    "m.media-amazon.com",
                                    "images-na.ssl-images-amazon.com",
                                  );
                                } else {
                                  target.src = `https://via.placeholder.com/300x400/667eea/FFFFFF?text=${encodeURIComponent(book.title.split(" ").slice(0, 3).join(" "))}`;
                                }
                              }}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            {/* Floating glow effect */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>

                            {/* Book Rating Badge */}
                            {book.rating && (
                              <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                <span className="text-sm font-semibold">
                                  {book.rating}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Enhanced Book Actions */}
                          <div className="mt-6 space-y-4">
                            <a
                              href={book.amazonLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF6347] hover:from-[#FFA500] hover:via-[#FF6347] hover:to-[#FFD700] text-white px-6 py-4 rounded-2xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl text-center block transform hover:scale-105 relative overflow-hidden group"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 group-hover:animate-pulse"></div>
                              <div className="relative z-10 flex items-center justify-center">
                                <ExternalLink className="w-5 h-5 mr-2" />
                                Get This Book
                              </div>
                            </a>
                            <Button
                              onClick={() => handleShare(chapter, book)}
                              variant="outline"
                              size="sm"
                              className="w-full rounded-2xl border-2 border-[#667eea] text-[#667eea] hover:bg-[#667eea] hover:text-white transition-all duration-300 py-3 font-semibold"
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Discovery
                            </Button>
                          </div>
                        </div>

                        {/* Chapter Details */}
                        <div className="flex-1 p-8">
                          {/* Enhanced Chapter Header */}
                          <div className="mb-8">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <Badge
                                variant="secondary"
                                className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                              >
                                {chapter.chapter}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 px-4 py-2 rounded-full text-sm font-bold"
                              >
                                ✓ {Math.round(chapter.relevanceScore || 95)}%
                                Match
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-medium"
                              >
                                📖 Pages {chapter.pages}
                              </Badge>
                            </div>
                          </div>

                          {/* Enhanced Chapter Title */}
                          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            {chapter.title}
                          </h3>

                          {/* Book Info */}
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                              From: {book.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              by {book.author}
                              {book.publishedDate && (
                                <>
                                  <Clock className="w-4 h-4 ml-4 mr-2" />
                                  {book.publishedDate}
                                </>
                              )}
                              {book.pageCount && (
                                <>
                                  <BookOpen className="w-4 h-4 ml-4 mr-2" />
                                  {book.pageCount} pages
                                </>
                              )}
                            </p>
                          </div>

                          <Separator className="my-6" />

                          {/* Why This Chapter is Relevant */}
                          <div className="mb-6">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                              Why this chapter is relevant to "
                              {generatedSummary.topic}":
                            </h5>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                              {chapter.why}
                            </p>
                          </div>

                          {/* Key Topics */}
                          <div className="mb-6">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                              Key Topics Covered:
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {chapter.keyTopics.map((topic, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm"
                                >
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Quick Tip */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start">
                              <Lightbulb className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
                              <span>
                                <strong>Quick tip:</strong> Focus on this
                                chapter to understand{" "}
                                {chapter.relevance.toLowerCase()}
                              </span>
                            </p>
                          </div>

                          {/* Book Categories */}
                          {book.categories && book.categories.length > 0 && (
                            <div className="mt-6">
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                                Book Categories:
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {book.categories.map((category, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs"
                                  >
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Chapter Rating */}
                          <div className="mt-6">
                            <ChapterRating
                              bookId={book.id}
                              chapterId={chapter.chapter}
                              searchTopic={generatedSummary.topic}
                              bookTitle={book.title}
                              chapterTitle={chapter.title}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )),
              )}
            </div>

            {/* Enhanced AI Summary Section */}
            {generatedSummary.summary && (
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-3xl overflow-hidden">
                <CardContent className="p-10">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-4">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      Search Summary
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      AI-generated insights from your database search
                    </p>
                  </div>
                  <div className="ai-summary-content text-gray-700 dark:text-gray-300">
                    {generatedSummary.summary.split("\n").map((line, index) => {
                      // Handle markdown headings
                      if (line.startsWith("## ")) {
                        return (
                          <h4
                            key={index}
                            className="text-lg font-bold text-gray-900 dark:text-white mb-3 mt-6 first:mt-0"
                          >
                            {line.replace("## ", "")}
                          </h4>
                        );
                      }
                      // Handle bullet points
                      if (line.startsWith("• ")) {
                        const content = line.replace("• ", "");
                        const [boldPart, ...rest] = content.split(": ");
                        return (
                          <div
                            key={index}
                            className="flex items-start mb-2 ml-4"
                          >
                            <span className="text-indigo-600 dark:text-indigo-400 mr-2 mt-1">
                              •
                            </span>
                            <span>
                              {rest.length > 0 ? (
                                <>
                                  <strong className="text-gray-900 dark:text-white">
                                    {boldPart}:
                                  </strong>
                                  <span className="ml-1">
                                    {rest.join(": ")}
                                  </span>
                                </>
                              ) : (
                                content
                              )}
                            </span>
                          </div>
                        );
                      }
                      // Handle regular paragraphs
                      if (line.trim()) {
                        return (
                          <p key={index} className="mb-4 leading-relaxed">
                            {line}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Key Insights */}
            {generatedSummary.keyInsights &&
              generatedSummary.keyInsights.length > 0 && (
                <Card className="shadow-2xl border-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-cyan-900/20 rounded-3xl overflow-hidden">
                  <CardContent className="p-10">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full mb-4">
                        <Lightbulb className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Key Insights
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Valuable discoveries from your search results
                      </p>
                    </div>
                    <div className="grid gap-4">
                      {generatedSummary.keyInsights.map((insight, index) => (
                        <div
                          key={index}
                          className="flex items-start p-6 bg-white/80 dark:bg-gray-800/80 rounded-2xl border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300 transform hover:scale-[1.02]"
                        >
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-4 shadow-lg">
                            <span className="text-white font-bold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                            {insight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import Navigation from "../components/Navigation";
import BookCover from "../components/BookCover";
import { UpgradeWrapper } from "../components/UpgradePrompt";
import { useFeatureAccess } from "../hooks/useFeatureAccess";
import {
  shareResult,
  exportToPDF,
  toggleSaveResult,
  shareOnTwitter,
  shareOnLinkedIn,
  shareOnFacebook,
  showNotification,
  SearchResult,
} from "../utils/actions";

interface RealSearchResult {
  id: string;
  query: string;
  search_date: string;
  results_count: number;
  results_data?: any;
}

export default function Results() {
  const { user } = useAuth();
  const { id } = useParams();
  const isAuthenticated = !!user;
  const { canExportPDF, canSearch, getRemainingSearches } = useFeatureAccess();
  const [activeTab, setActiveTab] = useState<"recent" | "saved" | "history">(
    "recent",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "topic" | "books" | "rating">(
    "date",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterByRating, setFilterByRating] = useState<number>(0);
  const [filterByAuthor, setFilterByAuthor] = useState<string>("");
  const [savedResults, setSavedResults] = useState<string[]>(
    JSON.parse(localStorage.getItem("savedResults") || "[]"),
  );
  const [realSearchResults, setRealSearchResults] = useState<
    RealSearchResult[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load real search history from Supabase
  useEffect(() => {
    if (user?.id) {
      loadSearchHistory();
    }
  }, [user]);

  const loadSearchHistory = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      console.log("🔍 Loading search history for user:", user.id);

      // Load search history from Supabase
      const { data: searchHistory, error } = await supabase
        .from("user_searches")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error loading search history:", error);
        return;
      }

      console.log(
        "✅ Loaded search history:",
        searchHistory?.length || 0,
        "results",
      );

      const transformedResults: RealSearchResult[] = (searchHistory || []).map(
        (search) => ({
          id: search.id,
          query: search.query,
          search_date: search.created_at,
          results_count: search.results_count || 0,
          results_data: search.results_data,
        }),
      );

      setRealSearchResults(transformedResults);
    } catch (error) {
      console.error("Failed to load search history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Action handlers
  const handleSave = async (result: SearchResult) => {
    const newSavedState = await toggleSaveResult(
      result.id,
      savedResults.includes(result.id),
    );
    if (newSavedState) {
      setSavedResults([...savedResults, result.id]);
      showNotification("Result saved successfully!", "success");
    } else {
      setSavedResults(savedResults.filter((id) => id !== result.id));
      showNotification("Result removed from saved!", "info");
    }
  };

  const handleShare = async (result: SearchResult) => {
    const success = await shareResult(result);
    if (success) {
      showNotification("Shared successfully!", "success");
    } else {
      showNotification("Failed to share", "error");
    }
  };

  const handleExportPDF = async (result: SearchResult) => {
    const success = await exportToPDF(result);
    if (success) {
      showNotification("PDF exported successfully!", "success");
    } else {
      showNotification("Failed to export PDF", "error");
    }
  };

  // Transform real search results to display format
  const transformToDisplayFormat = (realResults: RealSearchResult[]) => {
    return realResults.map((search) => ({
      id: search.id,
      topic: search.query,
      searchDate: search.search_date,
      books: search.results_data?.books || [],
      summary: `Search for "${search.query}" found ${search.results_count} relevant chapters across ${search.results_data?.books?.length || 0} books.`,
      keyInsights: [
        `Found ${search.results_count} chapters matching your search criteria`,
        "AI analysis provided relevance scores and explanations for each result",
        "Results ranked by AI-calculated relevance to maximize value",
      ],
      saved: savedResults.includes(search.id),
      shared: false,
    }));
  };

  // Filter and sort search results
  const filteredAndSortedResults = () => {
    let filtered = transformToDisplayFormat(realSearchResults);

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (result) =>
          result.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.books.some(
            (book: any) =>
              book.book_title
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              book.book_author
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()),
          ) ||
          result.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.keyInsights.some((insight) =>
            insight.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    // Apply rating filter
    if (filterByRating > 0) {
      filtered = filtered.filter((result) =>
        result.books.some(
          (book: any) => (book.rating || 4.0) >= filterByRating,
        ),
      );
    }

    // Apply author filter
    if (filterByAuthor) {
      filtered = filtered.filter((result) =>
        result.books.some((book: any) =>
          book.book_author
            ?.toLowerCase()
            .includes(filterByAuthor.toLowerCase()),
        ),
      );
    }

    // Apply tab filter
    switch (activeTab) {
      case "saved":
        filtered = filtered.filter((result) => result.saved);
        break;
      case "history":
        // Show all results for history
        break;
      case "recent":
      default:
        // Show recent results (could add date filter here)
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.searchDate).getTime() - new Date(b.searchDate).getTime();
          break;
        case "topic":
          comparison = a.topic.localeCompare(b.topic);
          break;
        case "books":
          comparison = a.books.length - b.books.length;
          break;
        case "rating":
          const avgRatingA =
            a.books.reduce((sum, book: any) => sum + (book.rating || 4.0), 0) /
            Math.max(a.books.length, 1);
          const avgRatingB =
            b.books.reduce((sum, book: any) => sum + (book.rating || 4.0), 0) /
            Math.max(b.books.length, 1);
          comparison = avgRatingA - avgRatingB;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  const getUniqueAuthors = () => {
    const transformedResults = transformToDisplayFormat(realSearchResults);
    const allAuthors = transformedResults.flatMap((result) =>
      result.books
        .map((book: any) => book.book_author || book.author)
        .filter(Boolean),
    );
    const uniqueAuthors = Array.from(new Set(allAuthors));
    return uniqueAuthors.sort();
  };

  // If viewing individual result, find it by ID
  const displayResults = transformToDisplayFormat(realSearchResults);
  const currentResult = id
    ? {
        ...displayResults.find((result) => result.id === id)!,
        saved: savedResults.includes(id),
      }
    : null;

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="w-16 h-16 bg-[#FFFD63] rounded-lg flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-[#0A0B1E]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#0A0B1E] dark:text-white mb-4">
            Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to view your search results and generated summaries.
          </p>
          <Link
            to="/signin"
            className="inline-block bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // If viewing individual result, render single result view
  if (id && currentResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />

        {/* Individual Result Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
            {/* Result Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {currentResult.topic}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Generated on{" "}
                {new Date(currentResult.searchDate).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-4 mt-4">
                {currentResult.saved && (
                  <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm">
                    ⭐ Saved
                  </span>
                )}
                {currentResult.shared && (
                  <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                    🔗 Shared
                  </span>
                )}
              </div>
            </div>

            {/* Books Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📚 Books Analyzed ({currentResult.books.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentResult.books.map((book: any, index: number) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6"
                  >
                    <BookCover
                      src={book.book_cover_url || book.cover}
                      title={book.book_title || book.title}
                      author={book.book_author || book.author}
                      className="mb-4"
                    />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {book.book_title || book.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      by {book.book_author || book.author}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex text-yellow-400">
                        {"★".repeat(Math.floor(book.rating || 4.0))}
                        {"☆".repeat(5 - Math.floor(book.rating || 4.0))}
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {book.rating || 4.0}
                      </span>
                    </div>
                    <a
                      href={`https://amazon.com/s?k=${encodeURIComponent(`${book.book_title || book.title} ${book.book_author || book.author}`)}&tag=summifyai-20`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium transition-colors text-center block"
                    >
                      Buy on Amazon
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🧠 AI Search Analysis
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                  {currentResult.summary}
                </p>
              </div>
            </div>

            {/* Key Insights Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                💡 Search Results
              </h2>
              <div className="space-y-4">
                {currentResult.keyInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg"
                  >
                    <p className="text-gray-800 dark:text-gray-200">
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-4">
              <UpgradeWrapper feature="exportToPDF">
                <button
                  onClick={() => canExportPDF() && handleExportPDF(currentResult)}
                  disabled={!canExportPDF()}
                  className="bg-[#4361EE] hover:bg-[#4361EE]/90 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Export PDF
                </button>
              </UpgradeWrapper>
              <button
                onClick={() => handleShare(currentResult)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Share Result
              </button>
              <button
                onClick={() => handleSave(currentResult)}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  currentResult.saved
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                    : "bg-gray-500 hover:bg-gray-600 text-white"
                }`}
              >
                {currentResult.saved ? "Saved ✓" : "Save to Library"}
              </button>

              {/* Social sharing buttons */}
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => shareOnTwitter(currentResult)}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg"
                  title="Share on Twitter"
                >
                  🐦
                </button>
                <button
                  onClick={() => shareOnLinkedIn(currentResult)}
                  className="bg-blue-700 hover:bg-blue-800 text-white p-2 rounded-lg"
                  title="Share on LinkedIn"
                >
                  💼
                </button>
                <button
                  onClick={() => shareOnFacebook(currentResult)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg"
                  title="Share on Facebook"
                >
                  📘
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If ID provided but result not found
  if (id && !currentResult) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Result Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The result you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/results"
            className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Results
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />

      {/* Header with Dashboard Style */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="bg-[#FFFD63] dark:bg-gray-800 rounded-3xl p-8 text-[#0A0B1E] dark:text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Your Search Results 📊
              </h1>
              <p className="text-[#0A0B1E]/80 dark:text-gray-300 text-lg mb-6">
                View and manage your chapter discoveries and insights from our
                AI analysis
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="bg-[#0A0B1E]/10 dark:bg-white/10 rounded-xl px-6 py-3 flex items-center">
                  <span className="font-bold text-lg mr-2">
                    {user?.searchCount || realSearchResults.length}
                  </span>
                  <span className="text-sm">Searches Completed</span>
                </div>
                <div className="bg-[#0A0B1E]/10 dark:bg-white/10 rounded-xl px-6 py-3 flex items-center">
                  <span className="font-bold text-lg mr-2 capitalize">
                    {user?.planType || "Free"}
                  </span>
                  <span className="text-sm">Plan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("recent")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "recent"
                  ? "border-[#FFFD63] text-[#0A0B1E]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Recent Searches ({realSearchResults.length})
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "saved"
                  ? "border-[#FFFD63] text-[#0A0B1E]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Saved Summaries ({savedResults.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-[#FFFD63] text-[#0A0B1E]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All History ({realSearchResults.length})
            </button>
          </nav>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Search & Filter Results
            </h3>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredAndSortedResults().length} results found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <input
                type="text"
                placeholder="Search topics, books, authors, or insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
              />
            </div>

            {/* Author Filter */}
            <div>
              <select
                value={filterByAuthor}
                onChange={(e) => setFilterByAuthor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
              >
                <option value="">All Authors</option>
                {getUniqueAuthors().map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating Filter */}
            <div>
              <select
                value={filterByRating}
                onChange={(e) => setFilterByRating(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
              >
                <option value={0}>All Ratings</option>
                <option value={4.5}>4.5+ Stars</option>
                <option value={4.0}>4.0+ Stars</option>
                <option value={3.5}>3.5+ Stars</option>
                <option value={3.0}>3.0+ Stars</option>
              </select>
            </div>

            {/* Sort Controls */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "date" | "topic" | "books" | "rating",
                  )
                }
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent text-sm"
              >
                <option value="date">Date</option>
                <option value="topic">Topic</option>
                <option value="books">Books</option>
                <option value="rating">Rating</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors font-medium text-sm"
                title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          {/* Clear Filters */}
          {(searchQuery || filterByAuthor || filterByRating > 0) && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterByAuthor("");
                  setFilterByRating(0);
                  setSortBy("date");
                  setSortOrder("desc");
                }}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium text-sm"
              >
                🗑️ Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="pb-12">
          {isLoading ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFFD63] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading your search history...
              </p>
            </div>
          ) : (
            activeTab === "recent" && (
              <div className="space-y-8">
                {filteredAndSortedResults().length > 0 ? (
                  filteredAndSortedResults().map((result) => (
                    <div
                      key={result.id}
                      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-[#0A0B1E] dark:text-white mb-2">
                            "{result.topic}"
                          </h2>
                          <p className="text-gray-600 dark:text-gray-300">
                            Searched on{" "}
                            {new Date(result.searchDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleSave({
                                ...result,
                                saved: savedResults.includes(result.id),
                              })
                            }
                            className={`px-3 py-1 rounded-lg text-sm font-medium ${
                              savedResults.includes(result.id)
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                          >
                            {savedResults.includes(result.id)
                              ? "Saved ✓"
                              : "Save"}
                          </button>
                          <button
                            onClick={() =>
                              handleShare({
                                ...result,
                                saved: savedResults.includes(result.id),
                              })
                            }
                            className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
                          >
                            Share
                          </button>
                          <UpgradeWrapper feature="exportToPDF">
                            <button
                              onClick={() =>
                                canExportPDF() && handleExportPDF({
                                  ...result,
                                  saved: savedResults.includes(result.id),
                                })
                              }
                              disabled={!canExportPDF()}
                              className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Export PDF
                            </button>
                          </UpgradeWrapper>
                        </div>
                      </div>

                      {/* Books Found */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-[#0A0B1E] dark:text-white mb-4">
                          Books Found ({result.books.length})
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {result.books
                            .slice(0, 3)
                            .map((book: any, index: number) => (
                              <div
                                key={index}
                                className="flex gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                              >
                                <BookCover
                                  src={book.book_cover_url || book.cover}
                                  title={book.book_title || book.title}
                                  author={book.book_author || book.author}
                                  width="w-16"
                                  height="h-20"
                                />
                                <div className="flex-1">
                                  <h4 className="font-medium text-[#0A0B1E] dark:text-white text-sm mb-1">
                                    {book.book_title || book.title}
                                  </h4>
                                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                                    {book.book_author || book.author}
                                  </p>
                                  <div className="flex items-center gap-2">
                                    <div className="flex text-yellow-400 text-sm">
                                      {"★".repeat(
                                        Math.floor(book.rating || 4.0),
                                      )}
                                    </div>
                                    <span className="text-gray-500 text-sm">
                                      {book.rating || 4.0}
                                    </span>
                                  </div>
                                  <a
                                    href={`https://amazon.com/s?k=${encodeURIComponent(`${book.book_title || book.title} ${book.book_author || book.author}`)}&tag=summifyai-20`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                                  >
                                    View on Amazon →
                                  </a>
                                </div>
                              </div>
                            ))}
                        </div>
                        {result.books.length > 3 && (
                          <p className="text-sm text-gray-500 mt-2">
                            ... and {result.books.length - 3} more books
                          </p>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-[#0A0B1E] dark:text-white mb-3">
                          Search Summary
                        </h3>
                        <p className="text-gray-700 dark:text-gray-200 leading-relaxed bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          {result.summary}
                        </p>
                      </div>

                      {/* Key Insights */}
                      <div>
                        <h3 className="text-lg font-semibold text-[#0A0B1E] dark:text-white mb-3">
                          Search Results
                        </h3>
                        <ul className="space-y-2">
                          {result.keyInsights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className="w-5 h-5 bg-[#FFFD63] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-[#0A0B1E] text-sm font-bold">
                                  {index + 1}
                                </span>
                              </div>
                              <span className="text-gray-700 dark:text-gray-200">
                                {insight}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No searches yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      You haven't performed any searches yet. Start discovering
                      chapters from thousands of business books!
                    </p>
                    <Link
                      to="/generate"
                      className="inline-block bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      🔍 Start Your First Search
                    </Link>
                  </div>
                )}
              </div>
            )
          )}

          {activeTab === "saved" && (
            <div className="space-y-8">
              {filteredAndSortedResults().length > 0 ? (
                filteredAndSortedResults().map((result) => (
                  <div
                    key={result.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-[#0A0B1E] dark:text-white mb-2">
                          {result.topic}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                          Saved from{" "}
                          {new Date(result.searchDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          handleSave({
                            ...result,
                            saved: savedResults.includes(result.id),
                          })
                        }
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {result.summary}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        to={`/results/${result.id}`}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
                      >
                        View Full Results
                      </Link>
                      <UpgradeWrapper feature="exportToPDF">
                        <button
                          onClick={() =>
                            canExportPDF() && handleExportPDF({
                              ...result,
                              saved: savedResults.includes(result.id),
                            })
                          }
                          disabled={!canExportPDF()}
                          className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Export PDF
                        </button>
                      </UpgradeWrapper>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No saved searches yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Save search results to access them later.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              {filteredAndSortedResults().length > 0 ? (
                filteredAndSortedResults().map((result) => (
                  <div
                    key={result.id}
                    className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold text-[#0A0B1E] dark:text-white mb-1">
                          "{result.topic}"
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {new Date(result.searchDate).toLocaleDateString()} •{" "}
                          {result.books.length} books found
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {result.saved && (
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm font-medium">
                            Saved
                          </span>
                        )}
                        {result.shared && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                            Shared
                          </span>
                        )}
                        <Link
                          to={`/results/${result.id}`}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No search history
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your search history will appear here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

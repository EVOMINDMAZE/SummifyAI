import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ThemeToggle from "../components/ThemeToggle";

export default function Results() {
  const { user, shareContent } = useAuth();
  const isAuthenticated = !!user;
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

  // Mock user search results - this would come from backend
  const mockSearchResults = [
    {
      id: "1",
      topic: "Leadership",
      searchDate: "2024-01-20",
      books: [
        {
          title: "Good to Great",
          author: "Jim Collins",
          image: "https://covers.openlibrary.org/b/id/8739161-M.jpg",
          affiliateLink: "https://amazon.com/dp/0066620996?tag=summifyai-20",
          rating: 4.5,
        },
        {
          title: "The 7 Habits of Highly Effective People",
          author: "Stephen R. Covey",
          image: "https://covers.openlibrary.org/b/id/8739162-M.jpg",
          affiliateLink: "https://amazon.com/dp/1982137274?tag=summifyai-20",
          rating: 4.7,
        },
        {
          title: "Leaders Eat Last",
          author: "Simon Sinek",
          image: "https://covers.openlibrary.org/b/id/8739163-M.jpg",
          affiliateLink: "https://amazon.com/dp/1591845327?tag=summifyai-20",
          rating: 4.4,
        },
      ],
      summary:
        "Leadership is fundamentally about serving others and creating environments where people can thrive. The best leaders understand that their primary role is to enable their teams to achieve extraordinary results through clear vision, consistent principles, and genuine care for people's development.",
      keyInsights: [
        "Great leaders prioritize the success of their team over personal recognition",
        "Consistent principles and values create trust and predictability",
        "Leadership is a practice that requires continuous learning and adaptation",
      ],
      saved: true,
      shared: false,
    },
    {
      id: "2",
      topic: "Productivity",
      searchDate: "2024-01-18",
      books: [
        {
          title: "Deep Work",
          author: "Cal Newport",
          image: "https://covers.openlibrary.org/b/id/8739164-M.jpg",
          affiliateLink: "https://amazon.com/dp/1455586691?tag=summifyai-20",
          rating: 4.6,
        },
        {
          title: "Getting Things Done",
          author: "David Allen",
          image: "https://covers.openlibrary.org/b/id/8739165-M.jpg",
          affiliateLink: "https://amazon.com/dp/0143126563?tag=summifyai-20",
          rating: 4.3,
        },
      ],
      summary:
        "Peak productivity comes from the ability to focus deeply on meaningful work while maintaining efficient systems for managing tasks and commitments. The key is creating distraction-free environments and trusted systems that free your mind to focus on what matters most.",
      keyInsights: [
        "Deep, focused work produces exponentially better results than fragmented attention",
        "External systems for capturing tasks eliminate mental overhead",
        "Protecting attention is as important as managing time",
      ],
      saved: false,
      shared: true,
    },
    {
      id: "3",
      topic: "Innovation",
      searchDate: "2024-01-15",
      books: [
        {
          title: "The Innovator's Dilemma",
          author: "Clayton M. Christensen",
          image: "https://covers.openlibrary.org/b/id/8739166-M.jpg",
          affiliateLink: "https://amazon.com/dp/1633691780?tag=summifyai-20",
          rating: 4.2,
        },
      ],
      summary:
        "Innovation often fails when established companies focus too heavily on current customers' needs while missing disruptive technologies that initially serve niche markets but eventually transform entire industries.",
      keyInsights: [
        "Disruptive innovations start by serving overlooked market segments",
        "Success can blind organizations to emerging threats",
        "Innovation requires balancing current performance with future possibilities",
      ],
      saved: true,
      shared: false,
    },
  ];

  // Filter and sort search results
  const filteredAndSortedResults = () => {
    let filtered = mockSearchResults;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (result) =>
          result.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.books.some(
            (book) =>
              book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              book.author.toLowerCase().includes(searchQuery.toLowerCase()),
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
        result.books.some((book) => book.rating >= filterByRating),
      );
    }

    // Apply author filter
    if (filterByAuthor) {
      filtered = filtered.filter((result) =>
        result.books.some((book) =>
          book.author.toLowerCase().includes(filterByAuthor.toLowerCase()),
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
            a.books.reduce((sum, book) => sum + book.rating, 0) /
            a.books.length;
          const avgRatingB =
            b.books.reduce((sum, book) => sum + book.rating, 0) /
            b.books.length;
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
    const allAuthors = mockSearchResults.flatMap((result) =>
      result.books.map((book) => book.author),
    );
    const uniqueAuthors = Array.from(new Set(allAuthors));
    return uniqueAuthors.sort();
  };

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <span className="text-[#0A0B1E] font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-[#0A0B1E] dark:text-white">
                SummifyAI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                to="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-[#0A0B1E] dark:hover:text-white font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/generate"
                className="text-gray-600 dark:text-gray-300 hover:text-[#0A0B1E] dark:hover:text-white font-medium"
              >
                Generate
              </Link>
              <Link
                to="/generate"
                className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium transition-colors"
              >
                New Search
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-[#0A0B1E] mb-2">
                Your Search Results
              </h1>
              <p className="text-gray-600">
                View and manage your generated book summaries and insights
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">
                Searches this month
              </div>
              <div className="text-2xl font-bold text-[#0A0B1E]">
                {user?.queriesUsed} /{" "}
                {user?.tier === "premium" ? "∞" : user?.queriesLimit}
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
              Recent Searches
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "saved"
                  ? "border-[#FFFD63] text-[#0A0B1E]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Saved Summaries
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-[#FFFD63] text-[#0A0B1E]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              All History
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="pb-12">
          {activeTab === "recent" && (
            <div className="space-y-8">
              {mockSearchResults.slice(0, 2).map((result) => (
                <div
                  key={result.id}
                  className="bg-white rounded-xl border border-gray-200 p-8"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0A0B1E] mb-2">
                        {result.topic}
                      </h2>
                      <p className="text-gray-600">
                        Generated on{" "}
                        {new Date(result.searchDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          result.saved
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                      >
                        {result.saved ? "Saved" : "Save"}
                      </button>
                      <button
                        onClick={() => {
                          shareContent("summary", result.id);
                          // In a real app, this would open a share dialog or copy a link
                          navigator.clipboard.writeText(
                            `Check out this great summary on ${result.topic}! Generated by SummifyAI.`,
                          );
                          alert(
                            "Summary link copied to clipboard! You earned 1 credit for sharing.",
                          );
                        }}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium"
                      >
                        Share
                      </button>
                      <button className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                        Export PDF
                      </button>
                    </div>
                  </div>

                  {/* Books Found */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#0A0B1E] mb-4">
                      Books Found ({result.books.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {result.books.map((book, index) => (
                        <div
                          key={index}
                          className="flex gap-3 p-4 bg-gray-50 rounded-lg"
                        >
                          <img
                            src={book.image}
                            alt={book.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-[#0A0B1E] text-sm mb-1">
                              {book.title}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">
                              {book.author}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex text-yellow-400 text-sm">
                                {"★".repeat(Math.floor(book.rating))}
                              </div>
                              <span className="text-gray-500 text-sm">
                                {book.rating}
                              </span>
                            </div>
                            <a
                              href={book.affiliateLink}
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
                  </div>

                  {/* Summary */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-[#0A0B1E] mb-3">
                      AI-Generated Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {result.summary}
                    </p>
                  </div>

                  {/* Key Insights */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#0A0B1E] mb-3">
                      Key Insights
                    </h3>
                    <ul className="space-y-2">
                      {result.keyInsights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-[#FFFD63] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[#0A0B1E] text-sm font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "saved" && (
            <div className="space-y-8">
              {mockSearchResults
                .filter((r) => r.saved)
                .map((result) => (
                  <div
                    key={result.id}
                    className="bg-white rounded-xl border border-gray-200 p-8"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-[#0A0B1E] mb-2">
                          {result.topic}
                        </h2>
                        <p className="text-gray-600">
                          Saved from{" "}
                          {new Date(result.searchDate).toLocaleDateString()}
                        </p>
                      </div>
                      <button className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-sm font-medium">
                        Remove
                      </button>
                    </div>
                    <p className="text-gray-700 mb-4">{result.summary}</p>
                    <div className="flex gap-2">
                      <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">
                        View Full Summary
                      </button>
                      <button className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-sm font-medium">
                        Export PDF
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-4">
              {mockSearchResults.map((result) => (
                <div
                  key={result.id}
                  className="bg-white rounded-lg border border-gray-200 p-6"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-[#0A0B1E] mb-1">
                        {result.topic}
                      </h3>
                      <p className="text-gray-600 text-sm">
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
                      <button className="text-gray-400 hover:text-gray-600">
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
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {mockSearchResults.length === 0 && (
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#0A0B1E] mb-4">
            No searches yet
          </h2>
          <p className="text-gray-600 mb-6">
            Start generating AI-powered book summaries to see your results here.
          </p>
          <Link
            to="/generate"
            className="inline-block bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Generate Your First Summary
          </Link>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

interface SearchResult {
  id: string;
  title: string;
  author: string;
  cover: string;
  rating: number;
  relevanceScore: number;
  chapterTitle: string;
  pageRange: string;
  whyRelevant: string;
  keyTopics: string[];
  description: string;
  amazonLink: string;
  price: string;
}

export default function SearchDemo() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchStage, setSearchStage] = useState(0);

  const searchStages = [
    "🔍 Scanning 2.5 million books...",
    "📖 Analyzing chapter contents...",
    "🎯 Identifying relevant pages...",
    "⭐ Scoring chapter relevance...",
    "✨ Preparing your chapter matches...",
  ];

  const mockSearchResults: Record<string, SearchResult[]> = {
    leadership: [
      {
        id: "1",
        title: "Good to Great",
        author: "Jim Collins",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/0066620996.01.L.jpg",
        rating: 4.8,
        relevanceScore: 98,
        chapterTitle: "Level 5 Leadership",
        pageRange: "Pages 17-40",
        whyRelevant:
          "Directly addresses the characteristics and behaviors that define exceptional leadership",
        keyTopics: [
          "Level 5 Leadership",
          "Hedgehog Concept",
          "Culture of Discipline",
        ],
        description:
          "This chapter reveals what makes companies transition from good to great, focusing on the specific leadership qualities that build enduring excellence.",
        amazonLink: "https://amazon.com/dp/0066620996?tag=summifyai-20",
        price: "$16.99",
      },
      {
        id: "2",
        title: "The 7 Habits of Highly Effective People",
        author: "Stephen R. Covey",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/0743269519.01.L.jpg",
        rating: 4.7,
        relevanceScore: 96,
        chapterTitle: "Habit 1: Be Proactive",
        pageRange: "Pages 65-94",
        whyRelevant:
          "Explains how effective leaders take initiative and responsibility for their choices",
        keyTopics: [
          "Principle-Centered Leadership",
          "Character Ethics",
          "Personal Mastery",
        ],
        description:
          "This chapter introduces the foundation of effective leadership through proactive thinking and taking responsibility for outcomes.",
        amazonLink: "https://amazon.com/dp/0743269519?tag=summifyai-20",
        price: "$15.49",
      },
      {
        id: "3",
        title: "Leaders Eat Last",
        author: "Simon Sinek",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/1591845327.01.L.jpg",
        rating: 4.6,
        relevanceScore: 94,
        chapterTitle: "The Circle of Safety",
        pageRange: "Pages 61-78",
        whyRelevant:
          "Demonstrates how great leaders create environments where teams can thrive",
        keyTopics: ["Circle of Safety", "Servant Leadership", "Team Chemistry"],
        description:
          "This chapter explains the biological basis of leadership and why some teams pull together while others don't.",
        amazonLink: "https://amazon.com/dp/1591845327?tag=summifyai-20",
        price: "$17.99",
      },
      {
        id: "4",
        title: "Dare to Lead",
        author: "Brené Brown",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/0399592520.01.L.jpg",
        rating: 4.5,
        relevanceScore: 92,
        keyTopics: [
          "Vulnerability in Leadership",
          "Courage Building",
          "Shame Resilience",
        ],
        description:
          "Brave work, tough conversations, whole hearts. A new paradigm for leadership based on courage and vulnerability.",
        amazonLink: "https://amazon.com/dp/0399592520?tag=summifyai-20",
        price: "$18.99",
      },
      {
        id: "5",
        title: "The Leadership Challenge",
        author: "James Kouzes & Barry Posner",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/1119278965.01.L.jpg",
        rating: 4.4,
        relevanceScore: 90,
        keyTopics: ["Five Practices Model", "Credibility", "Inspiring Vision"],
        description:
          "How to make extraordinary things happen in organizations through exemplary leadership practices.",
        amazonLink: "https://amazon.com/dp/1119278965?tag=summifyai-20",
        price: "$24.99",
      },
    ],
    productivity: [
      {
        id: "6",
        title: "Deep Work",
        author: "Cal Newport",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/1455586692.01.L.jpg",
        rating: 4.9,
        relevanceScore: 98,
        keyTopics: [
          "Focus Training",
          "Cognitive Enhancement",
          "Digital Minimalism",
        ],
        description:
          "Rules for focused success in a distracted world. The ability to concentrate without distraction on cognitively demanding tasks.",
        amazonLink: "https://amazon.com/dp/1455586692?tag=summifyai-20",
        price: "$16.99",
      },
      {
        id: "7",
        title: "Atomic Habits",
        author: "James Clear",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/0735211299.01.L.jpg",
        rating: 4.8,
        relevanceScore: 96,
        keyTopics: ["Habit Formation", "Systems Thinking", "Identity Change"],
        description:
          "An easy & proven way to build good habits & break bad ones. Small changes that deliver remarkable results.",
        amazonLink: "https://amazon.com/dp/0735211299?tag=summifyai-20",
        price: "$18.00",
      },
      {
        id: "8",
        title: "Getting Things Done",
        author: "David Allen",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/0143126563.01.L.jpg",
        rating: 4.6,
        relevanceScore: 94,
        keyTopics: [
          "Workflow Management",
          "Stress-Free Productivity",
          "Mental Clarity",
        ],
        description:
          "The art of stress-free productivity with a complete system for capturing, organizing, and processing tasks.",
        amazonLink: "https://amazon.com/dp/0143126563?tag=summifyai-20",
        price: "$17.00",
      },
      {
        id: "9",
        title: "The Power of Now",
        author: "Eckhart Tolle",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/1577314808.01.L.jpg",
        rating: 4.5,
        relevanceScore: 88,
        keyTopics: [
          "Present Moment Awareness",
          "Mental Focus",
          "Spiritual Productivity",
        ],
        description:
          "A guide to spiritual enlightenment that teaches the importance of living in the present moment for peak performance.",
        amazonLink: "https://amazon.com/dp/1577314808?tag=summifyai-20",
        price: "$14.99",
      },
      {
        id: "10",
        title: "Essentialism",
        author: "Greg McKeown",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/0804137382.01.L.jpg",
        rating: 4.7,
        relevanceScore: 92,
        keyTopics: ["Priority Setting", "Decision Making", "Life Design"],
        description:
          "The disciplined pursuit of less. A systematic approach for determining where our highest point of contribution lies.",
        amazonLink: "https://amazon.com/dp/0804137382?tag=summifyai-20",
        price: "$16.50",
      },
    ],
  };

  const popularSearches = [
    "Leadership",
    "Productivity",
    "Innovation",
    "Personal Finance",
    "Marketing",
    "Entrepreneurship",
    "Mindfulness",
    "AI & Technology",
  ];

  const handleSearch = async (query: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    setSearchQuery(searchTerm);
    setIsSearching(true);
    setSearchStage(0);
    setSearchResults([]);

    // Simulate progressive search stages
    const stageInterval = setInterval(() => {
      setSearchStage((prev) => {
        if (prev >= searchStages.length - 1) {
          clearInterval(stageInterval);
          return prev;
        }
        return prev + 1;
      });
    }, 600);

    // Simulate search results
    setTimeout(() => {
      clearInterval(stageInterval);
      const results =
        mockSearchResults[searchTerm.toLowerCase()] ||
        mockSearchResults["leadership"];
      setSearchResults(results);
      setIsSearching(false);
      setSearchStage(0);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FFFD63] to-[#FFE066] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                  <span className="text-[#0A0B1E] font-bold text-xl">S</span>
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-[#0A0B1E] to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  SummifyAI
                </span>
              </Link>
              <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
                <Link
                  to="/"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/search-demo"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
                >
                  Search Demo
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-[#FFFD63] to-[#FFE066] text-[#0A0B1E] px-6 py-2 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                🔍 Smart Chapter Discovery
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-6">
                Experience how our AI searches through 2.5 million books to find
                the exact chapters and pages that answer your specific
                questions. See chapter relevance scoring, page number
                identification, and intelligent ranking in action.
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 max-w-2xl mx-auto">
                <p className="text-white/80 text-sm mb-2">
                  ✨ <strong>Demo Features:</strong>
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Real-time search simulation
                  </span>
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Relevance scoring
                  </span>
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Quality filtering
                  </span>
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Interactive results
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Try Our Intelligent Book Search
          </h2>

          <div className="max-w-3xl mx-auto">
            <div className="relative mb-6">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleSearch(searchQuery)
                }
                placeholder="Enter any topic you want to explore..."
                className="w-full px-6 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                disabled={isSearching}
              />
              <button
                onClick={() => handleSearch(searchQuery)}
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-indigo-600 hover:to-blue-500 disabled:from-gray-300 disabled:to-gray-400 text-white p-3 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {isSearching ? (
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-6 h-6"
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
                )}
              </button>
            </div>

            {/* Popular Searches */}
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                Try these popular topics:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((topic) => (
                  <button
                    key={topic}
                    onClick={() => handleSearch(topic)}
                    disabled={isSearching}
                    className="bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-300 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Search Process Animation */}
        {isSearching && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center mb-8 border border-gray-200 dark:border-gray-700">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <svg
                  className="w-12 h-12 text-white animate-spin"
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

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Searching for "{searchQuery}"
              </h3>

              <div className="space-y-4 mb-8">
                {searchStages.map((stage, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-center p-4 rounded-2xl transition-all duration-500 ${
                      index <= searchStage
                        ? "bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 text-green-800 dark:text-green-200"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {index <= searchStage && (
                      <svg
                        className="w-5 h-5 mr-3 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    <span className="font-medium">{stage}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6">
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  Our AI is analyzing millions of books, checking ratings,
                  reviews, and content relevance to find you the perfect
                  matches. This demo simulates our real search process!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && !isSearching && (
          <div className="space-y-6">
            {/* Results Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                🎯 Perfect Matches Found!
              </h2>
              <p className="text-white/90">
                Found {searchResults.length} highly relevant books on "
                {searchQuery}" with scores above 85%
              </p>
            </div>

            {/* Results Grid */}
            <div className="space-y-4">
              {searchResults.map((book, index) => (
                <div
                  key={book.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start space-x-6">
                    {/* Book Cover & Ranking */}
                    <div className="relative flex-shrink-0">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-24 h-32 object-cover rounded-xl shadow-md"
                      />
                      <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                        {book.relevanceScore}%
                      </div>
                    </div>

                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            {book.title}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mb-2">
                            by {book.author}
                          </p>

                          {/* Rating */}
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${i < Math.floor(book.rating) ? "text-yellow-400" : "text-gray-300"}`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                              {book.rating} stars
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                            {book.price}
                          </div>
                          <a
                            href={book.amazonLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gradient-to-r from-[#FFFD63] to-[#FFE066] hover:from-[#FFE066] hover:to-[#FFFD63] text-[#0A0B1E] px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            Buy on Amazon
                          </a>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                        {book.description}
                      </p>

                      {/* Key Topics */}
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                          Key Topics:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {book.keyTopics.map((topic, topicIndex) => (
                            <span
                              key={topicIndex}
                              className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg text-sm font-medium"
                            >
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-[#FFFD63] via-yellow-400 to-orange-400 rounded-3xl p-8 text-center">
              <h3 className="text-2xl font-bold text-[#0A0B1E] mb-4">
                Ready to Generate Your Summary?
              </h3>
              <p className="text-[#0A0B1E]/80 mb-6 text-lg">
                Now that you've seen how we find the perfect books, let's
                analyze them and create your comparative summary!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {user ? (
                  <Link
                    to={`/generate?topic=${encodeURIComponent(searchQuery)}`}
                    className="bg-[#0A0B1E] hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Generate Summary for "{searchQuery}"
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="bg-[#0A0B1E] hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Sign Up to Generate Summary
                  </Link>
                )}
                <Link
                  to="/"
                  className="bg-white/20 hover:bg-white/30 text-[#0A0B1E] px-8 py-4 rounded-2xl font-medium transition-all border border-[#0A0B1E]/20"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Demo Information */}
        {!isSearching && searchResults.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              🚀 How Our Smart Search Works
            </h3>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  AI-Powered Relevance
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Our AI analyzes book content, reviews, and metadata to score
                  relevance with 98% accuracy
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Quality Filtering
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Automatically filters by ratings, reviews, and publication
                  quality to ensure only the best books
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Instant Results
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Get perfectly ranked results in seconds, ready for comparative
                  analysis and summary generation
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

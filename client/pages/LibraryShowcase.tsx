import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

interface LibraryItem {
  id: string;
  topic: string;
  books: Array<{
    title: string;
    author: string;
    cover: string;
    amazonLink: string;
  }>;
  summary: string;
  createdAt: string;
  tags: string[];
  isPublic: boolean;
  views: number;
  likes: number;
  earnings: number;
}

interface ShareStats {
  totalShares: number;
  clickThrough: number;
  conversions: number;
  earnings: number;
}

export default function LibraryShowcase() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "library" | "earnings" | "sharing"
  >("library");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const libraryItems: LibraryItem[] = [
    {
      id: "1",
      topic: "Productivity & Focus",
      books: [
        {
          title: "Deep Work",
          author: "Cal Newport",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1455586692.01.L.jpg",
          amazonLink: "https://amazon.com/dp/1455586692?tag=summifyai-20",
        },
        {
          title: "Atomic Habits",
          author: "James Clear",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0735211299.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0735211299?tag=summifyai-20",
        },
      ],
      summary:
        "Deep work capability becomes increasingly valuable in our economy at the same time it becomes increasingly rare...",
      createdAt: "2024-01-15",
      tags: ["Productivity", "Focus", "Habits"],
      isPublic: true,
      views: 1247,
      likes: 89,
      earnings: 34.5,
    },
    {
      id: "2",
      topic: "Leadership Excellence",
      books: [
        {
          title: "Good to Great",
          author: "Jim Collins",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0066620996.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0066620996?tag=summifyai-20",
        },
        {
          title: "The 7 Habits",
          author: "Stephen Covey",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0743269519.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0743269519?tag=summifyai-20",
        },
      ],
      summary:
        "Level 5 leaders channel their ego needs away from themselves and into the larger goal...",
      createdAt: "2024-01-12",
      tags: ["Leadership", "Management", "Business"],
      isPublic: true,
      views: 2156,
      likes: 156,
      earnings: 67.8,
    },
    {
      id: "3",
      topic: "Innovation Strategies",
      books: [
        {
          title: "The Innovator's Dilemma",
          author: "Clayton Christensen",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0062060244.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0062060244?tag=summifyai-20",
        },
        {
          title: "Zero to One",
          author: "Peter Thiel",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0804139296.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0804139296?tag=summifyai-20",
        },
      ],
      summary:
        "Disruptive innovations typically start as simple, convenient alternatives...",
      createdAt: "2024-01-10",
      tags: ["Innovation", "Strategy", "Technology"],
      isPublic: false,
      views: 0,
      likes: 0,
      earnings: 0,
    },
    {
      id: "4",
      topic: "Financial Intelligence",
      books: [
        {
          title: "Rich Dad Poor Dad",
          author: "Robert Kiyosaki",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1612680194.01.L.jpg",
          amazonLink: "https://amazon.com/dp/1612680194?tag=summifyai-20",
        },
        {
          title: "The Intelligent Investor",
          author: "Benjamin Graham",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0060555661.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0060555661?tag=summifyai-20",
        },
      ],
      summary:
        "The rich don't work for money; they make money work for them...",
      createdAt: "2024-01-08",
      tags: ["Finance", "Investing", "Wealth"],
      isPublic: true,
      views: 892,
      likes: 67,
      earnings: 23.4,
    },
  ];

  const shareStats: ShareStats = {
    totalShares: 4,
    clickThrough: 4295,
    conversions: 312,
    earnings: 125.7,
  };

  const categories = [
    "All",
    "Productivity",
    "Leadership",
    "Innovation",
    "Finance",
    "Technology",
  ];

  const filteredItems =
    selectedCategory === "All"
      ? libraryItems
      : libraryItems.filter((item) =>
          item.tags.some((tag) =>
            tag.toLowerCase().includes(selectedCategory.toLowerCase()),
          ),
        );

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-pink-900">
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
                  to="/library-showcase"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
                >
                  Library Demo
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
          <div className="bg-gradient-to-r from-pink-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                📚 Personal Library & Sharing
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-6">
                Explore how SummifyAI creates your personal library of insights,
                enables sharing with friends, and helps you earn money through
                affiliate commissions. Build your influence while learning!
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 max-w-2xl mx-auto">
                <p className="text-white/80 text-sm mb-2">
                  ✨ <strong>Library Features:</strong>
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Organized summaries
                  </span>
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Social sharing
                  </span>
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Affiliate earnings
                  </span>
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Public/private control
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1">
            {[
              { id: "library", label: "📚 My Library", icon: "📚" },
              { id: "earnings", label: "💰 Earnings", icon: "💰" },
              { id: "sharing", label: "🚀 Sharing", icon: "🚀" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Library Tab */}
        {activeTab === "library" && (
          <div className="space-y-8">
            {/* Category Filter */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Filter by Category
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      selectedCategory === category
                        ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Library Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {item.topic}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {item.isPublic ? (
                        <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-lg text-xs font-medium">
                          Public
                        </span>
                      ) : (
                        <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg text-xs font-medium">
                          Private
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex -space-x-2 mb-4">
                    {item.books.map((book, index) => (
                      <img
                        key={index}
                        src={book.cover}
                        alt={book.title}
                        className="w-10 h-14 object-cover rounded-lg border-2 border-white dark:border-gray-800 shadow-md"
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                    {item.summary.substring(0, 120)}...
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-lg text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <span>
                      Created {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                    {item.isPublic && (
                      <div className="flex items-center space-x-3">
                        <span>👁️ {item.views}</span>
                        <span>❤️ {item.likes}</span>
                        <span className="text-green-600 dark:text-green-400 font-medium">
                          💰 ${item.earnings}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all">
                      View Summary
                    </button>
                    <button className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Earnings Tab */}
        {activeTab === "earnings" && (
          <div className="space-y-8">
            {/* Earnings Overview */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">
                  ${shareStats.earnings.toFixed(2)}
                </div>
                <div className="text-green-100">Total Earnings</div>
              </div>
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">
                  {shareStats.clickThrough}
                </div>
                <div className="text-blue-100">Total Clicks</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">
                  {shareStats.conversions}
                </div>
                <div className="text-purple-100">Conversions</div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">
                  {(
                    (shareStats.conversions / shareStats.clickThrough) *
                    100
                  ).toFixed(1)}
                  %
                </div>
                <div className="text-orange-100">Conversion Rate</div>
              </div>
            </div>

            {/* Top Earning Summaries */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🏆 Top Earning Summaries
              </h3>
              <div className="space-y-4">
                {libraryItems
                  .filter((item) => item.isPublic)
                  .sort((a, b) => b.earnings - a.earnings)
                  .map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {item.topic}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.views} views • {item.likes} likes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600 dark:text-green-400">
                          ${item.earnings}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          This month
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Earnings Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📊 Earnings Breakdown
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                    Revenue Sources
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Amazon Affiliate
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        $98.40
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Referral Bonuses
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        $27.30
                      </span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
                      <div className="flex justify-between items-center font-bold">
                        <span className="text-gray-900 dark:text-white">
                          Total
                        </span>
                        <span className="text-green-600 dark:text-green-400">
                          $125.70
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                    Performance Metrics
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Click-through Rate
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        7.3%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Avg. Earnings per Click
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        $0.029
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Monthly Growth
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        +24%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sharing Tab */}
        {activeTab === "sharing" && (
          <div className="space-y-8">
            {/* Sharing Overview */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🚀 Sharing Made Simple
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
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    One-Click Sharing
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Share summaries to social media, email, or direct links with
                    automatic affiliate tracking
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
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    Automatic Earnings
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Earn commissions when people buy books through your shared
                    links - no extra work required
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
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    Performance Analytics
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Track clicks, conversions, and earnings with detailed
                    analytics for each shared summary
                  </p>
                </div>
              </div>
            </div>

            {/* Sharing Examples */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📱 Sharing Options
              </h3>
              <div className="space-y-6">
                {/* Social Media Sharing */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                    Social Media Posts
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 dark:text-gray-300 italic">
                      "Just finished an amazing comparative analysis on
                      Leadership Excellence! 📚 The insights from Jim Collins,
                      Stephen Covey, and Simon Sinek are game-changing.
                      SummifyAI made it so easy to see the connections. Check it
                      out: [link] #Leadership #BookSummary #PersonalGrowth"
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                      Share on Twitter
                    </button>
                    <button className="bg-blue-800 text-white px-4 py-2 rounded-lg hover:bg-blue-900 transition-colors">
                      Share on LinkedIn
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                      Share on WhatsApp
                    </button>
                  </div>
                </div>

                {/* Email Sharing */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                    Email & Direct Share
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Subject: Amazing insights on Leadership Excellence
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Hi [Name], I thought you'd find this leadership analysis
                      really valuable. SummifyAI compared insights from multiple
                      books and the takeaways are incredible. Here's the link to
                      read the full summary: [personalized_link]
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                      Copy Link
                    </button>
                    <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                      Send Email
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Program */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-8 text-[#0A0B1E]">
              <h3 className="text-2xl font-bold mb-4">🎁 Referral Bonuses</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-bold text-lg mb-2">
                    Invite Friends & Earn More
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#0A0B1E] rounded-full mr-3"></span>
                      Friend signs up: You both get +1 free summary
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#0A0B1E] rounded-full mr-3"></span>
                      Friend upgrades to Premium: You get $5 bonus
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#0A0B1E] rounded-full mr-3"></span>
                      Ongoing commissions on their book purchases
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">$27.30</div>
                  <div className="text-[#0A0B1E]/80">
                    Total referral earnings this month
                  </div>
                  <button className="bg-[#0A0B1E] text-white px-6 py-2 rounded-xl font-bold mt-4 hover:bg-gray-800 transition-colors">
                    Get Your Referral Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#FFFD63] via-yellow-400 to-orange-400 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-[#0A0B1E] mb-4">
            Start Building Your Library Today
          </h3>
          <p className="text-[#0A0B1E]/80 mb-6 text-lg">
            Create beautiful summaries, share insights with friends, and earn
            money while building your personal knowledge library. Join thousands
            of readers already earning through SummifyAI!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link
                to="/generate"
                className="bg-[#0A0B1E] hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Create Your First Summary
              </Link>
            ) : (
              <Link
                to="/signup"
                className="bg-[#0A0B1E] hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Sign Up & Start Earning
              </Link>
            )}
            <Link
              to="/"
              className="bg-white/20 hover:bg-white/30 text-[#0A0B1E] px-8 py-4 rounded-2xl font-medium transition-all border border-[#0A0B1E]/20"
            >
              Explore More Features
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

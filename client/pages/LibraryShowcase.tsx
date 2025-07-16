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
    chapterTitle: string;
    pageRange: string;
    cover: string;
    amazonLink: string;
  }>;
  summary: string;
  createdAt: string;
  tags: string[];
  isPublic: boolean;
  views: number;
  likes: number;
}

export default function LibraryShowcase() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "library" | "insights" | "sharing"
  >("library");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const libraryItems: LibraryItem[] = [
    {
      id: "1",
      topic: "Productivity & Deep Focus",
      books: [
        {
          title: "Deep Work",
          author: "Cal Newport",
          chapterTitle: "Chapter 1: Deep Work is Valuable",
          pageRange: "Pages 25-47",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1455586692.01.L.jpg",
          amazonLink: "https://amazon.com/dp/1455586692?tag=summifyai-20",
        },
        {
          title: "Atomic Habits",
          author: "James Clear",
          chapterTitle: "Chapter 3: How to Build Better Habits",
          pageRange: "Pages 82-106",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0735211299.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0735211299?tag=summifyai-20",
        },
      ],
      summary:
        "Deep work capability becomes increasingly valuable in our economy at the same time it becomes increasingly rare. These chapters provide frameworks for building sustained focus and creating systems that support deep, meaningful work.",
      createdAt: "2024-01-15",
      tags: ["Productivity", "Focus", "Habits"],
      isPublic: true,
      views: 1247,
      likes: 89,
    },
    {
      id: "2",
      topic: "Leadership Excellence",
      books: [
        {
          title: "Good to Great",
          author: "Jim Collins",
          chapterTitle: "Chapter 2: Level 5 Leadership",
          pageRange: "Pages 17-40",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0066620996.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0066620996?tag=summifyai-20",
        },
        {
          title: "The 7 Habits",
          author: "Stephen Covey",
          chapterTitle: "Habit 5: Seek First to Understand",
          pageRange: "Pages 235-260",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0743269519.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0743269519?tag=summifyai-20",
        },
      ],
      summary:
        "Level 5 leaders channel their ego needs away from themselves and into the larger goal. These chapters define what separates great leaders from good ones and provide actionable frameworks for developing leadership capabilities.",
      createdAt: "2024-01-12",
      tags: ["Leadership", "Management", "Business"],
      isPublic: true,
      views: 2156,
      likes: 156,
    },
    {
      id: "3",
      topic: "Innovation Strategies",
      books: [
        {
          title: "The Innovator's Dilemma",
          author: "Clayton Christensen",
          chapterTitle: "Chapter 1: How Can Great Firms Fail?",
          pageRange: "Pages 3-28",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0062060244.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0062060244?tag=summifyai-20",
        },
        {
          title: "Zero to One",
          author: "Peter Thiel",
          chapterTitle: "Chapter 2: Party Like It's 1999",
          pageRange: "Pages 9-26",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0804139296.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0804139296?tag=summifyai-20",
        },
      ],
      summary:
        "Disruptive innovations typically start as simple, convenient alternatives to existing solutions. These chapters explore why established companies often fail to see the threat of disruptive technologies.",
      createdAt: "2024-01-10",
      tags: ["Innovation", "Strategy", "Technology"],
      isPublic: false,
      views: 0,
      likes: 0,
    },
    {
      id: "4",
      topic: "Financial Intelligence",
      books: [
        {
          title: "Rich Dad Poor Dad",
          author: "Robert Kiyosaki",
          chapterTitle: "Chapter 1: Rich Dad, Poor Dad",
          pageRange: "Pages 15-32",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1612680194.01.L.jpg",
          amazonLink: "https://amazon.com/dp/1612680194?tag=summifyai-20",
        },
        {
          title: "The Intelligent Investor",
          author: "Benjamin Graham",
          chapterTitle: "Chapter 8: The Investor and Market Fluctuations",
          pageRange: "Pages 188-212",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0060555661.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0060555661?tag=summifyai-20",
        },
      ],
      summary:
        "The rich don't work for money; they make money work for them. These chapters establish fundamental principles for building wealth and understanding market psychology.",
      createdAt: "2024-01-08",
      tags: ["Finance", "Investing", "Wealth"],
      isPublic: true,
      views: 892,
      likes: 67,
    },
  ];

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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-[#FFFD63] dark:bg-gray-900 relative z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0A0B1E] dark:bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <span className="text-[#FFFD63] dark:text-[#0A0B1E] font-bold text-lg">
                  S
                </span>
              </div>
              <span className="text-xl font-bold text-[#0A0B1E] dark:text-white">
                SummifyAI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
              >
                Home
              </Link>
              <ThemeToggle />
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#FFFD63] via-yellow-300 to-orange-300 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-[#0A0B1E] mb-6">
            📚 Personal Chapter Library
          </h1>
          <p className="text-xl text-[#0A0B1E]/80 max-w-3xl mx-auto mb-8 leading-relaxed">
            Organize your chapter discoveries, build your personal knowledge
            base, and share precise insights with others. Never lose track of
            valuable content again.
          </p>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-[#0A0B1E]/80 text-sm mb-4">
              ✨ <strong>Library Features:</strong>
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium">
                Chapter Collections
              </span>
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-medium">
                Smart Organization
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg font-medium">
                Easy Sharing
              </span>
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-lg font-medium">
                Search & Filter
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-2 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex space-x-1">
            {[
              { id: "library", label: "📚 My Library", icon: "📚" },
              { id: "insights", label: "🧠 Insights", icon: "🧠" },
              { id: "sharing", label: "🔗 Sharing", icon: "🔗" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#FFFD63] text-[#0A0B1E] shadow-lg"
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
                        ? "bg-[#FFFD63] text-[#0A0B1E] shadow-lg"
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

                  {/* Book Chapters */}
                  <div className="space-y-3 mb-4">
                    {item.books.map((book, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
                      >
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-8 h-12 object-cover rounded shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                            {book.title}
                          </h4>
                          <p className="text-blue-600 dark:text-blue-400 text-xs font-medium">
                            {book.chapterTitle}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            {book.pageRange}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 leading-relaxed">
                    {item.summary.substring(0, 150)}...
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {item.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-lg text-xs"
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
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-xl font-medium transition-colors">
                      View Details
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

        {/* Insights Tab */}
        {activeTab === "insights" && (
          <div className="space-y-8">
            {/* Reading Statistics */}
            <div className="grid md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">
                  {libraryItems.length}
                </div>
                <div className="text-blue-100">Total Discoveries</div>
              </div>
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">
                  {libraryItems.reduce(
                    (sum, item) => sum + item.books.length,
                    0,
                  )}
                </div>
                <div className="text-green-100">Chapters Found</div>
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">
                  {libraryItems.reduce((sum, item) => sum + item.views, 0)}
                </div>
                <div className="text-purple-100">Total Views</div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-6 text-white">
                <div className="text-3xl font-bold mb-2">
                  {Math.round(
                    libraryItems.reduce(
                      (sum, item) => sum + item.books.length,
                      0,
                    ) * 2.5,
                  )}
                  h
                </div>
                <div className="text-orange-100">Time Saved</div>
              </div>
            </div>

            {/* Popular Topics */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🏆 Most Popular Discoveries
              </h3>
              <div className="space-y-4">
                {libraryItems
                  .filter((item) => item.isPublic)
                  .sort((a, b) => b.views - a.views)
                  .map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 dark:text-white">
                            {item.topic}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.books.length} chapters •{" "}
                            {item.tags.join(", ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {item.views}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          views
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Reading Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📊 Learning Insights
              </h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                    Categories Explored
                  </h4>
                  <div className="space-y-3">
                    {Array.from(
                      new Set(libraryItems.flatMap((item) => item.tags)),
                    ).map((tag) => {
                      const count = libraryItems.filter((item) =>
                        item.tags.includes(tag),
                      ).length;
                      return (
                        <div
                          key={tag}
                          className="flex justify-between items-center"
                        >
                          <span className="text-gray-600 dark:text-gray-400">
                            {tag}
                          </span>
                          <span className="font-bold text-gray-900 dark:text-white">
                            {count} discoveries
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                    Usage Patterns
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Avg. Chapters per Discovery
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {(
                          libraryItems.reduce(
                            (sum, item) => sum + item.books.length,
                            0,
                          ) / libraryItems.length
                        ).toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Public vs Private
                      </span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {libraryItems.filter((item) => item.isPublic).length}:{" "}
                        {libraryItems.filter((item) => !item.isPublic).length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">
                        Total Reading Time Saved
                      </span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {Math.round(
                          libraryItems.reduce(
                            (sum, item) => sum + item.books.length,
                            0,
                          ) * 2.5,
                        )}{" "}
                        hours
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
                🔗 Share Your Discoveries
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
                    Share chapter discoveries to social media, email, or direct
                    links with one click
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
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  </div>
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    Intelligent Recommendations
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Help others find exactly what they need with targeted
                    chapter recommendations
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
                    Track Engagement
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    See how your shared discoveries help others with view counts
                    and feedback
                  </p>
                </div>
              </div>
            </div>

            {/* Sharing Examples */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📱 How to Share
              </h3>
              <div className="space-y-6">
                {/* Social Media Sharing */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                    Social Media Posts
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 dark:text-gray-300 italic">
                      "Just discovered amazing insights on Leadership
                      Excellence! 📚 Instead of reading entire books, I found
                      the exact chapters that matter. Check out SummifyAI's
                      chapter discovery: [link] #Leadership #Productivity
                      #BookSummary"
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

                {/* Direct Sharing */}
                <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-6">
                  <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                    Direct Recommendations
                  </h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Subject: Perfect chapters for your leadership development
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">
                      Hi [Name], I found some chapters that would be perfect for
                      your leadership goals. Instead of reading entire books,
                      check out these specific sections: [Chapter details]. This
                      saved me hours of reading time!
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
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#FFFD63] via-yellow-400 to-orange-400 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-[#0A0B1E] mb-4">
            Start Building Your Chapter Library Today
          </h3>
          <p className="text-[#0A0B1E]/80 mb-6 text-lg">
            Create organized chapter collections, share targeted insights with
            friends, and build your personal knowledge library. Join thousands
            who are learning more efficiently with precise chapter discovery!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {user ? (
              <Link
                to="/generate"
                className="bg-[#0A0B1E] hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Create Your First Discovery
              </Link>
            ) : (
              <Link
                to="/signup"
                className="bg-[#0A0B1E] hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Sign Up & Start Exploring
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

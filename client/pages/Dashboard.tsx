import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

interface Summary {
  id: string;
  topic: string;
  createdAt: string;
  books: Array<{
    title: string;
    author: string;
    cover: string;
    amazonLink: string;
  }>;
  summary: string;
  quotes: string[];
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Mock data - replace with real data
  const recentSummaries: Summary[] = [
    {
      id: "1",
      topic: "Leadership Excellence",
      createdAt: "2024-01-15T10:30:00Z",
      books: [
        {
          title: "Good to Great",
          author: "Jim Collins",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0066620996.01.L.jpg",
          amazonLink: "#",
        },
        {
          title: "The 7 Habits of Highly Effective People",
          author: "Stephen Covey",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0743269519.01.L.jpg",
          amazonLink: "#",
        },
        {
          title: "Leaders Eat Last",
          author: "Simon Sinek",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1591845327.01.L.jpg",
          amazonLink: "#",
        },
      ],
      summary:
        "Leadership excellence emerges from the intersection of humility and determination...",
      quotes: [
        "Level 5 leaders channel their ego needs away from themselves...",
        "Begin with the end in mind.",
        "Great leaders sacrifice their own interests for the good of those in their care.",
      ],
    },
    {
      id: "2",
      topic: "Productivity & Focus",
      createdAt: "2024-01-12T14:20:00Z",
      books: [
        {
          title: "Deep Work",
          author: "Cal Newport",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1455586692.01.L.jpg",
          amazonLink: "#",
        },
      ],
      summary:
        "Deep work represents the ability to focus without distraction on cognitively demanding tasks...",
      quotes: [
        "Human beings, it seems, are at their best when immersed deeply in something challenging.",
      ],
    },
  ];

  const affiliateEarnings = {
    thisMonth: 247.85,
    total: 1568.4,
    clicks: 142,
    conversions: 18,
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              className="w-10 h-10 text-white"
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please sign in to access your premium dashboard
          </p>
          <Link
            to="/signin"
            className="bg-gradient-to-r from-[#FFFD63] to-[#FFE066] hover:from-[#FFE066] hover:to-[#FFFD63] text-[#0A0B1E] px-8 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Premium Navigation */}
      <nav className="bg-[#FFFD63] dark:bg-gray-900 relative z-50">
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
                  to="/dashboard"
                  className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
                >
                  Dashboard
                </Link>
                <Link
                  to="/generate"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Generate
                </Link>
                <Link
                  to="/results"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Library
                </Link>
                <Link
                  to="/support"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Support
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />

              {/* Premium User Profile */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-2 hover:shadow-lg transition-all"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.tier} Member
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    <div className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] p-6 text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-white/80 text-sm">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-gray-700 dark:text-gray-300">
                          Settings
                        </span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
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
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-white/80 text-lg">
                Ready to discover exact chapters and pages? Let's find precisely
                what you need to learn.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/generate"
                  className="bg-[#FFFD63] hover:bg-[#FFE066] text-[#0A0B1E] px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Find New Chapters
                </Link>
                <Link
                  to="/results"
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-medium transition-all border border-white/30 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  View Library
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Summaries Generated */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Searches
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user.queriesUsed}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {user.tier === "premium"
                    ? "Unlimited"
                    : `${user.queriesLimit - user.queriesUsed} remaining`}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
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
            </div>
          </div>

          {/* Monthly Earnings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  This Month
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${affiliateEarnings.thisMonth}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  +{((affiliateEarnings.thisMonth / 200) * 100).toFixed(0)}% vs
                  last month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400"
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
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Earned
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ${affiliateEarnings.total}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {affiliateEarnings.conversions} conversions
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600 dark:text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Click Rate
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {(
                    (affiliateEarnings.conversions / affiliateEarnings.clicks) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {affiliateEarnings.clicks} total clicks
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Summaries */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Chapter Discoveries
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your latest chapter findings and targeted insights
                </p>
              </div>
              <Link
                to="/results"
                className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                View All
              </Link>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentSummaries.length > 0 ? (
              recentSummaries.map((summary) => (
                <div
                  key={summary.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-2xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {summary.topic.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {summary.topic}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {new Date(summary.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}{" "}
                          • {summary.books.length} books analyzed
                        </p>
                        <div className="flex -space-x-2">
                          {summary.books.slice(0, 3).map((book, index) => (
                            <img
                              key={index}
                              src={book.cover}
                              alt={book.title}
                              className="w-8 h-10 rounded border-2 border-white dark:border-gray-800 object-cover"
                            />
                          ))}
                          {summary.books.length > 3 && (
                            <div className="w-8 h-10 bg-gray-200 dark:bg-gray-600 rounded border-2 border-white dark:border-gray-800 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                +{summary.books.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/results/${summary.id}`}
                        className="bg-[#FFFD63] hover:bg-[#FFE066] text-[#0A0B1E] px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        View Summary
                      </Link>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-white"
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
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Ready to start your journey?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Generate your first book summary and unlock the power of
                  comparative analysis. Discover insights from multiple
                  perspectives in minutes.
                </p>
                <Link
                  to="/generate"
                  className="bg-gradient-to-r from-[#FFFD63] to-[#FFE066] hover:from-[#FFE066] hover:to-[#FFFD63] text-[#0A0B1E] px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Generate Your First Summary
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

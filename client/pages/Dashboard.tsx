import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchStats, setSearchStats] = useState({
    totalSearches: 0,
    thisMonth: 0,
    lastSearch: null,
    favoriteTopics: ["Leadership", "Productivity", "Strategy"],
  });

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFFD63] via-[#FFFD63]/90 to-[#FFFD63]/80 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 rounded-3xl p-12 shadow-2xl border border-gray-200 dark:border-gray-700 max-w-md mx-4">
          <div className="w-16 h-16 bg-[#FFFD63] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-[#0A0B1E] font-bold text-2xl">S</span>
          </div>
          <h1 className="text-3xl font-bold text-[#0A0B1E] dark:text-white mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please sign in to access your dashboard and start discovering exact
            chapters from thousands of books.
          </p>
          <Link
            to="/signin"
            className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  const userDisplayName =
    user.firstName && user.lastName
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || "there";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#FFFD63]/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Welcome Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-[#FFFD63] to-[#FFFD63]/90 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 md:p-12 text-[#0A0B1E] dark:text-white relative overflow-hidden shadow-2xl">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 dark:bg-white/5 rounded-full -translate-y-48 translate-x-48"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0A0B1E]/10 dark:bg-white/5 rounded-full translate-y-32 -translate-x-32"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#0A0B1E] dark:bg-[#FFFD63] rounded-2xl flex items-center justify-center">
                  <span className="text-[#FFFD63] dark:text-[#0A0B1E] font-bold text-2xl">
                    {user.firstName?.[0]?.toUpperCase() || "U"}
                  </span>
                </div>
                <div>
                  <h1 className="text-4xl md:text-5xl font-black mb-2">
                    Welcome back, {userDisplayName}! 👋
                  </h1>
                  <p className="text-[#0A0B1E]/80 dark:text-gray-300 text-xl">
                    Ready to discover exact chapters and targeted insights?
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  to="/generate"
                  className="group bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] dark:bg-[#FFFD63] dark:hover:bg-[#FFFD63]/90 dark:text-[#0A0B1E] px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-3"
                >
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
                  Start New Search
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
                <Link
                  to="/results"
                  className="bg-white/20 dark:bg-gray-900/50 backdrop-blur-sm border border-[#0A0B1E]/20 dark:border-white/20 hover:bg-white/30 dark:hover:bg-gray-900/70 text-[#0A0B1E] dark:text-white px-8 py-4 rounded-2xl font-medium transition-all flex items-center gap-3"
                >
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Browse History
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Searches Used
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {user?.searchCount || 0}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    / {user?.monthlySearchLimit ? user.monthlySearchLimit : "∞"}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  this month
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-white"
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
            </div>
          </div>

          <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Plan Type
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white capitalize">
                  {user?.planType || "Free"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  subscription
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Next Reset
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.searchCountResetDate
                    ? new Date(user.searchCountResetDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        },
                      )
                    : "N/A"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  search limit reset
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                  Member Since
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  join date
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg
                  className="w-7 h-7 text-white"
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
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Main Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-[#0A0B1E]"
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
              Quick Actions
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <Link
                to="/generate"
                className="group p-6 border-2 border-gray-200 dark:border-gray-600 rounded-2xl hover:border-[#FFFD63] dark:hover:border-[#FFFD63] transition-all hover:bg-[#FFFD63]/5 dark:hover:bg-[#FFFD63]/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                      Search Chapters
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Find exact chapters from any topic across thousands of
                      books
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-[#FFFD63] group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </Link>

              <Link
                to="/results"
                className="group p-6 border-2 border-gray-200 dark:border-gray-600 rounded-2xl hover:border-[#FFFD63] dark:hover:border-[#FFFD63] transition-all hover:bg-[#FFFD63]/5 dark:hover:bg-[#FFFD63]/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6 text-white"
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
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                      Browse History
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Review your previous searches and discovered insights
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-[#FFFD63] group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </Link>

              <Link
                to="/settings"
                className="group p-6 border-2 border-gray-200 dark:border-gray-600 rounded-2xl hover:border-[#FFFD63] dark:hover:border-[#FFFD63] transition-all hover:bg-[#FFFD63]/5 dark:hover:bg-[#FFFD63]/5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg
                      className="w-6 h-6 text-white"
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
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-1">
                      Account Settings
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Manage your preferences and account details
                    </p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-[#FFFD63] group-hover:translate-x-1 transition-all"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity & Tips */}
          <div className="space-y-8">
            {/* Feature Highlights */}
            <div className="bg-gradient-to-br from-[#FFFD63]/10 to-[#FFFD63]/5 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 border border-[#FFFD63]/20 dark:border-gray-600">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-[#0A0B1E]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                Pro Tips
              </h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#FFFD63] rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      Use specific topics
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Instead of "leadership," try "emotional intelligence in
                      leadership"
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#FFFD63] rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      Combine concepts
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Search for "time management for entrepreneurs" for
                      targeted results
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-[#FFFD63] rounded-full mt-2"></div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">
                      Save your favorites
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Bookmark chapters you want to reference later
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Your Activity
              </h3>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600 dark:text-gray-400">
                      Monthly Usage
                    </span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {user?.searchCount || 0} /{" "}
                      {user?.monthlySearchLimit || "∞"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-[#FFFD63] to-[#FFFD63]/80 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: user?.monthlySearchLimit
                          ? `${Math.min(((user?.searchCount || 0) / user.monthlySearchLimit) * 100, 100)}%`
                          : "0%",
                      }}
                    ></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Plan Benefits
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {user?.monthlySearchLimit || "Unlimited"} searches per
                        month
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        AI chapter analysis
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-green-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        Search history
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

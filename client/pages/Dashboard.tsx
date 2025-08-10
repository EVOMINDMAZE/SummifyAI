import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please sign in to access your dashboard.
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-[#FFFD63] dark:bg-gray-800 rounded-3xl p-8 text-[#0A0B1E] dark:text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user.firstName}! 👋
              </h1>
              <p className="text-[#0A0B1E]/80 dark:text-gray-300 text-lg">
                Ready to discover exact chapters and pages? Let's find precisely
                what you need to learn.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/generate"
                  className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  🚀 Search Chapters
                </Link>
                <Link
                  to="/search-history"
                  className="bg-transparent border-2 border-[#0A0B1E]/30 dark:border-white/30 hover:border-[#0A0B1E]/50 dark:hover:border-white/50 text-[#0A0B1E] dark:text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  📚 Search History
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Searches Used
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.searchCount || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {user?.monthlySearchLimit
                    ? `of ${user.monthlySearchLimit}`
                    : "unlimited"}{" "}
                  this month
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400 text-2xl">
                  📊
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Plan Type
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                  {user?.planType || "Free"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Current subscription
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                <span className="text-green-600 dark:text-green-400 text-2xl">
                  📋
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Search Reset
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.searchCountResetDate
                    ? new Date(user.searchCountResetDate).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Next reset date
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-2xl">
                  📅
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Member Since
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  Account created
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-xl flex items-center justify-center">
                <span className="text-yellow-600 dark:text-yellow-400 text-2xl">
                  🎯
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/generate"
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
            >
              <div className="text-2xl mb-2">🚀</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Search Chapters
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Find exact chapters from any topic
              </p>
            </Link>

            <Link
              to="/search-history"
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
            >
              <div className="text-2xl mb-2">📚</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Search History
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View your previous searches
              </p>
            </Link>

            <Link
              to="/settings"
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
            >
              <div className="text-2xl mb-2">⚙️</div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Settings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your account preferences
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

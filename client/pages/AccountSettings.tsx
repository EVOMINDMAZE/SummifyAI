import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function AccountSettings() {
  const { user, useCredits, shareContent } = useAuth();
  const isAuthenticated = !!user;
  const [activeTab, setActiveTab] = useState<
    "profile" | "subscription" | "preferences" | "billing"
  >("profile");

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
          <h1 className="text-2xl font-bold text-[#0A0B1E] mb-4">
            Access Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access your account settings.
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
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <span className="text-[#0A0B1E] font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-[#0A0B1E]">
                SummifyAI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-[#0A0B1E] font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/generate"
                className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Generate
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#FFFD63] rounded-xl flex items-center justify-center">
              <span className="text-[#0A0B1E] font-bold text-2xl">
                {user?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#0A0B1E] mb-2">
                Account Settings
              </h1>
              <p className="text-gray-600">
                Manage your profile, subscription, and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-[#FFFD63] text-[#0A0B1E]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "subscription"
                  ? "border-[#FFFD63] text-[#0A0B1E]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Subscription
            </button>
            <button
              onClick={() => setActiveTab("preferences")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "preferences"
                  ? "border-[#FFFD63] text-[#0A0B1E]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Preferences
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === "billing"
                  ? "border-[#FFFD63] text-[#0A0B1E]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Billing
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="pb-12">
          {activeTab === "profile" && (
            <div className="space-y-8">
              {/* Profile Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[#0A0B1E] mb-6">
                  Profile Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      defaultValue={user?.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      defaultValue="@johnsmith"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us about yourself..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-6 py-2 rounded-lg font-medium transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>

              {/* Account Security */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[#0A0B1E] mb-6">
                  Account Security
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-[#0A0B1E]">Password</h3>
                      <p className="text-sm text-gray-600">
                        Last changed 3 months ago
                      </p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      Change Password
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-[#0A0B1E]">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-gray-600">
                        Add an extra layer of security
                      </p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      Enable 2FA
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h3 className="font-medium text-[#0A0B1E]">
                        Login Sessions
                      </h3>
                      <p className="text-sm text-gray-600">
                        Manage your active sessions
                      </p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">
                      View Sessions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "subscription" && (
            <div className="space-y-8">
              {/* Current Plan */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[#0A0B1E] mb-6">
                  Current Plan
                </h2>
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#FFFD63] to-yellow-200 rounded-xl">
                  <div>
                    <h3 className="text-2xl font-bold text-[#0A0B1E] mb-2">
                      {user?.tier === "premium" ? "Premium Plan" : "Free Plan"}
                    </h3>
                    <p className="text-[#0A0B1E] opacity-80">
                      {user?.tier === "premium"
                        ? "$9.99/month • Unlimited summaries"
                        : "3 summaries per month"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-[#0A0B1E]">
                      {user?.queriesUsed} /{" "}
                      {user?.tier === "premium" ? "∞" : user?.queryLimit}
                    </div>
                    <div className="text-sm text-[#0A0B1E] opacity-80">
                      Searches this month
                    </div>
                  </div>
                </div>

                {user?.tier === "free" && (
                  <div className="mt-6">
                    <Link
                      to="/pricing"
                      className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Upgrade to Premium
                    </Link>
                  </div>
                )}
              </div>

              {/* Usage Statistics */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[#0A0B1E] mb-6">
                  Usage Statistics
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {user?.queriesUsed || 0}
                    </div>
                    <div className="text-sm text-blue-800">
                      Summaries Generated
                    </div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      24
                    </div>
                    <div className="text-sm text-green-800">PDFs Exported</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      156
                    </div>
                    <div className="text-sm text-purple-800">Shares</div>
                  </div>
                </div>
              </div>

              {/* Credit System */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[#0A0B1E] mb-6">
                  SummifyAI Credits
                </h2>
                <div className="flex items-center justify-between p-6 bg-green-50 border border-green-200 rounded-xl mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-green-800 mb-1">
                      Available Credits
                    </h3>
                    <p className="text-green-700">
                      Earn credits by sharing summaries and referring friends
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    {user?.credits || 0}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Share a summary</span>
                    <span className="font-medium text-[#0A0B1E]">
                      +1 Credit
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Friend signs up</span>
                    <span className="font-medium text-[#0A0B1E]">
                      +3 Credits
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Convert credit to search
                    </span>
                    <span className="font-medium text-[#0A0B1E]">
                      -2 Credits
                    </span>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      if (useCredits(2)) {
                        alert(
                          "Used 2 credits! You now have 1 additional search available.",
                        );
                        // In a real app, this would update the user's query limit
                      } else {
                        alert(
                          "Not enough credits! You need at least 2 credits.",
                        );
                      }
                    }}
                    disabled={(user?.credits || 0) < 2}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      (user?.credits || 0) >= 2
                        ? "bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E]"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    Use 2 Credits for 1 Search
                  </button>
                </div>
              </div>

              {/* Referral System */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[#0A0B1E] mb-6">
                  Refer Friends & Earn Credits
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-[#0A0B1E] mb-3">
                      Your Referral Code
                    </h3>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border">
                      <code className="flex-1 font-mono text-lg font-bold text-blue-600">
                        {user?.referralCode}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            user?.referralCode || "",
                          );
                          alert("Referral code copied to clipboard!");
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Share this code with friends to earn 3 credits when they
                      sign up!
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[#0A0B1E] mb-3">
                      Referral Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                        <span className="text-green-800 font-medium">
                          Friends Referred
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {user?.referralsCount || 0}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <span className="text-blue-800 font-medium">
                          Credits Earned
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          {(user?.referralsCount || 0) * 3}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    How it works:
                  </h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Share your referral code with friends</li>
                    <li>• They sign up using your code</li>
                    <li>• You both earn 3 credits immediately!</li>
                    <li>
                      • Use credits for additional searches when you hit your
                      limit
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-8">
              {/* Notification Preferences */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[#0A0B1E] mb-6">
                  Notification Preferences
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[#0A0B1E]">
                        Email Notifications
                      </h3>
                      <p className="text-sm text-gray-600">
                        Receive updates about your summaries and account
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[#0A0B1E]">
                        Weekly Summary Report
                      </h3>
                      <p className="text-sm text-gray-600">
                        Get a weekly report of your activity and performance
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[#0A0B1E]">
                        Marketing Emails
                      </h3>
                      <p className="text-sm text-gray-600">
                        Receive tips, feature updates, and special offers
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Display Preferences */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[#0A0B1E] mb-6">
                  Display Preferences
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <label className="flex items-center p-3 border-2 border-[#FFFD63] bg-yellow-50 rounded-lg cursor-pointer">
                        <input
                          type="radio"
                          name="theme"
                          value="light"
                          defaultChecked
                          className="sr-only"
                        />
                        <div className="text-center w-full">
                          <div className="w-8 h-8 bg-white border border-gray-300 rounded mx-auto mb-2"></div>
                          <span className="text-sm font-medium">Light</span>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                        <input
                          type="radio"
                          name="theme"
                          value="dark"
                          className="sr-only"
                        />
                        <div className="text-center w-full">
                          <div className="w-8 h-8 bg-gray-800 rounded mx-auto mb-2"></div>
                          <span className="text-sm font-medium">Dark</span>
                        </div>
                      </label>
                      <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-gray-300">
                        <input
                          type="radio"
                          name="theme"
                          value="auto"
                          className="sr-only"
                        />
                        <div className="text-center w-full">
                          <div className="w-8 h-8 bg-gradient-to-r from-white to-gray-800 rounded mx-auto mb-2"></div>
                          <span className="text-sm font-medium">Auto</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Default Summary Length
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent">
                      <option value="short">Short (150-200 words)</option>
                      <option value="medium" selected>
                        Medium (250-300 words)
                      </option>
                      <option value="long">Long (400-500 words)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="space-y-8">
              {/* Billing Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[#0A0B1E] mb-6">
                  Billing Information
                </h2>
                {user?.tier === "premium" ? (
                  <div>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4">
                      <div>
                        <h3 className="font-medium text-[#0A0B1E]">
                          Premium Plan
                        </h3>
                        <p className="text-sm text-gray-600">
                          Billed monthly • Next payment: Feb 20, 2024
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-[#0A0B1E]">$9.99</div>
                        <div className="text-sm text-gray-600">per month</div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium">
                        Update Payment Method
                      </button>
                      <button className="text-red-600 hover:text-red-700 px-4 py-2 rounded-lg font-medium">
                        Cancel Subscription
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
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
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-[#0A0B1E] mb-2">
                      No billing information
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You're currently on the free plan
                    </p>
                    <Link
                      to="/pricing"
                      className="inline-block bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Upgrade to Premium
                    </Link>
                  </div>
                )}
              </div>

              {/* Payment History */}
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <h2 className="text-xl font-bold text-[#0A0B1E] mb-6">
                  Payment History
                </h2>
                {user?.tier === "premium" ? (
                  <div className="space-y-3">
                    {[
                      {
                        date: "Jan 20, 2024",
                        amount: "$9.99",
                        status: "Paid",
                        method: "•••• 4567",
                      },
                      {
                        date: "Dec 20, 2023",
                        amount: "$9.99",
                        status: "Paid",
                        method: "•••• 4567",
                      },
                      {
                        date: "Nov 20, 2023",
                        amount: "$9.99",
                        status: "Paid",
                        method: "•••• 4567",
                      },
                    ].map((payment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 border border-gray-100 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-[#0A0B1E]">
                            Premium Plan
                          </div>
                          <div className="text-sm text-gray-600">
                            {payment.date} • {payment.method}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#0A0B1E]">
                            {payment.amount}
                          </div>
                          <div className="text-sm text-green-600">
                            {payment.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No payment history available
                  </div>
                )}
              </div>

              {/* Support */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-8">
                <h2 className="text-xl font-bold text-blue-800 mb-4">
                  Need Help?
                </h2>
                <p className="text-blue-700 mb-6">
                  {user?.tier === "premium"
                    ? "As a Premium member, you have access to priority support."
                    : "Need help with billing or have questions about upgrading?"}
                </p>
                <div className="flex gap-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
                    Contact Support
                  </button>
                  <button className="bg-white border border-blue-300 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium">
                    View Help Center
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

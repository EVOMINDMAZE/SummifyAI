import { useState } from "react";
import { Link } from "react-router-dom";

export default function Results() {
  const [activeTab, setActiveTab] = useState<
    "summaries" | "analytics" | "earnings"
  >("summaries");

  const mockSummaries = [
    {
      id: "1",
      topic: "Leadership",
      date: "2024-01-20",
      views: 245,
      shares: 18,
      affiliateClicks: 32,
      earnings: 24.67,
      books: 5,
      downloadCount: 12,
    },
    {
      id: "2",
      topic: "Productivity",
      date: "2024-01-18",
      views: 189,
      shares: 23,
      affiliateClicks: 41,
      earnings: 31.45,
      books: 5,
      downloadCount: 19,
    },
    {
      id: "3",
      topic: "Innovation",
      date: "2024-01-15",
      views: 167,
      shares: 15,
      affiliateClicks: 28,
      earnings: 18.92,
      books: 5,
      downloadCount: 8,
    },
    {
      id: "4",
      topic: "Marketing",
      date: "2024-01-12",
      views: 298,
      shares: 34,
      affiliateClicks: 67,
      earnings: 52.34,
      books: 5,
      downloadCount: 25,
    },
  ];

  const totalEarnings = mockSummaries.reduce((sum, s) => sum + s.earnings, 0);
  const totalViews = mockSummaries.reduce((sum, s) => sum + s.views, 0);
  const totalClicks = mockSummaries.reduce(
    (sum, s) => sum + s.affiliateClicks,
    0,
  );
  const conversionRate =
    totalClicks > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <span className="text-[#0A0B1E] font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-[#0A0B1E]">
                SummifyAI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-[#0A0B1E] font-medium"
              >
                Back to Home
              </Link>
              <Link
                to="/signup"
                className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-black text-[#0A0B1E] mb-6">
            Track Your Impact & Earnings
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            See how your summaries perform, track affiliate earnings, and
            understand your audience engagement with comprehensive analytics.
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {totalViews.toLocaleString()}
                </span>
              </div>
              <div className="text-gray-700 font-medium">Total Views</div>
              <div className="text-sm text-gray-500 mt-1">Last 30 days</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  ${totalEarnings.toFixed(2)}
                </span>
              </div>
              <div className="text-gray-700 font-medium">
                Affiliate Earnings
              </div>
              <div className="text-sm text-gray-500 mt-1">Last 30 days</div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
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
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-purple-600">
                  {totalClicks}
                </span>
              </div>
              <div className="text-gray-700 font-medium">Affiliate Clicks</div>
              <div className="text-sm text-gray-500 mt-1">
                {conversionRate}% conversion
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-orange-600">
                  {mockSummaries.length}
                </span>
              </div>
              <div className="text-gray-700 font-medium">Summaries Created</div>
              <div className="text-sm text-gray-500 mt-1">All time</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("summaries")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "summaries"
                    ? "border-[#FFFD63] text-[#0A0B1E]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Your Summaries
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "analytics"
                    ? "border-[#FFFD63] text-[#0A0B1E]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveTab("earnings")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "earnings"
                    ? "border-[#FFFD63] text-[#0A0B1E]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Earnings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "summaries" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#0A0B1E]">
                  Your Summaries
                </h2>
                <Link
                  to="/generate"
                  className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Create New Summary
                </Link>
              </div>

              <div className="grid gap-6">
                {mockSummaries.map((summary) => (
                  <div
                    key={summary.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-[#0A0B1E] mb-2">
                          {summary.topic}
                        </h3>
                        <p className="text-gray-600">
                          Created on{" "}
                          {new Date(summary.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-sm">
                          Share
                        </button>
                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-sm">
                          Download PDF
                        </button>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-bold text-lg text-blue-600">
                          {summary.views}
                        </div>
                        <div className="text-gray-600">Views</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-bold text-lg text-green-600">
                          {summary.affiliateClicks}
                        </div>
                        <div className="text-gray-600">Clicks</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-bold text-lg text-purple-600">
                          {summary.shares}
                        </div>
                        <div className="text-gray-600">Shares</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="font-bold text-lg text-orange-600">
                          ${summary.earnings.toFixed(2)}
                        </div>
                        <div className="text-gray-600">Earned</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-[#0A0B1E]">Analytics</h2>

              {/* Performance Chart Placeholder */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-[#0A0B1E] mb-4">
                  Views Over Time
                </h3>
                <div className="h-64 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <svg
                      className="w-16 h-16 mx-auto mb-4"
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
                    <p className="text-lg font-medium">Interactive Chart</p>
                    <p className="text-sm">
                      Track views, clicks, and engagement over time
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Topics */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-[#0A0B1E] mb-4">
                  Top Performing Topics
                </h3>
                <div className="space-y-4">
                  {mockSummaries
                    .sort((a, b) => b.views - a.views)
                    .map((summary, index) => (
                      <div
                        key={summary.id}
                        className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#FFFD63] rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-[#0A0B1E]">
                              {summary.topic}
                            </div>
                            <div className="text-sm text-gray-600">
                              {new Date(summary.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#0A0B1E]">
                            {summary.views} views
                          </div>
                          <div className="text-sm text-gray-600">
                            ${summary.earnings.toFixed(2)} earned
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "earnings" && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#0A0B1E]">
                  Affiliate Earnings
                </h2>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${totalEarnings.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total earnings</div>
                </div>
              </div>

              {/* Earnings Breakdown */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <h3 className="font-bold text-lg text-green-800 mb-2">
                    This Month
                  </h3>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    ${(totalEarnings * 0.6).toFixed(2)}
                  </div>
                  <div className="text-sm text-green-700">
                    +23% from last month
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="font-bold text-lg text-blue-800 mb-2">
                    Average Per Click
                  </h3>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    ${(totalEarnings / totalClicks).toFixed(2)}
                  </div>
                  <div className="text-sm text-blue-700">
                    {totalClicks} total clicks
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                  <h3 className="font-bold text-lg text-purple-800 mb-2">
                    Best Day
                  </h3>
                  <div className="text-3xl font-bold text-purple-600 mb-1">
                    $12.34
                  </div>
                  <div className="text-sm text-purple-700">
                    January 18, 2024
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <h3 className="font-bold text-lg text-[#0A0B1E] mb-4">
                  Payment Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-[#0A0B1E] mb-2">
                      Next Payout
                    </h4>
                    <p className="text-2xl font-bold text-green-600 mb-1">
                      ${(totalEarnings * 0.3).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Scheduled for February 1, 2024
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-[#0A0B1E] mb-2">
                      Payment Method
                    </h4>
                    <div className="flex items-center gap-2 mb-1">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M1.319 8.177v7.646A2.177 2.177 0 003.496 18h17.008a2.177 2.177 0 002.177-2.177V8.177zm0 0V8a2.177 2.177 0 012.177-2.177h17.008A2.177 2.177 0 0122.681 8v.177zM8.681 13.319h6.638" />
                      </svg>
                      <span className="font-medium">
                        PayPal ending in •••• 4567
                      </span>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Update payment method
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0A0B1E] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to start earning from your insights?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Create summaries, share knowledge, and earn affiliate commissions
            from every book recommendation.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-[#FFFD63] text-[#0A0B1E] px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors"
          >
            Start Earning Today
          </Link>
        </div>
      </div>
    </div>
  );
}

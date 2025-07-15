import { Link } from "react-router-dom";

export default function HowItWorks() {
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
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-black text-[#0A0B1E] mb-6">
            How SummifyAI Works
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Discover how our AI-powered system turns any topic into
            comprehensive book insights in just minutes.
          </p>
        </div>
      </div>

      {/* Step-by-Step Process */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="space-y-20">
            {/* Step 1 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <h2 className="text-3xl font-bold text-[#0A0B1E]">
                    Enter Your Topic
                  </h2>
                </div>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  Simply type any topic you're interested in learning about -
                  from "leadership" to "artificial intelligence" to "personal
                  finance." Our system is designed to handle broad topics as
                  well as specific niches.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Works with any topic or subject
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Supports multiple languages
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    No character limits
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl p-8 w-full max-w-md">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter a topic
                    </label>
                    <input
                      type="text"
                      value="Leadership"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      readOnly
                    />
                    <button className="w-full mt-4 bg-[#FFFD63] text-[#0A0B1E] py-3 rounded-lg font-semibold">
                      Generate Summary
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1 flex justify-center">
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-2xl p-8 w-full max-w-md">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="font-bold text-lg mb-4">
                      AI Search Results
                    </h3>
                    <div className="space-y-3">
                      {[
                        "Good to Great",
                        "The 7 Habits",
                        "Leaders Eat Last",
                        "First Things First",
                        "Dare to Lead",
                      ].map((book, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg"
                        >
                          <div className="w-8 h-10 bg-gray-300 rounded"></div>
                          <div className="flex-1">
                            <div className="font-medium text-sm">{book}</div>
                            <div className="text-xs text-gray-500">
                              Relevance: {95 - i * 2}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <h2 className="text-3xl font-bold text-[#0A0B1E]">
                    AI Finds Relevant Books
                  </h2>
                </div>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  Our advanced AI searches through millions of books across
                  multiple databases including Google Books, Amazon, and curated
                  academic sources to find the most relevant and highly-rated
                  books on your topic.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Searches 10+ million books
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Ranks by relevance and quality
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Filters for current and authoritative sources
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <h2 className="text-3xl font-bold text-[#0A0B1E]">
                    Generate Comparative Summary
                  </h2>
                </div>
                <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                  Our AI analyzes the top 5 books, extracts key insights,
                  identifies common themes and contrasting viewpoints, then
                  creates a comprehensive 300-word comparative summary with
                  actionable takeaways.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Identifies common themes across books
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Highlights contrasting viewpoints
                  </li>
                  <li className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Provides actionable insights
                  </li>
                </ul>
              </div>
              <div className="flex justify-center">
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-8 w-full max-w-md">
                  <div className="bg-white rounded-xl p-6 shadow-lg">
                    <h3 className="font-bold text-lg mb-4">Your Summary</h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-1">
                          Key Theme 1
                        </div>
                        <div className="text-xs text-gray-600">
                          Vision and goal setting
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-1">
                          Key Theme 2
                        </div>
                        <div className="text-xs text-gray-600">
                          Building effective teams
                        </div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium mb-1">
                          Contrasting View
                        </div>
                        <div className="text-xs text-gray-600">
                          Individual vs. team focus
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0A0B1E] mb-4">
              Advanced Features
            </h2>
            <p className="text-gray-600 text-lg">
              Everything you need for comprehensive book research
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "🎯",
                title: "Smart Topic Recognition",
                description:
                  "Our AI understands context and finds books that truly match your interests, not just keyword matches.",
              },
              {
                icon: "📊",
                title: "Quality Scoring",
                description:
                  "Books are ranked by review scores, citation counts, and author authority to ensure you get the best sources.",
              },
              {
                icon: "⚡",
                title: "Lightning Fast",
                description:
                  "Get your summary in under 30 seconds, or upgrade to Premium for 10-second priority processing.",
              },
              {
                icon: "🔗",
                title: "Amazon Integration",
                description:
                  "Direct purchase links with your affiliate tracking, so you can earn commissions on recommendations.",
              },
              {
                icon: "📝",
                title: "Key Quotes",
                description:
                  "5 powerful quotes from each book that capture the essence of the author's message.",
              },
              {
                icon: "💾",
                title: "Export Options",
                description:
                  "Save summaries as PDF, share via link, or integrate with your note-taking apps.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg text-[#0A0B1E] mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0A0B1E] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to start learning faster?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Try SummifyAI free and see how it transforms your research process.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-[#FFFD63] text-[#0A0B1E] px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Index() {
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (!user) {
      navigate("/signup");
      return;
    }

    navigate(`/generate?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-[#FFFD63] relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0A0B1E] rounded-lg flex items-center justify-center">
                <span className="text-[#FFFD63] font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-[#0A0B1E]">
                SummifyAI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-[#0A0B1E] hover:text-[#0A0B1E]/80 font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/generate"
                    className="text-[#0A0B1E] hover:text-[#0A0B1E]/80 font-medium"
                  >
                    Generate
                  </Link>
                  <Link
                    to="/results"
                    className="text-[#0A0B1E] hover:text-[#0A0B1E]/80 font-medium"
                  >
                    Results
                  </Link>
                  <Link
                    to="/generate"
                    className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    New Search
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/how-it-works"
                    className="text-[#0A0B1E] hover:text-[#0A0B1E]/80 font-medium"
                  >
                    How it Works
                  </Link>
                  <Link
                    to="/pricing"
                    className="text-[#0A0B1E] hover:text-[#0A0B1E]/80 font-medium"
                  >
                    Pricing
                  </Link>
                  <Link
                    to="/signin"
                    className="text-[#0A0B1E] hover:text-[#0A0B1E]/80 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-[#FFFD63] relative">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-32 -mb-1">
          <div className="text-center">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-black text-[#0A0B1E] leading-tight mb-8">
              <span className="-mt-0.5 inline-block">
                Get instant book summaries.
              </span>
              <br />
              <span className="text-[#0A0B1E]">Discover better insights.</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-[#0A0B1E]/80 max-w-3xl mx-auto mb-12 leading-relaxed">
              Enter any topic and get comparative insights from the top 5 books,
              complete with key quotes, Amazon affiliate links, and actionable
              takeaways—all powered by AI.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="flex items-center gap-3 bg-[#0A0B1E] text-white px-8 py-4 rounded-2xl font-medium hover:bg-[#0A0B1E]/90 transition-colors shadow-lg"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC04"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Sign up with Google
              </Link>
              <Link
                to="/signup"
                className="bg-white text-[#0A0B1E] px-8 py-4 rounded-2xl font-medium hover:bg-gray-50 transition-colors shadow-lg border border-gray-200"
              >
                Sign up for free
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="relative -mb-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-8 shadow-2xl border border-yellow-200">
              <div className="flex items-center justify-center">
                <button className="flex items-center gap-4 bg-white px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-shadow">
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-[#0A0B1E] font-bold text-xl">
                    Take a 2 min. tour
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white pt-32 pb-20">
        {/* Logo Section */}
        <div className="py-16 overflow-hidden">
          <div className="flex items-center justify-center gap-12 opacity-60">
            <span className="text-2xl font-bold text-gray-400">AMAZON</span>
            <span className="text-2xl font-bold text-gray-400">GOODREADS</span>
            <span className="text-2xl font-bold text-gray-400">PENGUIN</span>
            <span className="text-2xl font-bold text-gray-400">HARPER</span>
            <span className="text-2xl font-bold text-gray-400">MACMILLAN</span>
          </div>
        </div>

        {/* Large Quote */}
        <div className="max-w-5xl mx-auto px-6 pt-12 pb-20 text-center">
          <div className="relative">
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-[#FFFD63] rounded-full"></div>
            <h2 className="text-4xl md:text-5xl font-normal text-[#0A0B1E] leading-tight relative z-10">
              All your favorite books in one place. Stop reading everything
              separately. Start comparing insights effectively.
            </h2>
          </div>
        </div>

        {/* Process Sections */}
        <div className="max-w-7xl mx-auto px-6 space-y-32">
          {/* Search Section */}
          <div className="relative">
            <div className="absolute -top-12 left-0 transform -rotate-12">
              <h3 className="text-8xl font-black text-[#0A0B1E] opacity-20">
                Search.
              </h3>
            </div>
            <div className="bg-blue-100 rounded-3xl p-12 relative overflow-hidden">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h4 className="text-3xl font-bold text-[#0A0B1E] mb-6">
                    Find books that practically teach themselves
                  </h4>
                  <p className="text-lg text-[#0A0B1E]/70 mb-8 leading-relaxed">
                    Smart discovery leads to better outcomes. Enter any topic
                    and our AI searches through thousands of books to find the
                    most relevant ones with high-quality content.
                  </p>
                  <Link
                    to="/how-it-works"
                    className="bg-blue-200 hover:bg-blue-300 text-[#0A0B1E] px-6 py-3 rounded-xl font-medium transition-colors border-2 border-[#0A0B1E] inline-block"
                  >
                    Learn more
                  </Link>
                </div>
                <div className="flex justify-center">
                  <div className="w-80 h-80 bg-gradient-to-br from-blue-200 to-blue-300 rounded-2xl flex items-center justify-center border-2 border-dashed border-blue-400">
                    <div className="text-center text-blue-600">
                      <svg
                        className="w-16 h-16 mx-auto mb-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="font-medium text-lg">AI Topic Search</div>
                      <div className="text-sm mt-2">
                        Searching millions of books
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analyze Section */}
          <div className="relative">
            <div className="absolute -top-12 right-0 transform rotate-12">
              <h3 className="text-8xl font-black text-[#0A0B1E] opacity-20">
                Analyze.
              </h3>
            </div>
            <div className="bg-green-100 rounded-3xl p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 flex justify-center">
                  <div className="w-80 h-80 bg-gradient-to-br from-green-200 to-green-300 rounded-2xl flex items-center justify-center border-2 border-dashed border-green-400">
                    <div className="text-center text-green-600">
                      <svg
                        className="w-16 h-16 mx-auto mb-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="font-medium text-lg">AI Analysis</div>
                      <div className="text-sm mt-2">
                        Extracting insights and themes
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <h4 className="text-3xl font-bold text-[#0A0B1E] mb-6">
                    Compare different perspectives
                  </h4>
                  <p className="text-lg text-[#0A0B1E]/70 mb-8 leading-relaxed">
                    Say goodbye to surface-level summaries. Get deep insights.
                    AI analyzes multiple viewpoints, extracts key themes,
                    contrasting opinions, and synthesizes them into coherent
                    comparisons.
                  </p>
                  <Link
                    to="/insights-demo"
                    className="bg-green-200 hover:bg-green-300 text-[#0A0B1E] px-6 py-3 rounded-xl font-medium transition-colors border-2 border-[#0A0B1E] inline-block"
                  >
                    Show me the insights
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Section */}
          <div className="relative">
            <div className="absolute -top-12 left-0 transform -rotate-12">
              <h3 className="text-8xl font-black text-[#0A0B1E] opacity-20">
                Generate.
              </h3>
            </div>
            <div className="bg-orange-100 rounded-3xl p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h4 className="text-3xl font-bold text-[#0A0B1E] mb-6">
                    Get your perfect summary
                  </h4>
                  <p className="text-lg text-[#0A0B1E]/70 mb-8 leading-relaxed">
                    Summarize your learning and capture insights in seconds.
                    Access your 300-word comparative analysis, key quotes,
                    Amazon purchase links, and actionable takeaways—all from one
                    beautiful interface.
                  </p>
                  <Link
                    to={user ? "/results" : "/signin"}
                    className="bg-orange-200 hover:bg-orange-300 text-[#0A0B1E] px-6 py-3 rounded-xl font-medium transition-colors border-2 border-[#0A0B1E] inline-block"
                  >
                    {user ? "View Your Results" : "Sign in to see results"}
                  </Link>
                </div>
                <div className="flex justify-center">
                  <div className="w-80 h-80 bg-gradient-to-br from-orange-200 to-orange-300 rounded-2xl flex items-center justify-center border-2 border-dashed border-orange-400">
                    <div className="text-center text-orange-600">
                      <svg
                        className="w-16 h-16 mx-auto mb-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div className="font-medium text-lg">
                        Beautiful Summary
                      </div>
                      <div className="text-sm mt-2">
                        With quotes and affiliate links
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="relative">
            <div className="absolute -top-12 right-0 transform rotate-12">
              <h3 className="text-8xl font-black text-[#0A0B1E] opacity-20">
                Share.
              </h3>
            </div>
            <div className="bg-pink-100 rounded-3xl p-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1 flex justify-center">
                  <div className="w-80 h-80 bg-gradient-to-br from-pink-200 to-pink-300 rounded-2xl flex items-center justify-center border-2 border-dashed border-pink-400">
                    <div className="text-center text-pink-600">
                      <svg
                        className="w-16 h-16 mx-auto mb-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                      </svg>
                      <div className="font-medium text-lg">
                        Personal Library
                      </div>
                      <div className="text-sm mt-2">
                        Save and manage insights
                      </div>
                    </div>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <h4 className="text-3xl font-bold text-[#0A0B1E] mb-6">
                    Your personal library of insights
                  </h4>
                  <p className="text-lg text-[#0A0B1E]/70 mb-8 leading-relaxed">
                    Your SummifyAI account gives you one place to save
                    summaries, share insights, and track your reading journey.
                    Build your personal library and help friends discover great
                    books.
                  </p>
                  <Link
                    to={user ? "/account-settings" : "/signin"}
                    className="bg-pink-200 hover:bg-pink-300 text-[#0A0B1E] px-6 py-3 rounded-xl font-medium transition-colors border-2 border-[#0A0B1E] inline-block"
                  >
                    {user ? "Manage Account" : "Sign in to access"}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Testimonials */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-[#0A0B1E] text-center mb-16">
            Loved by readers everywhere
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah K.",
                role: "Product Manager",
                text: "SummifyAI has completely changed how I discover and consume book insights. The comparative summaries save me hours of research.",
              },
              {
                name: "Mike R.",
                role: "Entrepreneur",
                text: "The affiliate earning feature is genius. I share summaries with my team and actually earn money from the books they purchase. Win-win!",
              },
              {
                name: "Lisa Chen",
                role: "VP of Learning",
                text: "Finally, a tool that doesn't just summarize books but actually helps me understand different perspectives on the same topic. Brilliant!",
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="font-semibold text-[#0A0B1E]">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-[#0A0B1E] text-white py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Ready to discover better insights?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of readers who use SummifyAI to discover, compare,
              and share book insights.
            </p>
            <Link
              to="/signup"
              className="inline-block bg-[#FFFD63] text-[#0A0B1E] px-8 py-4 rounded-2xl font-bold text-lg hover:bg-yellow-300 transition-colors"
            >
              Get started for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

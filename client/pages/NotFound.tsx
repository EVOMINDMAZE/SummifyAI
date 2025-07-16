import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

const NotFound = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/generate?topic=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const popularTopics = [
    "Leadership strategies",
    "Time management",
    "Team building",
    "Communication skills",
    "Goal setting",
    "Productivity tips",
  ];

  const suggestedPages = [
    { path: "/", name: "Home", icon: "🏠", description: "Start your journey" },
    {
      path: "/generate",
      name: "Generate",
      icon: "🔍",
      description: "Find chapter discoveries",
    },
    {
      path: "/how-it-works",
      name: "How It Works",
      icon: "🤔",
      description: "Learn about our process",
    },
    {
      path: "/help",
      name: "Help Center",
      icon: "📚",
      description: "Get support and tutorials",
    },
    {
      path: "/pricing",
      name: "Pricing",
      icon: "💳",
      description: "View our plans",
    },
    {
      path: "/contact",
      name: "Contact",
      icon: "📧",
      description: "Get in touch with us",
    },
  ];

  // Add user-specific pages if authenticated
  const userPages = user
    ? [
        {
          path: "/dashboard",
          name: "Dashboard",
          icon: "📊",
          description: "View your analytics",
        },
        {
          path: "/results",
          name: "Results",
          icon: "📖",
          description: "Your saved discoveries",
        },
        {
          path: "/settings",
          name: "Settings",
          icon: "⚙️",
          description: "Manage your account",
        },
      ]
    : [
        {
          path: "/signin",
          name: "Sign In",
          icon: "🔑",
          description: "Access your account",
        },
        {
          path: "/signup",
          name: "Sign Up",
          icon: "✨",
          description: "Create a new account",
        },
      ];

  const allSuggestedPages = [...suggestedPages, ...userPages];

  // Try to suggest similar pages based on the attempted URL
  const getSimilarPages = () => {
    const path = location.pathname.toLowerCase();
    const similar = [];

    if (path.includes("dash") || path.includes("profile")) {
      similar.push(allSuggestedPages.find((p) => p.path === "/dashboard"));
    }
    if (path.includes("result") || path.includes("search")) {
      similar.push(allSuggestedPages.find((p) => p.path === "/results"));
    }
    if (path.includes("setting") || path.includes("account")) {
      similar.push(allSuggestedPages.find((p) => p.path === "/settings"));
    }
    if (path.includes("help") || path.includes("support")) {
      similar.push(allSuggestedPages.find((p) => p.path === "/help"));
    }
    if (path.includes("pricing") || path.includes("plan")) {
      similar.push(allSuggestedPages.find((p) => p.path === "/pricing"));
    }

    return similar.filter(Boolean);
  };

  const similarPages = getSimilarPages();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <span className="text-[#0A0B1E] font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-[#0A0B1E] dark:text-white">
                SummifyAI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                to="/"
                className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Main 404 Section */}
        <div className="text-center mb-16">
          <div className="relative">
            {/* Animated 404 */}
            <div className="text-8xl md:text-9xl font-black text-gray-200 dark:text-gray-700 mb-8 relative">
              4
              <span className="inline-block animate-bounce mx-4 text-[#4361EE]">
                0
              </span>
              4
            </div>

            {/* Floating books animation */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="animate-float">
                <div className="text-6xl">📚</div>
              </div>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Oops! Page not found
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Looks like you're trying to find a chapter that doesn't exist. But
            don't worry - we can help you discover the content you're looking
            for!
          </p>

          {/* Error details */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 max-w-md mx-auto mb-8">
            <p className="text-sm text-red-800 dark:text-red-200">
              <span className="font-medium">Attempted URL:</span>{" "}
              <code className="bg-red-100 dark:bg-red-800 px-2 py-1 rounded text-xs">
                {location.pathname}
              </code>
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🔍 Search for Chapter Discoveries Instead
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Can't find what you're looking for? Try searching for a topic and
              we'll find the exact chapters you need to read.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter a topic (e.g., leadership strategies, time management...)"
                className="flex-1 px-6 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition-all"
              />
              <button
                type="submit"
                disabled={!searchQuery.trim()}
                className="px-8 py-4 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] hover:from-[#7B2CBF] hover:to-[#4361EE] disabled:from-gray-300 disabled:to-gray-400 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none"
              >
                Find Chapters
              </button>
            </div>
          </form>

          {/* Popular Topics */}
          <div className="mt-8">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-4">
              Or try one of these popular topics:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSearchQuery(topic)}
                  className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Similar Pages Suggestion */}
        {similarPages.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 p-8 mb-12">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-200 mb-4 text-center">
              💡 Were you looking for one of these?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarPages.map((page) => (
                <Link
                  key={page?.path}
                  to={page?.path || "/"}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{page?.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {page?.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {page?.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Pages Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            🧭 Explore SummifyAI
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allSuggestedPages.map((page) => (
              <Link
                key={page.path}
                to={page.path}
                className="group bg-gray-50 dark:bg-gray-700 rounded-xl p-6 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:shadow-lg"
              >
                <div className="text-center">
                  <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                    {page.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-[#4361EE] dark:group-hover:text-[#FFFD63]">
                    {page.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {page.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">
              Still can't find what you need?
            </h2>
            <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
              Our support team is here to help you navigate SummifyAI and find
              exactly what you're looking for.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/help"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Visit Help Center
              </Link>
              <Link
                to="/contact"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors border border-purple-400"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NotFound;

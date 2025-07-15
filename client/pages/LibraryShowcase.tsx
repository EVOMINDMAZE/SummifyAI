import { useState } from "react";
import { Link } from "react-router-dom";

export default function LibraryShowcase() {
  const [activeView, setActiveView] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const mockLibraryItems = [
    {
      id: "1",
      topic: "Leadership Excellence",
      category: "business",
      date: "2024-01-20",
      summary:
        "Leadership is fundamentally about serving others and creating environments where people can thrive...",
      books: 5,
      views: 245,
      saved: true,
      shared: 18,
      tags: ["management", "leadership", "growth"],
      thumbnail: "https://covers.openlibrary.org/b/id/8739161-M.jpg",
    },
    {
      id: "2",
      topic: "Productivity Systems",
      category: "productivity",
      date: "2024-01-18",
      summary:
        "Peak productivity comes from deep focus and efficient systems that eliminate decision fatigue...",
      books: 4,
      views: 189,
      saved: true,
      shared: 23,
      tags: ["productivity", "habits", "focus"],
      thumbnail: "https://covers.openlibrary.org/b/id/8739164-M.jpg",
    },
    {
      id: "3",
      topic: "Innovation Strategy",
      category: "business",
      date: "2024-01-15",
      summary:
        "Disruptive innovation starts with serving overlooked markets before transforming industries...",
      books: 3,
      views: 167,
      saved: false,
      shared: 15,
      tags: ["innovation", "strategy", "disruption"],
      thumbnail: "https://covers.openlibrary.org/b/id/8739167-M.jpg",
    },
    {
      id: "4",
      topic: "Personal Finance",
      category: "finance",
      date: "2024-01-12",
      summary:
        "Building wealth requires understanding compound interest, asset allocation, and long-term thinking...",
      books: 6,
      views: 298,
      saved: true,
      shared: 34,
      tags: ["finance", "investing", "wealth"],
      thumbnail: "https://covers.openlibrary.org/b/id/8739170-M.jpg",
    },
    {
      id: "5",
      topic: "Mental Models",
      category: "psychology",
      date: "2024-01-10",
      summary:
        "Mental models are thinking tools that help us understand the world and make better decisions...",
      books: 4,
      views: 156,
      saved: true,
      shared: 12,
      tags: ["psychology", "decision-making", "thinking"],
      thumbnail: "https://covers.openlibrary.org/b/id/8739171-M.jpg",
    },
    {
      id: "6",
      topic: "Digital Marketing",
      category: "marketing",
      date: "2024-01-08",
      summary:
        "Modern marketing is about creating genuine value and building authentic relationships at scale...",
      books: 5,
      views: 201,
      saved: false,
      shared: 28,
      tags: ["marketing", "digital", "growth"],
      thumbnail: "https://covers.openlibrary.org/b/id/8739172-M.jpg",
    },
  ];

  const categories = [
    { id: "all", name: "All Topics", count: mockLibraryItems.length },
    {
      id: "business",
      name: "Business",
      count: mockLibraryItems.filter((item) => item.category === "business")
        .length,
    },
    {
      id: "productivity",
      name: "Productivity",
      count: mockLibraryItems.filter((item) => item.category === "productivity")
        .length,
    },
    {
      id: "finance",
      name: "Finance",
      count: mockLibraryItems.filter((item) => item.category === "finance")
        .length,
    },
    {
      id: "psychology",
      name: "Psychology",
      count: mockLibraryItems.filter((item) => item.category === "psychology")
        .length,
    },
    {
      id: "marketing",
      name: "Marketing",
      count: mockLibraryItems.filter((item) => item.category === "marketing")
        .length,
    },
  ];

  const filteredItems =
    selectedCategory === "all"
      ? mockLibraryItems
      : mockLibraryItems.filter((item) => item.category === selectedCategory);

  const stats = {
    totalSummaries: mockLibraryItems.length,
    totalViews: mockLibraryItems.reduce((sum, item) => sum + item.views, 0),
    totalShares: mockLibraryItems.reduce((sum, item) => sum + item.shared, 0),
    savedItems: mockLibraryItems.filter((item) => item.saved).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
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
                Create Your Library
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-black mb-6">
            Your Personal Library of Insights
          </h1>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            See how SummifyAI organizes your knowledge into a beautiful,
            searchable library. Save, share, and rediscover insights whenever
            you need them.
          </p>
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-6 py-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="font-medium">Live Demo - No Signup Required</span>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.totalSummaries}
              </div>
              <div className="text-blue-800 font-medium">Total Summaries</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.totalViews.toLocaleString()}
              </div>
              <div className="text-green-800 font-medium">Views</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {stats.totalShares}
              </div>
              <div className="text-purple-800 font-medium">Shares</div>
            </div>
            <div className="text-center p-6 bg-yellow-50 rounded-xl">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {stats.savedItems}
              </div>
              <div className="text-yellow-800 font-medium">Saved</div>
            </div>
          </div>
        </div>
      </div>

      {/* Library Interface */}
      <div className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#0A0B1E] mb-2">
                My Knowledge Library
              </h2>
              <p className="text-gray-600">
                Organize and rediscover your AI-generated insights
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveView("grid")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === "grid"
                      ? "bg-white text-[#0A0B1E] shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setActiveView("list")}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === "list"
                      ? "bg-white text-[#0A0B1E] shadow-sm"
                      : "text-gray-600"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? "bg-[#FFFD63] text-[#0A0B1E]"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>

          {/* Grid View */}
          {activeView === "grid" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                    <img
                      src={item.thumbnail}
                      alt={item.topic}
                      className="w-20 h-28 object-cover rounded shadow-lg"
                    />
                    {item.saved && (
                      <div className="absolute top-3 right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-yellow-800"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#0A0B1E] text-lg mb-2">
                      {item.topic}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{item.books} books</span>
                      <span>{item.views} views</span>
                      <span>{item.shared} shares</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {activeView === "list" && (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-6">
                    <img
                      src={item.thumbnail}
                      alt={item.topic}
                      className="w-16 h-20 object-cover rounded shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-[#0A0B1E] text-xl">
                          {item.topic}
                        </h3>
                        {item.saved && (
                          <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                            <svg
                              className="w-3 h-3 text-yellow-800"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{item.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            {item.category}
                          </span>
                          <span>{item.books} books</span>
                          <span>{item.views} views</span>
                          <span>{item.shared} shares</span>
                          <span>
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Call to Action */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-br from-[#FFFD63] to-yellow-200 rounded-2xl p-12">
              <h3 className="text-3xl font-bold text-[#0A0B1E] mb-4">
                Ready to Build Your Own Library? 📚
              </h3>
              <p className="text-[#0A0B1E]/80 text-lg mb-8 max-w-2xl mx-auto">
                Start generating AI-powered book summaries and create your
                personal knowledge library. Save insights, track your learning
                journey, and share discoveries with friends.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/signup"
                  className="bg-[#0A0B1E] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#0A0B1E]/90 transition-colors"
                >
                  Start Building Your Library
                </Link>
                <Link
                  to="/summary-showcase"
                  className="bg-white text-[#0A0B1E] border-2 border-[#0A0B1E] px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors"
                >
                  See Summary Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-3xl font-bold text-[#0A0B1E] text-center mb-12">
            Everything You Need to Organize Knowledge
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🔍",
                title: "Smart Search",
                description:
                  "Find any insight instantly with powerful search across all your summaries.",
              },
              {
                icon: "🏷️",
                title: "Auto-Tagging",
                description:
                  "AI automatically categorizes and tags your summaries for easy organization.",
              },
              {
                icon: "📊",
                title: "Usage Analytics",
                description:
                  "Track views, shares, and engagement to see which insights resonate most.",
              },
              {
                icon: "💾",
                title: "Cloud Sync",
                description:
                  "Access your library from anywhere with automatic cloud synchronization.",
              },
              {
                icon: "🤝",
                title: "Easy Sharing",
                description:
                  "Share individual insights or entire collections with friends and colleagues.",
              },
              {
                icon: "📱",
                title: "Mobile Ready",
                description:
                  "Beautiful, responsive design works perfectly on all your devices.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="font-bold text-lg text-[#0A0B1E] mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

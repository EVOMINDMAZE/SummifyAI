import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  amazonLink: string;
  commission: number;
}

interface GeneratedSummary {
  topic: string;
  books: Book[];
  summary: string;
  quotes: string[];
  generatedAt: string;
}

export default function Generate() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] =
    useState<GeneratedSummary | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const mockBooks: Book[] = [
    {
      id: "1",
      title: "Good to Great",
      author: "Jim Collins",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/0066620996.01.L.jpg",
      description:
        "Uncovers the factors that transform good companies into great ones",
      amazonLink: "https://amazon.com/dp/0066620996?tag=summifyai-20",
      commission: 8.5,
    },
    {
      id: "2",
      title: "The 7 Habits of Highly Effective People",
      author: "Stephen R. Covey",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/0743269519.01.L.jpg",
      description:
        "A holistic approach to personal and professional effectiveness",
      amazonLink: "https://amazon.com/dp/0743269519?tag=summifyai-20",
      commission: 9.2,
    },
    {
      id: "3",
      title: "Leaders Eat Last",
      author: "Simon Sinek",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/1591845327.01.L.jpg",
      description: "Why some teams pull together and others don't",
      amazonLink: "https://amazon.com/dp/1591845327?tag=summifyai-20",
      commission: 7.8,
    },
    {
      id: "4",
      title: "The Leadership Challenge",
      author: "James Kouzes & Barry Posner",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/1119278965.01.L.jpg",
      description: "How to Make Extraordinary Things Happen in Organizations",
      amazonLink: "https://amazon.com/dp/1119278965?tag=summifyai-20",
      commission: 8.9,
    },
    {
      id: "5",
      title: "Dare to Lead",
      author: "Brené Brown",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/0399592520.01.L.jpg",
      description: "Brave work, tough conversations, whole hearts",
      amazonLink: "https://amazon.com/dp/0399592520?tag=summifyai-20",
      commission: 9.1,
    },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    // Check if user has queries remaining
    if (user?.tier === "free" && user.queriesUsed >= user.queriesLimit) {
      setShowUpgrade(true);
      return;
    }

    setIsGenerating(true);

    // Simulate API call
    setTimeout(() => {
      const summary: GeneratedSummary = {
        topic: topic,
        books: mockBooks,
        summary: `
**Comparative Analysis of ${topic}:**

Effective leadership emerges from a combination of personal character and strategic thinking. Collins' research in "Good to Great" reveals that Level 5 leaders combine personal humility with professional will, channeling their ambition toward the company rather than themselves. This contrasts with Covey's principle-centered approach, which emphasizes character ethics and the importance of being rather than seeming.

Sinek's "Leaders Eat Last" introduces the concept of the "Circle of Safety," where leaders prioritize their team's well-being over their own comfort. This aligns with Brown's vulnerability-based leadership model, which argues that courage, compassion, and connection are the core leadership skills of the future. Meanwhile, Kouzes and Posner's research identifies five practices of exemplary leadership: modeling the way, inspiring a shared vision, challenging the process, enabling others to act, and encouraging the heart.

**Synthesized Takeaway:** Great leadership isn't about commanding authority but about serving others while maintaining unwavering commitment to principles and vision. The most effective leaders combine humility with determination, create psychological safety for their teams, and consistently demonstrate the values they expect from others.
        `,
        quotes: [
          '"Level 5 leaders channel their ego needs away from themselves and into the larger goal of building a great company." - Jim Collins',
          '"Begin with the end in mind." - Stephen Covey',
          '"Leadership is not about being in charge. Leadership is about taking care of those in your charge." - Simon Sinek',
        ],
        generatedAt: new Date().toISOString(),
      };

      setGeneratedSummary(summary);

      // Update user's query count
      if (user) {
        updateUser({ queriesUsed: user.queriesUsed + 1 });
      }

      setIsGenerating(false);
    }, 3000);
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export with Gumroad
    alert("PDF export feature coming soon!");
  };

  const handlePriorityGeneration = () => {
    // TODO: Implement priority generation upsell
    alert("Priority generation feature coming soon!");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Please sign in to continue
          </h2>
          <Link
            to="/signin"
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium"
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
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-lg">S</span>
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900">
                  SummifyAI
                </span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/generate"
                  className="border-yellow-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Generate Summary
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user.queriesUsed}/{user.queriesLimit} queries used
              </span>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Generate Book Summary
          </h1>
          <p className="text-lg text-gray-600">
            Enter any topic to get insights from the top 5 relevant books
          </p>
        </div>

        {/* Generation Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter a topic (e.g., leadership, productivity, marketing)"
              className="flex-1 px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              disabled={isGenerating}
            />
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim()}
              className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Generating...
                </>
              ) : (
                "Generate Summary"
              )}
            </button>
          </div>

          {user.tier === "free" && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-800">
                    <strong>Free Plan:</strong> {user.queriesUsed}/
                    {user.queriesLimit} queries used this month
                  </p>
                  {user.queriesUsed >= user.queriesLimit && (
                    <p className="text-sm text-yellow-700 mt-1">
                      You've reached your monthly limit. Upgrade to Premium for
                      unlimited summaries.
                    </p>
                  )}
                </div>
                {user.queriesUsed >= user.queriesLimit && (
                  <Link
                    to="/pricing"
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Priority Generation Upsell */}
          {user.tier === "premium" && !isGenerating && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800 font-medium">
                    Want instant results?
                  </p>
                  <p className="text-sm text-blue-600">
                    Get priority generation in 10 seconds for just $1.99
                  </p>
                </div>
                <button
                  onClick={handlePriorityGeneration}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Priority ($1.99)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="flex justify-center mb-4">
                <svg
                  className="animate-spin h-12 w-12 text-yellow-400"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Analyzing books on "{topic}"
              </h3>
              <p className="text-gray-600">
                Searching through thousands of books and generating your
                comparative summary...
              </p>
              <div className="mt-4 space-y-2 text-sm text-gray-500">
                <p>🔍 Finding top 5 relevant books...</p>
                <p>📖 Analyzing key insights and themes...</p>
                <p>✨ Generating comparative summary...</p>
              </div>
            </div>
          </div>
        )}

        {/* Generated Summary */}
        {generatedSummary && !isGenerating && (
          <div className="space-y-8">
            {/* Books Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Top 5 Books on "{generatedSummary.topic}"
              </h2>
              <div className="grid md:grid-cols-5 gap-6">
                {generatedSummary.books.map((book) => (
                  <div key={book.id} className="text-center group">
                    <div className="relative mb-3">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-lg transition-shadow"
                      />
                      {book.commission >= 8.5 && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          Bestseller
                        </div>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">{book.author}</p>
                    <a
                      href={book.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black text-xs px-3 py-2 rounded-md font-medium transition-colors w-full"
                    >
                      Buy on Amazon
                    </a>
                    <p className="text-xs text-gray-500 mt-1">
                      {book.commission}% commission
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Comparative Summary
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleExportPDF}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Export PDF ($2.99)
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    Share Summary
                  </button>
                </div>
              </div>

              <div className="prose max-w-none">
                <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                  {generatedSummary.summary}
                </div>
              </div>
            </div>

            {/* Key Quotes Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Key Quotes
              </h2>
              <div className="space-y-4">
                {generatedSummary.quotes.map((quote, index) => (
                  <blockquote
                    key={index}
                    className="border-l-4 border-yellow-400 pl-4 py-2 bg-yellow-50 rounded-r-lg"
                  >
                    <p className="text-gray-700 italic">{quote}</p>
                  </blockquote>
                ))}
              </div>
            </div>

            {/* Viral Loop */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-6 text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Love this summary? Share it!
              </h3>
              <p className="text-gray-800 mb-4">
                When your friend signs up through your link, you both get +1
                free query!
              </p>
              <div className="flex justify-center gap-3">
                <button className="bg-white text-gray-900 px-4 py-2 rounded-md font-medium hover:bg-gray-100">
                  Share on Twitter
                </button>
                <button className="bg-white text-gray-900 px-4 py-2 rounded-md font-medium hover:bg-gray-100">
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Modal */}
        {showUpgrade && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Upgrade to Premium
              </h3>
              <p className="text-gray-600 mb-6">
                You've used all your free queries this month. Upgrade to Premium
                for unlimited summaries and exclusive features.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgrade(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md font-medium hover:bg-gray-300"
                >
                  Maybe Later
                </button>
                <Link
                  to="/pricing"
                  className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-md font-medium text-center"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

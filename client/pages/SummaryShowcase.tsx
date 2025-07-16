import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

interface ShowcaseSummary {
  id: string;
  topic: string;
  books: Array<{
    title: string;
    author: string;
    cover: string;
    amazonLink: string;
  }>;
  summary: string;
  keyInsights: string[];
  quotes: string[];
  actionableSteps: string[];
  readingTime: string;
  completedAt: string;
}

export default function SummaryShowcase() {
  const { user } = useAuth();
  const [selectedSummary, setSelectedSummary] =
    useState<ShowcaseSummary | null>(null);

  const showcaseSummaries: ShowcaseSummary[] = [
    {
      id: "1",
      topic: "Building High-Performance Teams",
      books: [
        {
          title: "The Five Dysfunctions of a Team",
          author: "Patrick Lencioni",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0787960756.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0787960756?tag=summifyai-20",
        },
        {
          title: "Team of Teams",
          author: "General Stanley McChrystal",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1591847486.01.L.jpg",
          amazonLink: "https://amazon.com/dp/1591847486?tag=summifyai-20",
        },
        {
          title: "The Culture Game",
          author: "Daniel Mezick",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0984875301.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0984875301?tag=summifyai-20",
        },
      ],
      summary: `**Building High-Performance Teams: A Synthesis of Expert Perspectives**

High-performing teams emerge from the intersection of trust, adaptability, and shared purpose. Lencioni's foundational framework identifies trust as the cornerstone—teams that fail to build vulnerability-based trust cannot engage in productive conflict, achieve commitment, embrace accountability, or focus on collective results.

McChrystal's military perspective adds the critical dimension of adaptability in complex environments. Traditional hierarchical structures, while efficient for predictable tasks, become liabilities in dynamic situations requiring rapid information flow and decentralized decision-making. His "Team of Teams" model demonstrates how networks of trust and shared consciousness enable organizations to move at the speed of change.

Mezick's cultural lens reveals that sustainable team performance requires intentional culture design. Teams don't accidentally become high-performing; they require deliberate practices, rituals, and feedback systems that reinforce desired behaviors while continuously evolving based on results and learning.

**Unified Framework for Team Excellence:**

1. **Foundation of Trust** (Lencioni): Create psychological safety through vulnerability and authenticity
2. **Adaptive Networks** (McChrystal): Build information-sharing systems that enable rapid response
3. **Intentional Culture** (Mezick): Design practices and rituals that reinforce high-performance behaviors

The synthesis reveals that exceptional teams combine human connection with systematic approaches, balancing stability with agility, and individual growth with collective achievement.`,
      keyInsights: [
        "Trust is the fundamental prerequisite for all other team behaviors",
        "High-performance teams adapt faster than their environment changes",
        "Culture must be intentionally designed, not left to chance",
        "Information flow speed determines team response capability",
        "Psychological safety enables both innovation and accountability",
      ],
      quotes: [
        "Not finance. Not strategy. Not technology. It is teamwork that remains the ultimate competitive advantage. - Patrick Lencioni",
        "In a complex world, the best way to counter complexity is not to concentrate decision-making power in a few expert hands, but to share situational awareness across organizations. - Stanley McChrystal",
        "Culture is not about what you say, it's about what you practice and reward. - Daniel Mezick",
      ],
      actionableSteps: [
        "Conduct team trust assessment using Lencioni's framework",
        "Implement daily information-sharing rituals (stand-ups, dashboards)",
        "Establish clear cultural practices and measure their effectiveness",
        "Create safe spaces for productive conflict and debate",
        "Design decision-making processes that match situation complexity",
      ],
      readingTime: "8 min read",
      completedAt: "Generated on January 15, 2024",
    },
    {
      id: "2",
      topic: "Innovation in Digital Age",
      books: [
        {
          title: "The Innovator's Dilemma",
          author: "Clayton Christensen",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0062060244.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0062060244?tag=summifyai-20",
        },
        {
          title: "Crossing the Chasm",
          author: "Geoffrey Moore",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0062292986.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0062292986?tag=summifyai-20",
        },
        {
          title: "The Lean Startup",
          author: "Eric Ries",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0307887898.01.L.jpg",
          amazonLink: "https://amazon.com/dp/0307887898?tag=summifyai-20",
        },
      ],
      summary: `**Innovation in the Digital Age: Navigating Disruption and Market Adoption**

Digital innovation requires understanding three critical dimensions: the nature of disruption (Christensen), market adoption dynamics (Moore), and validated learning processes (Ries).

Christensen's disruption theory explains why established companies often fail despite superior resources and talent. Disruptive innovations typically start in overlooked market segments with "good enough" solutions that gradually improve until they challenge incumbents. Digital technologies accelerate this pattern by enabling rapid iteration and network effects.

Moore's technology adoption lifecycle reveals the psychological and social barriers that innovations must overcome. The "chasm" between early adopters and mainstream markets represents a fundamental shift from technology enthusiasm to pragmatic value assessment. Digital products must evolve from feature-rich solutions for enthusiasts to complete, reliable solutions for pragmatists.

Ries' Lean Startup methodology provides the tactical framework for navigating uncertainty through validated learning. In digital environments where customer behavior data is abundant and iteration costs are low, systematic experimentation becomes more important than elaborate planning.

**Integrated Innovation Strategy:**

Digital age innovation succeeds when companies combine disruption theory (strategic positioning), adoption lifecycle awareness (market timing), and lean methodology (execution approach) to create sustainable competitive advantages through continuous learning and adaptation.`,
      keyInsights: [
        "Disruption often starts where incumbent companies aren't competing",
        "The chasm between early adopters and mainstream market requires different strategies",
        "Validated learning beats elaborate planning in uncertain environments",
        "Digital technologies accelerate both disruption and market adoption cycles",
        "Sustainable innovation requires systematic experimentation capabilities",
      ],
      quotes: [
        "Disruptive technologies typically enable new markets to emerge by making products and services more accessible and affordable. - Clayton Christensen",
        "The single greatest impediment to crossing the chasm is the lack of reference customers and reference applications. - Geoffrey Moore",
        "Success is not delivering a feature; success is learning how to solve the customer's problem. - Eric Ries",
      ],
      actionableSteps: [
        "Identify overlooked market segments where disruption could emerge",
        "Map your innovation against the technology adoption lifecycle",
        "Implement build-measure-learn cycles for all new initiatives",
        "Develop complete solutions for mainstream market adoption",
        "Create systematic processes for validated learning and iteration",
      ],
      readingTime: "7 min read",
      completedAt: "Generated on January 12, 2024",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
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
                  to="/"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/summary-showcase"
                  className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
                >
                  Summary Showcase
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-[#FFFD63] to-[#FFE066] text-[#0A0B1E] px-6 py-2 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-orange-600 to-red-700 rounded-3xl p-8 text-white relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                ✨ Beautiful Summaries
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-6">
                Explore premium-quality comparative summaries that transform
                complex book insights into actionable knowledge. See the
                beautiful formatting, deep analysis, and practical takeaways
                that set SummifyAI apart.
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 max-w-2xl mx-auto">
                <p className="text-white/80 text-sm mb-2">
                  ✨ <strong>Summary Features:</strong>
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Professional formatting
                  </span>
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Key insights extraction
                  </span>
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Actionable steps
                  </span>
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Amazon affiliate links
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Selection */}
        {!selectedSummary && (
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {showcaseSummaries.map((summary) => (
              <div
                key={summary.id}
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-3xl transition-all cursor-pointer transform hover:scale-105"
                onClick={() => setSelectedSummary(summary)}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.topic}
                    </h2>
                    <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-medium">
                      {summary.readingTime}
                    </div>
                  </div>

                  <div className="flex -space-x-3 mb-6">
                    {summary.books.map((book, index) => (
                      <img
                        key={index}
                        src={book.cover}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded-lg border-2 border-white dark:border-gray-800 shadow-md"
                      />
                    ))}
                  </div>

                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                    {summary.summary.substring(0, 200)}...
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg text-sm">
                        {summary.keyInsights.length} insights
                      </span>
                      <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1 rounded-lg text-sm">
                        {summary.quotes.length} quotes
                      </span>
                    </div>
                    <button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-red-600 hover:to-orange-500 text-white px-6 py-2 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl">
                      View Summary →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Summary Display */}
        {selectedSummary && (
          <div className="space-y-8">
            {/* Summary Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-3xl p-8 text-white">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {selectedSummary.topic}
                  </h1>
                  <p className="text-white/80">
                    {selectedSummary.completedAt} •{" "}
                    {selectedSummary.readingTime}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSummary(null)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-xl transition-colors"
                >
                  ← Back to Showcase
                </button>
              </div>

              <div className="flex -space-x-2">
                {selectedSummary.books.map((book, index) => (
                  <div
                    key={index}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 flex items-center space-x-3 mr-2"
                  >
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h3 className="font-bold text-sm">{book.title}</h3>
                      <p className="text-white/80 text-xs">{book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Summary Content */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  📖 Comparative Analysis
                </h2>
                <div className="flex space-x-3">
                  <button className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all">
                    Export PDF
                  </button>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all">
                    Share Summary
                  </button>
                </div>
              </div>

              <div className="prose max-w-none">
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                  {selectedSummary.summary}
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                💡 Key Insights
              </h2>
              <div className="space-y-4">
                {selectedSummary.keyInsights.map((insight, index) => (
                  <div
                    key={index}
                    className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-400 rounded-2xl p-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 dark:text-blue-300 font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-blue-800 dark:text-blue-200 leading-relaxed">
                        {insight}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quotes */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                💬 Powerful Quotes
              </h2>
              <div className="space-y-6">
                {selectedSummary.quotes.map((quote, index) => (
                  <blockquote
                    key={index}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l-4 border-purple-400 rounded-2xl p-6"
                  >
                    <p className="text-purple-800 dark:text-purple-200 italic text-lg leading-relaxed">
                      "{quote}"
                    </p>
                  </blockquote>
                ))}
              </div>
            </div>

            {/* Actionable Steps */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                🎯 Actionable Steps
              </h2>
              <div className="space-y-4">
                {selectedSummary.actionableSteps.map((step, index) => (
                  <div
                    key={index}
                    className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-green-800 dark:text-green-200 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Books & Purchase Links */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                📚 Get the Books
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {selectedSummary.books.map((book, index) => (
                  <div
                    key={index}
                    className="text-center group bg-gray-50 dark:bg-gray-700 rounded-2xl p-6"
                  >
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-24 h-32 object-cover rounded-xl shadow-lg mx-auto mb-4 group-hover:shadow-xl transition-all"
                    />
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                      {book.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      by {book.author}
                    </p>
                    <a
                      href={book.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-gradient-to-r from-[#FFFD63] to-[#FFE066] hover:from-[#FFE066] hover:to-[#FFFD63] text-[#0A0B1E] px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Buy on Amazon
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-[#FFFD63] via-yellow-400 to-orange-400 rounded-3xl p-8 text-center">
              <h3 className="text-2xl font-bold text-[#0A0B1E] mb-4">
                Create Your Own Beautiful Summaries
              </h3>
              <p className="text-[#0A0B1E]/80 mb-6 text-lg">
                Join thousands of readers who use SummifyAI to create
                professional-quality comparative summaries on any topic.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {user ? (
                  <Link
                    to="/generate"
                    className="bg-[#0A0B1E] hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Generate Your Summary
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="bg-[#0A0B1E] hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Sign Up to Create Summaries
                  </Link>
                )}
                <button
                  onClick={() => setSelectedSummary(null)}
                  className="bg-white/20 hover:bg-white/30 text-[#0A0B1E] px-8 py-4 rounded-2xl font-medium transition-all border border-[#0A0B1E]/20"
                >
                  View More Examples
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";

export default function SummaryShowcase() {
  const [selectedTopic, setSelectedTopic] = useState("leadership");
  const [isGenerating, setIsGenerating] = useState(false);

  const showcaseTopics = {
    leadership: {
      name: "Leadership",
      books: [
        {
          title: "Good to Great",
          author: "Jim Collins",
          cover: "https://covers.openlibrary.org/b/id/8739161-M.jpg",
          amazonLink: "https://amazon.com/dp/0066620996?tag=summifyai-20",
          rating: 4.5,
        },
        {
          title: "The 7 Habits of Highly Effective People",
          author: "Stephen R. Covey",
          cover: "https://covers.openlibrary.org/b/id/8739162-M.jpg",
          amazonLink: "https://amazon.com/dp/1982137274?tag=summifyai-20",
          rating: 4.7,
        },
        {
          title: "Leaders Eat Last",
          author: "Simon Sinek",
          cover: "https://covers.openlibrary.org/b/id/8739163-M.jpg",
          amazonLink: "https://amazon.com/dp/1591845327?tag=summifyai-20",
          rating: 4.4,
        },
      ],
      summary:
        "Leadership is fundamentally about serving others and creating environments where people can thrive. The best leaders understand that their primary role is to enable their teams to achieve extraordinary results through clear vision, consistent principles, and genuine care for people's development. Great companies are built by Level 5 leaders who channel their ego needs away from themselves and into the larger goal of building a great company.",
      keyInsights: [
        "Great leaders prioritize the success of their team over personal recognition",
        "Consistent principles and values create trust and predictability in leadership",
        "Leadership is a practice that requires continuous learning and adaptation",
      ],
      quotes: [
        "Level 5 leaders channel their ego needs away from themselves and into the larger goal of building a great company. - Jim Collins",
        "Begin with the end in mind. - Stephen Covey",
        "The cost of leadership is self-interest. - Simon Sinek",
      ],
    },
    productivity: {
      name: "Productivity",
      books: [
        {
          title: "Deep Work",
          author: "Cal Newport",
          cover: "https://covers.openlibrary.org/b/id/8739164-M.jpg",
          amazonLink: "https://amazon.com/dp/1455586691?tag=summifyai-20",
          rating: 4.6,
        },
        {
          title: "Getting Things Done",
          author: "David Allen",
          cover: "https://covers.openlibrary.org/b/id/8739165-M.jpg",
          amazonLink: "https://amazon.com/dp/0143126563?tag=summifyai-20",
          rating: 4.3,
        },
        {
          title: "Atomic Habits",
          author: "James Clear",
          cover: "https://covers.openlibrary.org/b/id/8739166-M.jpg",
          amazonLink: "https://amazon.com/dp/0735211299?tag=summifyai-20",
          rating: 4.8,
        },
      ],
      summary:
        "Peak productivity comes from the ability to focus deeply on meaningful work while maintaining efficient systems for managing tasks and commitments. The key is creating distraction-free environments and trusted systems that free your mind to focus on what matters most. Small, consistent habits compound over time to create remarkable results.",
      keyInsights: [
        "Deep, focused work produces exponentially better results than fragmented attention",
        "External systems for capturing tasks eliminate mental overhead and decision fatigue",
        "Habits are the compound interest of self-improvement - small changes yield remarkable results",
      ],
      quotes: [
        "Human beings, it seems, are at their best when immersed deeply in something challenging. - Cal Newport",
        "Your mind is for having ideas, not holding them. - David Allen",
        "You do not rise to the level of your goals. You fall to the level of your systems. - James Clear",
      ],
    },
    innovation: {
      name: "Innovation",
      books: [
        {
          title: "The Innovator's Dilemma",
          author: "Clayton M. Christensen",
          cover: "https://covers.openlibrary.org/b/id/8739167-M.jpg",
          amazonLink: "https://amazon.com/dp/1633691780?tag=summifyai-20",
          rating: 4.2,
        },
        {
          title: "Zero to One",
          author: "Peter Thiel",
          cover: "https://covers.openlibrary.org/b/id/8739168-M.jpg",
          amazonLink: "https://amazon.com/dp/0804139296?tag=summifyai-20",
          rating: 4.4,
        },
        {
          title: "The Lean Startup",
          author: "Eric Ries",
          cover: "https://covers.openlibrary.org/b/id/8739169-M.jpg",
          amazonLink: "https://amazon.com/dp/0307887898?tag=summifyai-20",
          rating: 4.1,
        },
      ],
      summary:
        "Innovation often fails when established companies focus too heavily on current customers' needs while missing disruptive technologies that initially serve niche markets but eventually transform entire industries. True innovation creates something entirely new (zero to one) rather than copying what already exists, and requires systematic experimentation to validate assumptions quickly and cheaply.",
      keyInsights: [
        "Disruptive innovations start by serving overlooked market segments before moving upmarket",
        "Monopoly businesses create new value rather than competing in existing markets",
        "Validated learning through rapid experimentation prevents building products nobody wants",
      ],
      quotes: [
        "The next Bill Gates will not build an operating system. The next Larry Page will not make a search engine. - Peter Thiel",
        "The only way to win is to learn faster than anyone else. - Eric Ries",
        "Disruptive technology should be framed as a marketing challenge, not a technological one. - Clayton Christensen",
      ],
    },
  };

  const currentShowcase =
    showcaseTopics[selectedTopic as keyof typeof showcaseTopics];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
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
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#FFFD63] to-yellow-200 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-black text-[#0A0B1E] mb-6">
            See Your Perfect Summary in Action
          </h1>
          <p className="text-xl text-[#0A0B1E]/80 mb-8 max-w-2xl mx-auto">
            Experience how SummifyAI transforms any topic into actionable
            insights from the top 5 books. Try it now with no signup required!
          </p>
        </div>
      </div>

      {/* Interactive Demo */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Topic Selector */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#0A0B1E] mb-8">
              Choose a Topic to Explore
            </h2>
            <div className="flex justify-center gap-4 flex-wrap">
              {Object.entries(showcaseTopics).map(([key, topic]) => (
                <button
                  key={key}
                  onClick={() => setSelectedTopic(key)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    selectedTopic === key
                      ? "bg-[#FFFD63] text-[#0A0B1E] shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {topic.name}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <div className="text-center mb-12">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`px-8 py-4 rounded-xl font-bold text-lg transition-all ${
                isGenerating
                  ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                  : "bg-[#0A0B1E] text-white hover:bg-[#0A0B1E]/90 shadow-lg hover:shadow-xl"
              }`}
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Summary...
                </div>
              ) : (
                "✨ Generate AI Summary"
              )}
            </button>
          </div>

          {/* Results */}
          <div
            className={`transition-all duration-1000 ${isGenerating ? "opacity-50 scale-95" : "opacity-100 scale-100"}`}
          >
            {/* Books Found */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-[#0A0B1E] mb-6 text-center">
                📚 Top 5 Books Found for "{currentShowcase.name}"
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                {currentShowcase.books.map((book, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow"
                  >
                    <div className="flex gap-4">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-20 h-28 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-[#0A0B1E] mb-2">
                          {book.title}
                        </h4>
                        <p className="text-gray-600 mb-3">{book.author}</p>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex text-yellow-400">
                            {"★".repeat(Math.floor(book.rating))}
                          </div>
                          <span className="text-gray-500 text-sm">
                            {book.rating}
                          </span>
                        </div>
                        <a
                          href={book.amazonLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          View on Amazon →
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-12">
              <h3 className="text-2xl font-bold text-[#0A0B1E] mb-6 text-center">
                🤖 AI-Generated Comparative Summary
              </h3>
              <div className="max-w-4xl mx-auto">
                <p className="text-lg text-gray-700 leading-relaxed text-center mb-8">
                  {currentShowcase.summary}
                </p>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xl font-bold text-[#0A0B1E] mb-4">
                      🎯 Key Insights
                    </h4>
                    <ul className="space-y-3">
                      {currentShowcase.keyInsights.map((insight, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-[#FFFD63] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-[#0A0B1E] text-sm font-bold">
                              {index + 1}
                            </span>
                          </div>
                          <span className="text-gray-700">{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-[#0A0B1E] mb-4">
                      💬 Key Quotes
                    </h4>
                    <div className="space-y-4">
                      {currentShowcase.quotes.map((quote, index) => (
                        <blockquote
                          key={index}
                          className="border-l-4 border-[#FFFD63] pl-4 italic text-gray-700"
                        >
                          "{quote}"
                        </blockquote>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center">
              <div className="bg-[#0A0B1E] rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  Love what you see? 🎉
                </h3>
                <p className="text-gray-300 mb-6 text-lg">
                  Get unlimited access to AI-powered book summaries on any topic
                  you can imagine!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/signup"
                    className="bg-[#FFFD63] text-[#0A0B1E] px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors"
                  >
                    Start Free Account
                  </Link>
                  <Link
                    to="/pricing"
                    className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/20 transition-colors"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-[#0A0B1E] mb-8">
            Join thousands of learners who love SummifyAI
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { metric: "50,000+", label: "Summaries Generated" },
              { metric: "12,000+", label: "Happy Users" },
              { metric: "4.9/5", label: "User Rating" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-[#FFFD63] mb-2">
                  {stat.metric}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

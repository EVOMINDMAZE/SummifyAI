import { useState } from "react";
import { Link } from "react-router-dom";

export default function InsightsDemo() {
  const [selectedTopic, setSelectedTopic] = useState("leadership");

  const demoTopics = {
    leadership: {
      title: "Leadership",
      books: [
        {
          title: "Good to Great",
          author: "Jim Collins",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0066620996.01.L.jpg",
          keyInsight:
            "Level 5 Leadership combines humility with fierce resolve",
          commission: 8.5,
        },
        {
          title: "The 7 Habits of Highly Effective People",
          author: "Stephen Covey",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0743269519.01.L.jpg",
          keyInsight:
            "Character ethics foundation for leadership effectiveness",
          commission: 9.2,
        },
        {
          title: "Leaders Eat Last",
          author: "Simon Sinek",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1591845327.01.L.jpg",
          keyInsight: "Leaders sacrifice their interests for team success",
          commission: 7.8,
        },
        {
          title: "Dare to Lead",
          author: "Brené Brown",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0399592520.01.L.jpg",
          keyInsight:
            "Vulnerability is the cornerstone of courageous leadership",
          commission: 9.1,
        },
        {
          title: "The Leadership Challenge",
          author: "James Kouzes",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1119278965.01.L.jpg",
          keyInsight: "Five practices enable extraordinary achievements",
          commission: 8.9,
        },
      ],
      summary: `
**Comparative Analysis of Leadership:**

Effective leadership emerges from a combination of personal character and strategic thinking. Collins' research in "Good to Great" reveals that Level 5 leaders combine personal humility with professional will, channeling their ambition toward the company rather than themselves. This contrasts with Covey's principle-centered approach, which emphasizes character ethics and the importance of being rather than seeming.

Sinek's "Leaders Eat Last" introduces the concept of the "Circle of Safety," where leaders prioritize their team's well-being over their own comfort. This aligns with Brown's vulnerability-based leadership model, which argues that courage, compassion, and connection are the core leadership skills of the future. Meanwhile, Kouzes and Posner's research identifies five practices of exemplary leadership: modeling the way, inspiring a shared vision, challenging the process, enabling others to act, and encouraging the heart.

**Synthesized Takeaway:** Great leadership isn't about commanding authority but about serving others while maintaining unwavering commitment to principles and vision. The most effective leaders combine humility with determination, create psychological safety for their teams, and consistently demonstrate the values they expect from others.
      `,
      quotes: [
        '"Level 5 leaders channel their ego needs away from themselves and into the larger goal of building a great company." - Jim Collins',
        '"Begin with the end in mind." - Stephen Covey',
        '"Leadership is not about being in charge. Leadership is about taking care of those in your charge." - Simon Sinek',
        '"Clear is kind. Unclear is unkind." - Brené Brown',
        '"Leadership is a relationship between those who aspire to lead and those who choose to follow." - James Kouzes',
      ],
    },
    productivity: {
      title: "Productivity",
      books: [
        {
          title: "Deep Work",
          author: "Cal Newport",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1455586692.01.L.jpg",
          keyInsight: "Focus is the new superpower in a distracted world",
          commission: 8.7,
        },
        {
          title: "Atomic Habits",
          author: "James Clear",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0735211299.01.L.jpg",
          keyInsight: "Small changes compound into remarkable results",
          commission: 9.5,
        },
        {
          title: "Getting Things Done",
          author: "David Allen",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0143126563.01.L.jpg",
          keyInsight: "Trusted system enables mental clarity and action",
          commission: 8.2,
        },
        {
          title: "The Power of Now",
          author: "Eckhart Tolle",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1577314808.01.L.jpg",
          keyInsight: "Present moment awareness maximizes effectiveness",
          commission: 7.9,
        },
        {
          title: "Essentialism",
          author: "Greg McKeown",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0804137382.01.L.jpg",
          keyInsight: "Less but better - the disciplined pursuit of less",
          commission: 8.6,
        },
      ],
      summary: `
**Comparative Analysis of Productivity:**

Peak productivity emerges from the intersection of focus, systems, and intentional living. Newport's "Deep Work" argues that the ability to focus without distraction is increasingly rare and valuable, while Clear's "Atomic Habits" demonstrates how small, consistent actions compound into extraordinary results over time.

Allen's GTD methodology provides the structural foundation through trusted systems that free mental bandwidth for higher-order thinking. This practical approach contrasts with Tolle's spiritual perspective in "The Power of Now," which emphasizes present-moment awareness as the source of true effectiveness. McKeown's "Essentialism" bridges these approaches by advocating for the disciplined pursuit of less but better.

**Synthesized Takeaway:** True productivity isn't about doing more things faster, but about doing the right things with complete attention. The most productive individuals combine systematic approaches with mindful presence, focusing their energy on essential activities that align with their deepest values and highest contributions.
      `,
      quotes: [
        '"Human beings, it seems, are at their best when immersed deeply in something challenging." - Cal Newport',
        '"You do not rise to the level of your goals. You fall to the level of your systems." - James Clear',
        '"Your mind is for having ideas, not holding them." - David Allen',
        '"Realize deeply that the present moment is all you have." - Eckhart Tolle',
        '"If you don\'t prioritize your life, someone else will." - Greg McKeown',
      ],
    },
  };

  const currentDemo = demoTopics[selectedTopic as keyof typeof demoTopics];

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
                Try It Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-black text-[#0A0B1E] mb-6">
            See the Power of AI Insights
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Experience how SummifyAI transforms topics into comprehensive,
            comparative book insights. Try different topics to see the magic in
            action.
          </p>

          {/* Topic Selector */}
          <div className="flex justify-center gap-4 mb-8">
            {Object.keys(demoTopics).map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-6 py-3 rounded-xl font-medium transition-all capitalize ${
                  selectedTopic === topic
                    ? "bg-[#0A0B1E] text-white"
                    : "bg-white text-[#0A0B1E] hover:bg-gray-50"
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Content */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Books Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#0A0B1E] text-center mb-12">
              Top 5 Books on "{currentDemo.title}"
            </h2>
            <div className="grid md:grid-cols-5 gap-6">
              {currentDemo.books.map((book, index) => (
                <div key={index} className="text-center group">
                  <div className="relative mb-4">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-48 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-shadow"
                    />
                    {book.commission >= 8.5 && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Bestseller
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-[#0A0B1E] mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2">{book.author}</p>
                  <p className="text-xs text-blue-600 mb-3 italic">
                    {book.keyInsight}
                  </p>
                  <button className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] text-xs px-3 py-2 rounded-lg font-medium transition-colors w-full">
                    Buy on Amazon
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    {book.commission}% commission
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Section */}
          <div className="mb-16">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-[#0A0B1E]">
                  AI-Generated Comparative Summary
                </h2>
                <div className="flex gap-3">
                  <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
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
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    Share Summary
                  </button>
                </div>
              </div>

              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {currentDemo.summary}
                </div>
              </div>
            </div>
          </div>

          {/* Key Quotes */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[#0A0B1E] text-center mb-12">
              Key Quotes
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {currentDemo.quotes.map((quote, index) => (
                <blockquote
                  key={index}
                  className="bg-gradient-to-r from-[#FFFD63]/20 to-yellow-100 border-l-4 border-[#FFFD63] p-6 rounded-r-xl"
                >
                  <p className="text-gray-700 italic text-lg leading-relaxed">
                    {quote}
                  </p>
                </blockquote>
              ))}
            </div>
          </div>

          {/* Insights Breakdown */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-[#0A0B1E] text-center mb-12">
              How AI Analyzes These Books
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
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
                </div>
                <h3 className="text-xl font-bold text-[#0A0B1E] mb-3">
                  Common Themes
                </h3>
                <p className="text-gray-600">
                  Identifies recurring concepts and ideas across all books to
                  find universal principles.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#0A0B1E] mb-3">
                  Contrasting Views
                </h3>
                <p className="text-gray-600">
                  Highlights where authors disagree or offer different
                  perspectives on the same topic.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[#0A0B1E] mb-3">
                  Actionable Insights
                </h3>
                <p className="text-gray-600">
                  Synthesizes information into practical takeaways you can apply
                  immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0A0B1E] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to generate your own insights?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Try SummifyAI with your own topics and discover insights from the
            world's best books.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-[#FFFD63] text-[#0A0B1E] px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </div>
    </div>
  );
}

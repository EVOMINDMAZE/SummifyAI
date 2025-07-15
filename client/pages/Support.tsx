import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Support() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"help" | "contact" | "feedback">(
    "help",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
    priority: "normal",
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
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
                d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access support resources.
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

  const faqItems = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I generate my first summary?",
          a: "Simply go to the Generate page, enter a topic you're interested in (like 'leadership' or 'productivity'), and click Generate. Our AI will find the top books and create a comparative summary for you.",
        },
        {
          q: "What topics work best?",
          a: "SummifyAI works great with broad business, self-help, and educational topics. Examples: 'leadership', 'productivity', 'marketing', 'psychology', 'innovation'.",
        },
        {
          q: "How many searches do I get?",
          a: `Free users get ${user.queryLimit} searches per month. Premium users get unlimited searches plus additional features like priority generation and PDF exports.`,
        },
      ],
    },
    {
      category: "Credits & Rewards",
      questions: [
        {
          q: "How do I earn credits?",
          a: "You can earn credits by sharing summaries (1 credit each) and referring friends who sign up (3 credits each). Credits can be used for additional searches when you reach your monthly limit.",
        },
        {
          q: "How do I use my credits?",
          a: "When you've used all your monthly searches, you'll see an option to use 2 credits for 1 additional search. You can also manage credits in your Account Settings.",
        },
        {
          q: "Do credits expire?",
          a: "No, your credits never expire! They'll stay in your account until you use them.",
        },
      ],
    },
    {
      category: "Premium Features",
      questions: [
        {
          q: "What's included in Premium?",
          a: "Premium includes unlimited searches, priority generation (faster results), PDF exports, advanced sharing options, and priority support.",
        },
        {
          q: "Can I cancel anytime?",
          a: "Yes, you can cancel your Premium subscription at any time. You'll continue to have access until the end of your billing period.",
        },
        {
          q: "Is there a free trial?",
          a: "All new users start with a free account that includes 3 searches. You can upgrade to Premium at any time to unlock unlimited access.",
        },
      ],
    },
    {
      category: "Technical Support",
      questions: [
        {
          q: "Why is my summary taking so long?",
          a: "Free users are in a shared queue, while Premium users get priority processing. During busy times, free summaries may take a few minutes longer.",
        },
        {
          q: "Can I edit or regenerate a summary?",
          a: "Currently, summaries cannot be edited, but you can regenerate them with a new search. Each regeneration counts as a new search.",
        },
        {
          q: "How do I download my data?",
          a: "Go to Settings > Privacy > Data Export to download all your summaries and account data in JSON format.",
        },
      ],
    },
  ];

  const filteredFaq = faqItems
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send the form data to your backend
    alert(
      "Thank you for contacting us! We'll get back to you within 24 hours.",
    );
    setContactForm({ subject: "", message: "", priority: "normal" });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <span className="text-[#0A0B1E] font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                SummifyAI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/settings"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                Settings
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
      <div className="bg-white dark:bg-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Support Center
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {user.tier === "premium" ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Premium Support - Priority response within 4 hours
                  </span>
                ) : (
                  "Get help and find answers to common questions"
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "help", name: "Help Center", icon: "❓" },
              { id: "contact", name: "Contact Us", icon: "💬" },
              { id: "feedback", name: "Feedback", icon: "💡" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-[#FFFD63] text-gray-900 dark:text-white"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="pb-12">
          {activeTab === "help" && (
            <div className="space-y-8">
              {/* Search */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Search Help Articles
                </h2>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for answers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                  />
                  <svg
                    className="absolute right-3 top-3 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* FAQ */}
              <div className="space-y-6">
                {filteredFaq.map((category, categoryIndex) => (
                  <div
                    key={categoryIndex}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <div className="px-8 py-6 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {category.category}
                      </h3>
                    </div>
                    <div className="p-8 space-y-6">
                      {category.questions.map((item, index) => (
                        <div key={index}>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                            {item.q}
                          </h4>
                          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                            {item.a}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    title: "Getting Started Guide",
                    description: "Complete walkthrough for new users",
                    icon: "🚀",
                    link: "#",
                  },
                  {
                    title: "API Documentation",
                    description: "Developer resources and API reference",
                    icon: "⚡",
                    link: "#",
                  },
                  {
                    title: "Feature Requests",
                    description: "Suggest new features and vote on ideas",
                    icon: "💡",
                    link: "#",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  >
                    <div className="text-3xl mb-3">{item.icon}</div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-8">
              {/* Contact Form */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Contact Support
                </h2>
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          subject: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                      placeholder="Brief description of your issue"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Priority
                    </label>
                    <select
                      value={contactForm.priority}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          priority: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                    >
                      <option value="low">Low - General question</option>
                      <option value="normal">Normal - Account issue</option>
                      <option value="high">High - Service not working</option>
                      <option value="urgent">Urgent - Critical problem</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Message
                    </label>
                    <textarea
                      required
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                      placeholder="Please describe your issue in detail..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                    Response Times
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Free users:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        24-48 hours
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Premium users:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        4-8 hours
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">
                        Urgent issues:
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        1-2 hours
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                    Other Ways to Reach Us
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span>📧</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        support@summifyai.com
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>💬</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Live chat (Premium only)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span>🐦</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        @SummifyAI
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="space-y-8">
              {/* Feedback Form */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Share Your Feedback
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Help us improve SummifyAI by sharing your thoughts, ideas, and
                  suggestions.
                </p>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Feature Request",
                      description: "Suggest new features or improvements",
                      icon: "✨",
                      color: "blue",
                    },
                    {
                      title: "Bug Report",
                      description: "Report issues or problems",
                      icon: "🐛",
                      color: "red",
                    },
                    {
                      title: "General Feedback",
                      description: "Share your overall experience",
                      icon: "💭",
                      color: "green",
                    },
                  ].map((item, index) => (
                    <button
                      key={index}
                      className={`p-6 border-2 rounded-xl text-left hover:shadow-lg transition-all ${
                        item.color === "blue"
                          ? "border-blue-200 hover:border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700"
                          : item.color === "red"
                            ? "border-red-200 hover:border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700"
                            : "border-green-200 hover:border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
                      }`}
                    >
                      <div className="text-3xl mb-3">{item.icon}</div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {item.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Community */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Join Our Community
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">💬</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Discord Community
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Chat with other users and get quick help
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Feature Voting
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Vote on upcoming features and roadmap
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

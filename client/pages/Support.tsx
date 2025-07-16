import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function Support() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<string>("faq");
  const [contactForm, setContactForm] = useState({
    subject: "",
    category: "general",
    message: "",
    priority: "normal",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    alert(
      "Support ticket submitted successfully! We'll get back to you within 24 hours.",
    );
    setContactForm({
      subject: "",
      category: "general",
      message: "",
      priority: "normal",
    });
    setIsSubmitting(false);
  };

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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access support resources and submit tickets.
          </p>
          <div className="space-y-3">
            <Link
              to="/signin"
              className="inline-block bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Sign In
            </Link>
            <div>
              <Link
                to="/contact"
                className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
              >
                Or visit our general contact page
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I search for specific chapters?",
          a: "Simply enter your topic or question in the search box on the Generate page. Our AI will analyze millions of books to find the exact chapters and page numbers that address your query.",
        },
        {
          q: "How accurate are the chapter recommendations?",
          a: "Our AI has a 99.9% accuracy rate for chapter relevance. Each recommendation includes page numbers and explains why the chapter is relevant to your specific question.",
        },
        {
          q: "Can I save my discoveries?",
          a: "Yes! All your chapter discoveries are automatically saved to your personal library where you can organize them by categories and share them with others.",
        },
      ],
    },
    {
      category: "Account & Billing",
      questions: [
        {
          q: "How do I upgrade to Premium?",
          a: "Visit the Pricing page and click 'Start Premium'. You'll get a 7-day free trial with all Premium features before any charges.",
        },
        {
          q: "Can I cancel my subscription anytime?",
          a: "Yes, you can cancel anytime from your account settings. You'll retain access to Premium features until the end of your billing period.",
        },
        {
          q: "What's included in the free plan?",
          a: "The free plan includes 3 chapter discoveries per month, basic AI analysis, and access to your personal library.",
        },
      ],
    },
    {
      category: "Features & Usage",
      questions: [
        {
          q: "What makes SummifyAI different from other book services?",
          a: "Instead of generic book summaries, we find exact chapters and page numbers that answer your specific questions. This saves you hours of reading time.",
        },
        {
          q: "Can I share my discoveries with team members?",
          a: "Yes! Premium users can share chapter discoveries with up to 5 team members and track engagement analytics.",
        },
        {
          q: "How does the AI chapter analysis work?",
          a: "Our AI analyzes book content structure and matches your query to specific chapters, providing page numbers and explaining why each chapter is relevant to your needs.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-[#FFFD63] dark:bg-gray-900 relative z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0A0B1E] dark:bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <span className="text-[#FFFD63] dark:text-[#0A0B1E] font-bold text-lg">
                  S
                </span>
              </div>
              <span className="text-xl font-bold text-[#0A0B1E] dark:text-white">
                SummifyAI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/settings"
                className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
              >
                Settings
              </Link>
              <ThemeToggle />
              <Link
                to="/generate"
                className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] px-4 py-2 rounded-lg font-medium transition-colors"
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
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
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
                Get help with SummifyAI, find answers to common questions, or
                contact our support team
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Quick Start Guide
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Learn how to find your first chapter in under 2 minutes
            </p>
            <button
              onClick={() => setActiveSection("guide")}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              View Guide
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              FAQs
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Find answers to the most common questions
            </p>
            <button
              onClick={() => setActiveSection("faq")}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Browse FAQs
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 text-center">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-purple-600 dark:text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Contact Support
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Submit a ticket for personalized help
            </p>
            <button
              onClick={() => setActiveSection("contact")}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Contact Us
            </button>
          </div>
        </div>

        {/* Content Sections */}
        {activeSection === "guide" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Quick Start Guide
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#FFFD63] rounded-full flex items-center justify-center font-bold text-[#0A0B1E]">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Enter Your Question
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Go to the Generate page and type a specific question or
                    topic you want to learn about.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#FFFD63] rounded-full flex items-center justify-center font-bold text-[#0A0B1E]">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Get Chapter Recommendations
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our AI analyzes millions of books and returns exact chapters
                    and page numbers that address your question.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-[#FFFD63] rounded-full flex items-center justify-center font-bold text-[#0A0B1E]">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                    Save & Share
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Save discoveries to your library and share targeted insights
                    with others instead of entire book recommendations.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Link
                to="/generate"
                className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Try It Now
              </Link>
            </div>
          </div>
        )}

        {activeSection === "faq" && (
          <div className="space-y-8">
            {faqs.map((category, categoryIndex) => (
              <div
                key={categoryIndex}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {category.category}
                </h2>
                <div className="space-y-6">
                  {category.questions.map((faq, faqIndex) => (
                    <div
                      key={faqIndex}
                      className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0"
                    >
                      <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                        {faq.q}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === "contact" && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Contact Support
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Response Times
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Free users: 48 hours
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Premium users: 24 hours
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600 dark:text-gray-400">
                      Urgent issues: 4 hours
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                  Before Contacting
                </h3>
                <ul className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                  <li>• Check our FAQs above</li>
                  <li>• Try refreshing your browser</li>
                  <li>• Check your internet connection</li>
                  <li>• Include specific error messages</li>
                </ul>
              </div>
            </div>

            <form onSubmit={handleSubmitTicket} className="mt-8 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={contactForm.category}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                  >
                    <option value="general">General Question</option>
                    <option value="technical">Technical Issue</option>
                    <option value="billing">Billing & Account</option>
                    <option value="feature">Feature Request</option>
                    <option value="bug">Bug Report</option>
                  </select>
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
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, subject: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={contactForm.message}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, message: e.target.value })
                  }
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                  placeholder="Please describe your issue in detail..."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#FFFD63] hover:bg-yellow-300 disabled:bg-gray-300 text-[#0A0B1E] px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                    Submitting...
                  </>
                ) : (
                  "Submit Ticket"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

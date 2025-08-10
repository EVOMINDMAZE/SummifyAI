import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

export default function Contact() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    category: "general",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    alert(
      "Thank you for contacting us! We'll get back to you within 24-48 hours.",
    );
    setContactForm({
      name: "",
      email: "",
      subject: "",
      category: "general",
      message: "",
    });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
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
                SummifyIO
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
              >
                Home
              </Link>
              <Link
                to="/pricing"
                className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
              >
                Pricing
              </Link>
              <Link
                to="/signin"
                className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
              >
                Sign In
              </Link>
              <ThemeToggle />
              <Link
                to="/signup"
                className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-[#FFFD63] via-yellow-300 to-orange-300 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-[#0A0B1E] mb-6">
            Get In Touch
          </h1>
          <p className="text-xl text-[#0A0B1E]/80 max-w-2xl mx-auto mb-8 leading-relaxed">
            Have questions about SummifyIO? Want to learn more about finding
            exact chapters? We're here to help!
          </p>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-[#0A0B1E]/80 text-sm mb-4">
              ✨ <strong>Quick Response:</strong>
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg font-medium">
                General: 24-48 hours
              </span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium">
                Sales: Same day
              </span>
              <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-lg font-medium">
                Partnerships: 1-2 days
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Send us a message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

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
                    <option value="general">General Inquiry</option>
                    <option value="sales">Sales & Pricing</option>
                    <option value="support">Product Support</option>
                    <option value="partnership">Partnerships</option>
                    <option value="media">Media & Press</option>
                    <option value="feedback">Feedback & Suggestions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={contactForm.subject}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        subject: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                    placeholder="Brief description of your inquiry"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        message: e.target.value,
                      })
                    }
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                    placeholder="Tell us more about your inquiry..."
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#FFFD63] hover:bg-yellow-300 disabled:bg-gray-300 text-[#0A0B1E] py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
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
                      Sending Message...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info & FAQs */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Other ways to reach us
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
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
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Email
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      hello@summifyai.com
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Live Chat
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      Available 9am-5pm PST
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-4 h-4 text-purple-600 dark:text-purple-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      Twitter
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      @SummifyAI
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick FAQs */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Quick Answers
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    How does SummifyAI work?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Our AI analyzes millions of books to find exact chapters and
                    page numbers that address your specific questions.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    Is there a free plan?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Yes! Get 3 free chapter discoveries per month with no credit
                    card required.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                    How accurate are the results?
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Our AI has a 99.9% accuracy rate for chapter relevance and
                    includes page numbers and explanations.
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <Link
                  to="/search-demo"
                  className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
                >
                  Try our live demo →
                </Link>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-r from-[#FFFD63] to-yellow-400 rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-[#0A0B1E] mb-2">
                Ready to get started?
              </h3>
              <p className="text-[#0A0B1E]/80 text-sm mb-4">
                Join thousands who find exactly what they need in seconds
              </p>
              <Link
                to="/signup"
                className="bg-[#0A0B1E] hover:bg-gray-800 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-block"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

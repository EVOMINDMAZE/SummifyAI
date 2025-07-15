import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Pricing() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly",
  );

  const handleSubscribe = async (plan: "premium") => {
    if (!user) {
      navigate("/signup");
      return;
    }

    setIsProcessing(true);

    try {
      // TODO: Replace with actual Stripe integration
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          priceId: plan === "premium" ? "price_premium_monthly" : null,
          userId: user.id,
          cycle: billingCycle,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      // For demo purposes, simulate successful subscription
      updateUser({
        tier: "premium",
        queriesLimit: 999999,
        subscriptionId: "sub_demo_123",
      });

      alert("Successfully upgraded to Premium! (Demo mode)");
      navigate("/dashboard");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.subscriptionId) return;

    if (confirm("Are you sure you want to cancel your subscription?")) {
      try {
        updateUser({
          tier: "free",
          queriesLimit: 3,
          subscriptionId: undefined,
        });

        alert(
          "Subscription cancelled successfully. You'll retain access until the end of your billing period.",
        );
      } catch (error) {
        alert("Failed to cancel subscription. Please try again.");
      }
    }
  };

  const monthlyPrice = 9.99;
  const yearlyPrice = 99.99;
  const yearlyDiscount = Math.round(
    (1 - yearlyPrice / (monthlyPrice * 12)) * 100,
  );

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
              {user ? (
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-[#0A0B1E] font-medium"
                >
                  Back to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="text-gray-600 hover:text-[#0A0B1E] font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium transition-colors"
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
      <div className="bg-gradient-to-br from-[#FFFD63] to-yellow-200 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-black text-[#0A0B1E] mb-6">
            Simple pricing for everyone
          </h1>
          <p className="text-xl text-[#0A0B1E]/80 mb-8 max-w-2xl mx-auto">
            Start free and upgrade when you need more. No hidden fees, no
            complicated tiers.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-white rounded-xl p-1 shadow-lg">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-[#0A0B1E] text-white shadow-sm"
                  : "text-[#0A0B1E] hover:bg-gray-50"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-3 rounded-lg font-medium transition-all relative ${
                billingCycle === "yearly"
                  ? "bg-[#0A0B1E] text-white shadow-sm"
                  : "text-[#0A0B1E] hover:bg-gray-50"
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save {yearlyDiscount}%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Current Plan Status */}
      {user && (
        <div className="bg-blue-50 border-y border-blue-200 py-4">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-blue-800 font-medium">
                Current Plan: {user.tier === "free" ? "Free" : "Premium"}
              </span>
              {user.tier === "free" && (
                <span className="text-blue-600 text-sm">
                  ({user.queriesUsed}/{user.queriesLimit} queries used)
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div
              className={`bg-white rounded-3xl p-8 border-2 shadow-lg ${
                user?.tier === "free"
                  ? "border-[#FFFD63] ring-4 ring-[#FFFD63]/20"
                  : "border-gray-200"
              }`}
            >
              {user?.tier === "free" && (
                <div className="text-center mb-6">
                  <span className="inline-block bg-[#FFFD63] text-[#0A0B1E] px-3 py-1 rounded-full text-sm font-bold">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#0A0B1E] mb-2">Free</h3>
                <p className="text-gray-600 mb-6">
                  Perfect for getting started
                </p>
                <div className="mb-4">
                  <span className="text-5xl font-black text-[#0A0B1E]">$0</span>
                  <span className="text-lg text-gray-500 font-normal">
                    /month
                  </span>
                </div>
                <p className="text-sm text-gray-500">No credit card required</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "3 summaries per month",
                  "Top 5 books analysis",
                  "300-word comparative summaries",
                  "Key quotes included",
                  "Amazon affiliate links",
                  "Basic email support",
                  "Mobile & desktop access",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                disabled={user?.tier === "free"}
                className="w-full py-4 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {user?.tier === "free" ? "Current Plan" : "Get Started Free"}
              </button>
            </div>

            {/* Premium Plan */}
            <div
              className={`bg-white rounded-3xl p-8 border-2 shadow-xl relative ${
                user?.tier === "premium"
                  ? "border-[#FFFD63] ring-4 ring-[#FFFD63]/20"
                  : "border-[#FFFD63]"
              }`}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#0A0B1E] text-white px-4 py-2 rounded-full text-sm font-bold">
                  Most Popular
                </span>
              </div>

              {user?.tier === "premium" && (
                <div className="text-center mb-6 mt-4">
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold">
                    Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-8 mt-6">
                <h3 className="text-2xl font-bold text-[#0A0B1E] mb-2">
                  Premium
                </h3>
                <p className="text-gray-600 mb-6">
                  For power users and professionals
                </p>
                <div className="mb-4">
                  <span className="text-5xl font-black text-[#0A0B1E]">
                    $
                    {billingCycle === "monthly"
                      ? monthlyPrice
                      : (yearlyPrice / 12).toFixed(2)}
                  </span>
                  <span className="text-lg text-gray-500 font-normal">
                    /month
                  </span>
                </div>
                {billingCycle === "yearly" && (
                  <div className="text-sm text-green-600 font-medium mb-2">
                    ${yearlyPrice}/year (Save {yearlyDiscount}%)
                  </div>
                )}
                <p className="text-sm text-gray-500">
                  {billingCycle === "monthly"
                    ? "Billed monthly"
                    : "Billed annually"}{" "}
                  • Cancel anytime
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  "Unlimited summaries",
                  "Priority generation (10 seconds)",
                  "PDF exports included",
                  "Affiliate earnings dashboard",
                  "Advanced analytics",
                  "Priority email & chat support",
                  "Custom sharing templates",
                  "Team collaboration features",
                  "API access (coming soon)",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-[#FFFD63] flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700 font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              {user?.tier === "premium" ? (
                <div className="space-y-3">
                  <button
                    disabled
                    className="w-full py-4 bg-green-100 text-green-800 rounded-xl font-bold cursor-not-allowed"
                  >
                    Current Plan - Active
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    className="w-full py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
                  >
                    Cancel Subscription
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe("premium")}
                  disabled={isProcessing}
                  className="w-full py-4 bg-[#FFFD63] hover:bg-yellow-300 disabled:bg-gray-300 text-[#0A0B1E] rounded-xl transition-colors font-bold flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
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
                      Processing...
                    </>
                  ) : (
                    "Start Free Trial"
                  )}
                </button>
              )}

              {user?.tier !== "premium" && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  14-day free trial • No credit card required
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Comparison */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0A0B1E] mb-4">
              Compare plans in detail
            </h2>
            <p className="text-gray-600 text-lg">
              See exactly what's included in each plan
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-bold text-[#0A0B1E]">
                    Features
                  </th>
                  <th className="text-center py-4 px-6 font-bold text-[#0A0B1E]">
                    Free
                  </th>
                  <th className="text-center py-4 px-6 font-bold text-[#0A0B1E]">
                    Premium
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  {
                    feature: "Book summaries per month",
                    free: "3",
                    premium: "Unlimited",
                  },
                  {
                    feature: "Books analyzed per summary",
                    free: "5",
                    premium: "5",
                  },
                  {
                    feature: "Summary length",
                    free: "300 words",
                    premium: "300-500 words",
                  },
                  {
                    feature: "Key quotes",
                    free: "3 per summary",
                    premium: "5 per summary",
                  },
                  {
                    feature: "Amazon affiliate links",
                    free: "✓",
                    premium: "✓",
                  },
                  { feature: "PDF export", free: "✗", premium: "✓" },
                  { feature: "Priority generation", free: "✗", premium: "✓" },
                  {
                    feature: "Affiliate earnings tracking",
                    free: "✗",
                    premium: "✓",
                  },
                  { feature: "Team collaboration", free: "✗", premium: "✓" },
                  { feature: "Custom templates", free: "✗", premium: "✓" },
                  { feature: "API access", free: "✗", premium: "Coming soon" },
                  {
                    feature: "Support",
                    free: "Email",
                    premium: "Priority email & chat",
                  },
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-600">
                      {row.free}
                    </td>
                    <td className="py-4 px-6 text-center text-gray-900 font-medium">
                      {row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0A0B1E] mb-4">
              Frequently asked questions
            </h2>
            <p className="text-gray-600 text-lg">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                question: "How does the free trial work?",
                answer:
                  "Your 14-day free trial includes all Premium features. No credit card required to start. You can cancel anytime before the trial ends and you won't be charged.",
              },
              {
                question: "Can I cancel my subscription anytime?",
                answer:
                  "Yes! You can cancel your subscription at any time from your dashboard. You'll retain access to Premium features until the end of your current billing period.",
              },
              {
                question: "How do affiliate earnings work?",
                answer:
                  "When users click on Amazon links in your shared summaries and make purchases, you earn a commission (typically 4-8%). Track your earnings in real-time through your dashboard and get paid monthly via PayPal or direct deposit.",
              },
              {
                question: "What payment methods do you accept?",
                answer:
                  "We accept all major credit cards (Visa, MasterCard, American Express, Discover) and PayPal through our secure Stripe integration. All transactions are encrypted and secure.",
              },
              {
                question: "Can I change my plan later?",
                answer:
                  "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate the billing accordingly.",
              },
              {
                question: "Is there a limit to team members?",
                answer:
                  "Premium plans include up to 5 team members. For larger teams, please contact us for custom enterprise pricing with unlimited seats and additional features.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6"
              >
                <h3 className="text-lg font-bold text-[#0A0B1E] mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#0A0B1E] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to unlock better insights?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join thousands of readers who use SummifyAI to discover and share
            book insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-block bg-[#FFFD63] text-[#0A0B1E] px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors"
            >
              Start free trial
            </Link>
            <Link
              to="/generate"
              className="inline-block border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-[#0A0B1E] transition-colors"
            >
              Try demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

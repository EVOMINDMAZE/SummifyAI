import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function Pricing() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"free" | "premium">(
    "premium",
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
        // TODO: Implement actual subscription cancellation
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
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Back to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade anytime. All plans include our core book
            summarization features.
          </p>
        </div>

        {/* Current Plan Status */}
        {user && (
          <div className="max-w-md mx-auto mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-blue-800 font-medium">Current Plan</p>
              <p className="text-lg font-bold text-blue-900 capitalize">
                {user.tier} Plan
              </p>
              {user.tier === "free" && (
                <p className="text-sm text-blue-600">
                  {user.queriesUsed}/{user.queriesLimit} queries used this month
                </p>
              )}
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          {/* Free Plan */}
          <div
            className={`bg-white rounded-2xl shadow-lg p-8 border-2 ${user?.tier === "free" ? "border-yellow-400" : "border-gray-200"}`}
          >
            {user?.tier === "free" && (
              <div className="text-center mb-4">
                <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                  Current Plan
                </span>
              </div>
            )}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Perfect for getting started</p>
              <div className="text-5xl font-bold text-gray-900 mb-2">
                $0
                <span className="text-lg text-gray-500 font-normal">
                  /month
                </span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">3 summaries per month</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">Top 5 books analysis</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">300-word summaries</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">Key quotes included</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">Amazon affiliate links</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">Email support</span>
              </li>
            </ul>

            <button
              disabled={user?.tier === "free"}
              className="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {user?.tier === "free" ? "Current Plan" : "Get Started Free"}
            </button>
          </div>

          {/* Premium Plan */}
          <div
            className={`bg-white rounded-2xl shadow-lg p-8 border-2 relative ${user?.tier === "premium" ? "border-yellow-400" : "border-yellow-300"}`}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-yellow-400 text-black px-4 py-2 rounded-full text-sm font-bold">
                Most Popular
              </span>
            </div>

            {user?.tier === "premium" && (
              <div className="text-center mb-4 mt-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-8 mt-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <p className="text-gray-600 mb-6">
                For power users and professionals
              </p>
              <div className="text-5xl font-bold text-gray-900 mb-2">
                $9.99
                <span className="text-lg text-gray-500 font-normal">
                  /month
                </span>
              </div>
              <p className="text-sm text-gray-500">
                Billed monthly • Cancel anytime
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700 font-medium">
                  Unlimited summaries
                </span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">
                  Priority generation (10 seconds)
                </span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">PDF export included</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">
                  Affiliate earnings dashboard
                </span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">Advanced analytics</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">Priority support</span>
              </li>
              <li className="flex items-center">
                <svg
                  className="w-5 h-5 text-green-500 mr-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-gray-700">Custom sharing templates</span>
              </li>
            </ul>

            {user?.tier === "premium" ? (
              <div className="space-y-3">
                <button
                  disabled
                  className="w-full py-3 px-4 bg-green-100 text-green-800 rounded-lg font-medium cursor-not-allowed"
                >
                  Current Plan
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="w-full py-3 px-4 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Cancel Subscription
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe("premium")}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-300 text-black rounded-lg transition-colors font-medium flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 mr-2"
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
                    Processing...
                  </>
                ) : (
                  "Start Free Trial"
                )}
              </button>
            )}

            {user?.tier !== "premium" && (
              <p className="text-xs text-gray-500 text-center mt-2">
                7-day free trial • No credit card required
              </p>
            )}
          </div>
        </div>

        {/* Add-ons */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Premium Add-ons
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  PDF Export
                </h3>
                <span className="text-2xl font-bold text-gray-900">$2.99</span>
              </div>
              <p className="text-gray-600 mb-4">
                Download your summaries as beautifully formatted PDFs. Perfect
                for offline reading and sharing.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Professional formatting</li>
                <li>• Include book covers and quotes</li>
                <li>• Optimized for printing</li>
              </ul>
              <button className="w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium">
                One-time Purchase
              </button>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Priority Summary
                </h3>
                <span className="text-2xl font-bold text-gray-900">$1.99</span>
              </div>
              <p className="text-gray-600 mb-4">
                Get your summary generated in just 10 seconds instead of the
                usual 30-60 seconds.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• 10-second generation</li>
                <li>• Same quality results</li>
                <li>• Perfect for urgent needs</li>
              </ul>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium">
                One-time Purchase
              </button>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How does the free trial work?
              </h3>
              <p className="text-gray-600">
                Your 7-day free trial includes all Premium features. No credit
                card required to start. You can cancel anytime before the trial
                ends.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel my subscription anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time. You'll retain
                access to Premium features until the end of your current billing
                period.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How do affiliate earnings work?
              </h3>
              <p className="text-gray-600">
                When users click on Amazon links in your shared summaries and
                make purchases, you earn a commission. Track your earnings in
                your dashboard and get paid monthly.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards (Visa, MasterCard, American
                Express) and PayPal through our secure Stripe integration.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

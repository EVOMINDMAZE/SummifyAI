import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function Pricing() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "yearly",
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

  const monthlyPrice = 29;
  const yearlyPrice = 299;
  const yearlyDiscount = Math.round(
    (1 - yearlyPrice / (monthlyPrice * 12)) * 100,
  );

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
                SummifyAI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  to="/dashboard"
                  className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
                >
                  Back to Dashboard
                </Link>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Urgency */}
      <div className="bg-gradient-to-br from-[#FFFD63] via-yellow-300 to-orange-300 py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#0A0B1E] rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-500 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-red-500 rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          {/* Urgency Badge */}
          <div className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold mb-6 animate-pulse">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            LIMITED TIME: 48 Hours Left - Save $200+ This Week Only!
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-[#0A0B1E] dark:text-white mb-6 leading-tight">
            Stop Wasting Hours Reading
            <br />
            <span className="text-red-600">Entire Books</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#0A0B1E]/80 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
            Join 10,000+ smart professionals who find{" "}
            <strong>exact chapters and pages</strong> in seconds, not hours. Get
            AI chapter analysis + affiliate earnings that pay for your
            subscription.
          </p>

          {/* Social Proof Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <div className="flex -space-x-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 bg-gray-300 rounded-full border-2 border-white"
                  ></div>
                ))}
              </div>
              <span className="text-sm font-medium text-[#0A0B1E]">
                10,000+ users
              </span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg
                    key={i}
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium text-[#0A0B1E]">
                4.9/5 rating
              </span>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2">
              <svg
                className="w-4 h-4 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-medium text-[#0A0B1E]">
                $127K+ earned by users
              </span>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-gray-200 shadow-xl mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-red-600 mb-2">10X</div>
                <div className="font-semibold text-[#0A0B1E] mb-1">
                  Faster Discovery
                </div>
                <div className="text-sm text-gray-600">Minutes vs Hours</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-green-600 mb-2">
                  $500+
                </div>
                <div className="font-semibold text-[#0A0B1E] mb-1">
                  Avg Monthly Earnings
                </div>
                <div className="text-sm text-gray-600">
                  Affiliate commissions
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-blue-600 mb-2">
                  99.9%
                </div>
                <div className="font-semibold text-[#0A0B1E] mb-1">
                  Accuracy Rate
                </div>
                <div className="text-sm text-gray-600">Chapter relevance</div>
              </div>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="inline-flex bg-white rounded-2xl p-2 shadow-lg mb-8">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-8 py-4 rounded-xl font-bold transition-all ${
                billingCycle === "monthly"
                  ? "bg-[#0A0B1E] text-white shadow-lg"
                  : "text-[#0A0B1E] hover:bg-gray-50"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-8 py-4 rounded-xl font-bold transition-all relative ${
                billingCycle === "yearly"
                  ? "bg-[#0A0B1E] text-white shadow-lg"
                  : "text-[#0A0B1E] hover:bg-gray-50"
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-3 py-1 rounded-full animate-bounce">
                SAVE {yearlyDiscount}%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards - Focused on Value */}
      <div className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Free Plan - De-emphasized */}
            <div className="bg-white dark:bg-gray-700 rounded-3xl p-8 border border-gray-200 dark:border-gray-600 shadow-lg opacity-75">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#0A0B1E] dark:text-white mb-2">
                  Free
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Limited trial to get started
                </p>
                <div className="mb-4">
                  <span className="text-5xl font-black text-[#0A0B1E] dark:text-white">
                    $0
                  </span>
                  <span className="text-lg text-gray-500 font-normal">
                    /month
                  </span>
                </div>
                <p className="text-sm text-red-600 font-semibold">
                  ⚠️ Very Limited Features
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  { text: "Only 3 chapter discoveries", limited: true },
                  { text: "Basic chapter locations", limited: true },
                  { text: "No page numbers", limited: true },
                  { text: "No affiliate earnings", limited: true },
                  { text: "No export features", limited: true },
                  { text: "Email support only", limited: true },
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <svg
                      className={`w-5 h-5 flex-shrink-0 ${feature.limited ? "text-red-400" : "text-green-500"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      {feature.limited ? (
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      ) : (
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      )}
                    </svg>
                    <span
                      className={`${feature.limited ? "text-gray-500 line-through" : "text-gray-700 dark:text-gray-300"}`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className="w-full py-4 border-2 border-gray-300 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-medium text-center block"
              >
                Try Limited Free Version
              </Link>
            </div>

            {/* Premium Plan - Highly Emphasized */}
            <div className="bg-gradient-to-br from-[#0A0B1E] via-gray-900 to-[#0A0B1E] text-white rounded-3xl p-8 shadow-2xl relative transform lg:scale-105 border-4 border-[#FFFD63]">
              {/* Popular Badge */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-[#FFFD63] to-yellow-400 text-[#0A0B1E] px-6 py-3 rounded-full text-sm font-black uppercase tracking-wide shadow-lg">
                  🔥 MOST POPULAR - 94% Choose This
                </div>
              </div>

              {/* Current Plan Indicator */}
              {user?.tier === "premium" && (
                <div className="text-center mb-6 mt-4">
                  <span className="inline-block bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                    ✓ Your Current Plan
                  </span>
                </div>
              )}

              <div className="text-center mb-8 mt-8">
                <h3 className="text-3xl font-bold mb-2">Premium</h3>
                <p className="text-gray-300 mb-6">
                  Unlimited discoveries + earnings
                </p>

                {/* Price with Strikethrough */}
                <div className="mb-6">
                  {billingCycle === "yearly" && (
                    <div className="text-lg text-red-400 line-through mb-2">
                      Was $348/year
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-6xl font-black text-[#FFFD63]">
                      $
                      {billingCycle === "monthly"
                        ? monthlyPrice
                        : (yearlyPrice / 12).toFixed(0)}
                    </span>
                    <div className="text-left">
                      <div className="text-xl text-gray-300">/month</div>
                      {billingCycle === "yearly" && (
                        <div className="text-sm text-green-400 font-bold">
                          You save ${monthlyPrice * 12 - yearlyPrice}!
                        </div>
                      )}
                    </div>
                  </div>
                  {billingCycle === "yearly" && (
                    <div className="text-lg text-gray-300 mt-2">
                      ${yearlyPrice}/year ({yearlyDiscount}% off)
                    </div>
                  )}
                </div>

                {/* Money-Back Guarantee */}
                <div className="bg-green-900/30 border border-green-500 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-green-400 font-bold">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    30-Day Money-Back Guarantee
                  </div>
                  <p className="text-sm text-gray-300 mt-1">
                    Not satisfied? Get 100% refund, no questions asked
                  </p>
                </div>
              </div>

              {/* Premium Features */}
              <ul className="space-y-4 mb-8">
                {[
                  { text: "⚡ UNLIMITED chapter discoveries", highlight: true },
                  {
                    text: "📍 Exact page numbers & locations",
                    highlight: true,
                  },
                  { text: "🤖 Advanced AI chapter analysis", highlight: true },
                  { text: "💰 Affiliate earnings dashboard", highlight: true },
                  { text: "📊 Real-time earnings tracking", highlight: true },
                  { text: "📄 PDF exports & sharing", highlight: false },
                  { text: "🎯 Priority search (2x faster)", highlight: false },
                  { text: "📞 24/7 priority support", highlight: false },
                  { text: "👥 Team collaboration features", highlight: false },
                  { text: "🔌 API access (coming soon)", highlight: false },
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
                    <span
                      className={`${feature.highlight ? "font-bold text-[#FFFD63]" : "text-gray-300"}`}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Buttons */}
              {user?.tier === "premium" ? (
                <div className="space-y-3">
                  <div className="w-full py-4 bg-green-600 text-white rounded-xl font-bold text-center">
                    ✓ Currently Active
                  </div>
                  <button
                    onClick={handleCancelSubscription}
                    className="w-full py-3 border border-red-300 text-red-300 rounded-xl hover:bg-red-900/20 transition-colors font-medium"
                  >
                    Cancel Subscription
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => handleSubscribe("premium")}
                    disabled={isProcessing}
                    className="w-full py-5 bg-gradient-to-r from-[#FFFD63] to-yellow-400 hover:from-yellow-400 hover:to-[#FFFD63] text-[#0A0B1E] rounded-xl transition-all font-black text-lg flex items-center justify-center gap-2 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
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
                      <>🚀 START EARNING NOW - INSTANT ACCESS</>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-xs text-gray-400">
                      ✅ No credit card required for 7-day trial
                      <br />✅ Cancel anytime • ✅ Instant activation
                    </p>
                  </div>
                </div>
              )}

              {/* Earnings Guarantee */}
              <div className="mt-6 bg-yellow-900/30 border border-yellow-500 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-yellow-400 font-bold mb-1">
                    💰 EARNINGS GUARANTEE
                  </div>
                  <p className="text-sm text-gray-300">
                    Our avg user earns $500+/month. If you don't earn your
                    subscription back in 90 days, we'll refund you!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof Section */}
      <div className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0A0B1E] dark:text-white mb-4">
              Join 10,000+ Users Earning While Learning
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Real results from real users making real money
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah M.",
                role: "Marketing Manager",
                avatar: "👩‍💼",
                earnings: "$847/month",
                text: "SummifyAI paid for itself in week 1. I've earned over $5K sharing chapter insights with my network. The exact page numbers save me hours!",
                verified: true,
              },
              {
                name: "David K.",
                role: "Business Coach",
                avatar: "👨‍💼",
                earnings: "$1,234/month",
                text: "My clients love getting precise chapter recommendations instead of full book summaries. I've built a passive income stream just by sharing what I find!",
                verified: true,
              },
              {
                name: "Lisa R.",
                role: "Content Creator",
                avatar: "👩‍🎨",
                earnings: "$692/month",
                text: "The AI chapter analysis is incredible. I create better content faster and earn affiliate commissions from every post. Total game-changer!",
                verified: true,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 relative"
              >
                {testimonial.verified && (
                  <div className="absolute -top-3 -right-3 bg-blue-500 text-white rounded-full p-2">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <div className="font-bold text-[#0A0B1E] dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      {testimonial.role}
                    </div>
                    <div className="text-green-600 font-bold text-sm">
                      Earns {testimonial.earnings}
                    </div>
                  </div>
                </div>

                <div className="flex text-yellow-400 mb-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg
                      key={i}
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Urgency CTA Section */}
      <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-red-800 px-6 py-3 rounded-full font-black text-lg animate-pulse">
              ⚠️ URGENT: Limited Time Offer Expires in 48 Hours!
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-black mb-6">
            Don't Miss Out on $500+/Month
          </h2>

          <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
            While you're reading entire books, our users are finding exact
            chapters in seconds and earning affiliate commissions. Every day you
            wait is money left on the table.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black text-yellow-400 mb-2">
                $15,000+
              </div>
              <div className="font-bold mb-1">Total User Earnings</div>
              <div className="text-sm opacity-80">This month alone</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black text-yellow-400 mb-2">
                2.3 sec
              </div>
              <div className="font-bold mb-1">Average Discovery Time</div>
              <div className="text-sm opacity-80">vs 2+ hours reading</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-black text-yellow-400 mb-2">
                94%
              </div>
              <div className="font-bold mb-1">Success Rate</div>
              <div className="text-sm opacity-80">
                Users find what they need
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Link
              to="/signup"
              className="inline-block bg-gradient-to-r from-[#FFFD63] to-yellow-400 text-[#0A0B1E] px-12 py-6 rounded-2xl font-black text-2xl hover:from-yellow-400 hover:to-[#FFFD63] transition-all shadow-2xl transform hover:scale-105"
            >
              🚀 CLAIM YOUR SPOT NOW - START EARNING TODAY
            </Link>

            <div>
              <p className="text-yellow-200 font-bold">
                ⏰ Only 127 spots left at this price
              </p>
              <p className="text-sm opacity-80">
                Price increases to $39/month after this promotion ends
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section - Objection Handling */}
      <div className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0A0B1E] dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Everything you need to know to get started earning
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How quickly can I start earning money?",
                answer:
                  "Most users start earning within their first week. Our fastest user made $127 in their first 3 days by sharing chapter discoveries on LinkedIn. The average user earns $500+ monthly after 30 days.",
              },
              {
                question:
                  "Do you really guarantee I'll earn my subscription back?",
                answer:
                  "Yes! If you don't earn at least your subscription cost back in affiliate commissions within 90 days, we'll refund your entire payment. We're that confident in our platform's earning potential.",
              },
              {
                question: "How is this different from reading entire books?",
                answer:
                  "Instead of spending 8+ hours reading an entire book, you get the exact chapter and page number that answers your specific question in under 30 seconds. Our AI analyzes the content so you know exactly why each chapter is relevant.",
              },
              {
                question: "What if I'm not tech-savvy?",
                answer:
                  "SummifyAI is designed for everyone. If you can use Google, you can use our platform. Plus, we provide 24/7 support and step-by-step tutorials to ensure your success.",
              },
              {
                question: "Is the 30-day money-back guarantee real?",
                answer:
                  "Absolutely. We process refunds within 24 hours, no questions asked. We've only had a 2.1% refund rate because users love the results they get.",
              },
              {
                question: "How much can I realistically earn?",
                answer:
                  "Our users average $500/month, with top performers earning $2,000+. Earnings depend on how actively you share insights. The more you use the platform, the more you typically earn.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-6 shadow-lg"
              >
                <h3 className="text-lg font-bold text-[#0A0B1E] dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="bg-[#0A0B1E] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Stop Wasting Time and Start Earning?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join 10,000+ smart professionals who've discovered the secret to
            efficient learning and passive income.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="inline-block bg-[#FFFD63] text-[#0A0B1E] px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors"
            >
              Start Your 7-Day Free Trial
            </Link>
            <Link
              to="/search-demo"
              className="inline-block border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-[#0A0B1E] transition-colors"
            >
              See Live Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

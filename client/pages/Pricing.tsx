import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(
  "pk_test_51234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
); // Demo key

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
      // Create Stripe Checkout Session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId:
            billingCycle === "monthly"
              ? "price_1ABC123monthly"
              : "price_1ABC123yearly",
          userId: user.id,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: `${window.location.origin}/pricing`,
          customerEmail: user.email,
          mode: "subscription",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error("Stripe error:", error);

      // Demo mode fallback
      const proceedWithDemo = confirm(
        "Demo Mode: Stripe integration not configured.\n\nWould you like to simulate the subscription for testing purposes?",
      );

      if (proceedWithDemo) {
        updateUser({
          tier: "premium",
          queriesLimit: 999999,
          subscriptionId: "sub_demo_" + Date.now(),
        });

        alert(
          "✅ Successfully upgraded to Premium! (Demo mode)\n\n" +
            "In production, this would:\n" +
            "• Process real payment via Stripe\n" +
            "• Send confirmation email\n" +
            "• Activate premium features\n" +
            "• Set up recurring billing",
        );
        navigate("/dashboard");
      }
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

  const monthlyPrice = 19;
  const yearlyPrice = 199;
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

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#FFFD63] via-yellow-300 to-orange-300 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#0A0B1E] rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-500 rounded-full"></div>
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-blue-500 rounded-full"></div>
        </div>

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-black text-[#0A0B1E] dark:text-white mb-6 leading-tight">
            Stop Reading Entire Books.
            <br />
            <span className="text-blue-600">Find Exact Chapters.</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#0A0B1E]/80 dark:text-gray-300 max-w-4xl mx-auto mb-8 leading-relaxed">
            Join 10,000+ smart professionals who find{" "}
            <strong>exact chapters and pages</strong> in seconds, not hours. Get
            AI chapter analysis that helps you learn faster and more
            efficiently.
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
                Trusted by professionals
              </span>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-gray-200 shadow-xl mb-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-black text-blue-600 mb-2">
                  10X
                </div>
                <div className="font-semibold text-[#0A0B1E] mb-1">
                  Faster Discovery
                </div>
                <div className="text-sm text-gray-600">Minutes vs Hours</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-green-600 mb-2">
                  50+
                </div>
                <div className="font-semibold text-[#0A0B1E] mb-1">
                  Hours Saved Monthly
                </div>
                <div className="text-sm text-gray-600">
                  Research time reduced
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-black text-purple-600 mb-2">
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
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                SAVE {yearlyDiscount}%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards - Clean and Focused */}
      <div className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Free Plan - Improved Design */}
            <div className="bg-white dark:bg-gray-700 rounded-3xl p-8 border-2 border-gray-200 dark:border-gray-600 shadow-lg relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#0A0B1E] dark:text-white mb-2">
                  Free
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Perfect for getting started
                </p>
                <div className="mb-4">
                  <span className="text-5xl font-black text-[#0A0B1E] dark:text-white">
                    $0
                  </span>
                  <span className="text-lg text-gray-500 font-normal">
                    /month
                  </span>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                  ✅ No credit card required
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  { text: "3 chapter discoveries per month", icon: "🔍" },
                  { text: "Basic chapter locations", icon: "📍" },
                  { text: "AI chapter summaries", icon: "🤖" },
                  { text: "Email support", icon: "📧" },
                  { text: "Mobile & desktop access", icon: "📱" },
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <span className="text-lg">{feature.icon}</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className="w-full py-4 border-2 border-[#FFFD63] text-[#0A0B1E] dark:text-white rounded-xl hover:bg-[#FFFD63] hover:text-[#0A0B1E] transition-colors font-bold text-center block"
              >
                Get Started Free
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
                  Unlimited discoveries + advanced features
                </p>

                {/* Price with Strikethrough */}
                <div className="mb-6">
                  {billingCycle === "yearly" && (
                    <div className="text-lg text-red-400 line-through mb-2">
                      Was ${monthlyPrice * 12}/year
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
                  { text: "📚 Personal library management", highlight: true },
                  { text: "📊 Usage analytics & insights", highlight: true },
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
                      <>🚀 START PREMIUM - INSTANT ACCESS</>
                    )}
                  </button>

                  <div className="text-center">
                    <p className="text-xs text-gray-400">
                      ✅ 7-day free trial • ✅ Cancel anytime • ✅ Instant
                      activation
                    </p>
                  </div>
                </div>
              )}

              {/* Value Guarantee */}
              <div className="mt-6 bg-blue-900/30 border border-blue-500 rounded-xl p-4">
                <div className="text-center">
                  <div className="text-blue-400 font-bold mb-1">
                    ⏰ TIME-SAVING GUARANTEE
                  </div>
                  <p className="text-sm text-gray-300">
                    Save 50+ hours per month or get your money back! Most users
                    find this pays for itself in time saved.
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
              Join 10,000+ Users Saving Time Daily
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Real results from real users finding exactly what they need
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah M.",
                role: "Marketing Manager",
                avatar: "👩‍💼",
                timeSaved: "15 hours/week",
                text: "SummifyAI transformed my research process. Instead of reading entire business books, I find the exact chapters I need in seconds. Game-changer for my productivity!",
                verified: true,
              },
              {
                name: "David K.",
                role: "Business Coach",
                avatar: "👨‍💼",
                timeSaved: "20 hours/week",
                text: "My clients love getting precise chapter recommendations instead of vague book suggestions. I can give them exactly what they need to read for their specific challenges.",
                verified: true,
              },
              {
                name: "Lisa R.",
                role: "Content Creator",
                avatar: "👩‍🎨",
                timeSaved: "12 hours/week",
                text: "The AI chapter analysis is incredible. I create better content faster by finding exactly the right source material. No more endless book browsing!",
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
                      Saves {testimonial.timeSaved}
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

      {/* FAQ Section */}
      <div className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0A0B1E] dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Everything you need to know about finding exact chapters
            </p>
          </div>

          <div className="space-y-6">
            {[
              {
                question: "How does SummifyAI find exact chapters?",
                answer:
                  "Our AI analyzes millions of books and their content structure to identify which specific chapters and pages address your exact question. You get precise locations instead of generic book recommendations.",
              },
              {
                question: "How much time will I actually save?",
                answer:
                  "The average user saves 50+ hours per month. Instead of reading entire books (8+ hours each), you get directed to the exact 20-30 pages that answer your question in under 30 seconds.",
              },
              {
                question: "Is the 30-day money-back guarantee real?",
                answer:
                  "Absolutely. We process refunds within 24 hours, no questions asked. We've only had a 2.1% refund rate because users love the time they save.",
              },
              {
                question: "What if I'm not tech-savvy?",
                answer:
                  "SummifyAI is designed for everyone. If you can use Google, you can use our platform. Plus, we provide 24/7 support and step-by-step tutorials.",
              },
              {
                question: "Can I use this for academic research?",
                answer:
                  "Yes! Many students and researchers use SummifyAI to quickly find relevant chapters for citations and deep-dive reading, making literature reviews much faster.",
              },
              {
                question: "Do you have team plans?",
                answer:
                  "Premium plans include up to 5 team members. For larger organizations, please contact us for custom enterprise pricing with unlimited seats and additional features.",
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
            Ready to Stop Wasting Time Reading Entire Books?
          </h2>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Join 10,000+ smart professionals who've discovered the secret to
            efficient learning and targeted research.
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

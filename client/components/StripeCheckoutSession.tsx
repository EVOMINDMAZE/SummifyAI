import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/contexts/AuthContext";

interface StripeCheckoutSessionProps {
  plan: {
    id: string;
    name: string;
    price: number;
    stripeMonthlyId: string;
    stripeAnnualId: string;
  };
  billingCycle: "monthly" | "annual";
  onSuccess: () => void;
  onCancel: () => void;
}

const StripeCheckoutSession: React.FC<StripeCheckoutSessionProps> = ({
  plan,
  billingCycle,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!stripePublishableKey) {
    return (
      <div className="text-center p-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-yellow-800 dark:text-yellow-200">
            ⚠️ Stripe is not configured. Please add your Stripe publishable key to environment variables.
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
            See STRIPE_SETUP_GUIDE.md for setup instructions.
          </p>
        </div>
      </div>
    );
  }

  const handleCheckout = async () => {
    if (!user) {
      setError("Please log in to continue");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const priceId = billingCycle === "monthly" ? plan.stripeMonthlyId : plan.stripeAnnualId;
      
      // Create checkout session
      const response = await fetch("/.netlify/functions/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          customerId: user.stripeCustomerId,
          customerEmail: user.email,
          successUrl: `${window.location.origin}/settings?success=true&plan=${plan.id}`,
          cancelUrl: `${window.location.origin}/settings?cancelled=true`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(stripePublishableKey);
      
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const annualPrice = Math.round(plan.price * 12 * 0.83); // 17% discount
  const currentPrice = billingCycle === "monthly" ? plan.price : annualPrice;
  const savings = billingCycle === "annual" ? (plan.price * 12 - annualPrice) : 0;

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Upgrade to {plan.name}
        </h3>
        <div className="text-3xl font-black text-gray-900 dark:text-white mb-1">
          ${currentPrice}
          <span className="text-lg font-normal text-gray-600 dark:text-gray-400">
            /{billingCycle === "monthly" ? "month" : "year"}
          </span>
        </div>
        {billingCycle === "annual" && (
          <p className="text-green-600 dark:text-green-400 text-sm font-medium">
            Save ${savings}/year with annual billing
          </p>
        )}
      </div>

      {/* Features Summary */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
          What's included:
        </h4>
        <div className="space-y-2">
          {plan.id === "scholar" && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">500 searches per month</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Advanced AI insights</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Priority processing</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Export results to PDF</span>
              </div>
            </>
          )}
          {plan.id === "professional" && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">2,000 searches per month</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Premium AI models</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">API access</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Priority support</span>
              </div>
            </>
          )}
          {plan.id === "institution" && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Unlimited searches</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Team collaboration</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">White-label options</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                <span className="text-gray-700 dark:text-gray-300">Dedicated support</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium">Secured by Stripe</span>
        </div>
        <p className="text-sm text-green-600 dark:text-green-400 mt-1">
          Your payment information is encrypted and secure. Cancel anytime.
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full py-3 bg-gradient-to-r from-[#FFFD63] to-yellow-400 hover:from-yellow-400 hover:to-[#FFFD63] text-[#0A0B1E] rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
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
            <>🔒 Subscribe to {plan.name} - ${currentPrice}</>
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      {/* Terms */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
        By subscribing, you agree to our Terms of Service and Privacy Policy.
        You can cancel anytime from your account settings.
      </p>
    </div>
  );
};

export default StripeCheckoutSession;

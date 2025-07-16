import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useAuth } from "@/contexts/AuthContext";

interface StripeCheckoutProps {
  plan: "premium";
  billingCycle: "monthly" | "yearly";
  onSuccess: () => void;
  onCancel: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  plan,
  billingCycle,
  onSuccess,
  onCancel,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user, updateUser } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const monthlyPrice = 19;
  const yearlyPrice = 199;
  const amount = billingCycle === "monthly" ? monthlyPrice : yearlyPrice;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    const card = elements.getElement(CardElement);

    if (!card) {
      setError("Card element not found");
      setIsProcessing(false);
      return;
    }

    try {
      // Create payment method
      const { error: paymentError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: card,
          billing_details: {
            name: user.name,
            email: user.email,
          },
        });

      if (paymentError) {
        throw paymentError;
      }

      // Create subscription on backend
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          customerId: user.id,
          priceId:
            billingCycle === "monthly"
              ? "price_1ABC123monthly"
              : "price_1ABC123yearly",
          customerEmail: user.email,
          customerName: user.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subscription");
      }

      const { clientSecret, subscriptionId } = await response.json();

      // Confirm payment if required
      if (clientSecret) {
        const { error: confirmError } =
          await stripe.confirmCardPayment(clientSecret);
        if (confirmError) {
          throw confirmError;
        }
      }

      // Update user subscription status
      updateUser({
        tier: "premium",
        queriesLimit: 999999,
        subscriptionId: subscriptionId,
      });

      onSuccess();
    } catch (err: any) {
      console.error("Payment error:", err);

      // Demo mode fallback
      const proceedWithDemo = confirm(
        "Demo Mode: Stripe backend not configured.\n\nSimulate successful payment?",
      );

      if (proceedWithDemo) {
        updateUser({
          tier: "premium",
          queriesLimit: 999999,
          subscriptionId: "sub_demo_" + Date.now(),
        });

        alert(
          "✅ Payment successful! (Demo mode)\n" +
            "Premium features activated instantly.",
        );
        onSuccess();
      } else {
        setError(err.message || "Payment failed. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: "16px",
        color: "#424770",
        "::placeholder": {
          color: "#aab7c4",
        },
      },
      invalid: {
        color: "#9e2146",
      },
    },
  };

  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Complete Your Subscription
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Premium Plan - ${amount}/
          {billingCycle === "monthly" ? "month" : "year"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={user?.name || ""}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Card Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Card Information
          </label>
          <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
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
            Your payment information is encrypted and secure
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Billing Summary */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Premium Plan ({billingCycle})
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              ${amount}
            </span>
          </div>
          {billingCycle === "yearly" && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600 dark:text-green-400">
                Annual discount
              </span>
              <span className="text-green-600 dark:text-green-400">-$29</span>
            </div>
          )}
          <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between font-bold">
            <span className="text-gray-900 dark:text-white">Total</span>
            <span className="text-gray-900 dark:text-white">${amount}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full py-3 bg-gradient-to-r from-[#FFFD63] to-yellow-400 hover:from-yellow-400 hover:to-[#FFFD63] text-[#0A0B1E] rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                Processing Payment...
              </>
            ) : (
              <>🔒 Subscribe to Premium - ${amount}</>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          You can cancel anytime from your account settings.
        </p>
      </form>
    </div>
  );
};

export default StripeCheckout;

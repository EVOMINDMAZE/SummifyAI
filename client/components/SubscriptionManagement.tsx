import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface SubscriptionData {
  tier: string;
  status: string;
  nextBillingDate?: string;
  amount?: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export default function SubscriptionManagement() {
  const { user, updateUser } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Plan configurations
  const plans = [
    {
      id: "free",
      name: "Free",
      price: 0,
      monthlySearches: 10,
      features: [
        "10 searches per month",
        "Basic AI insights",
        "Search history",
      ],
      color: "bg-gray-100 dark:bg-gray-800",
      textColor: "text-gray-900 dark:text-white",
    },
    {
      id: "scholar",
      name: "Scholar",
      price: 19.99,
      monthlySearches: 500,
      features: [
        "500 searches per month",
        "Advanced AI insights",
        "Priority processing",
        "Export results",
      ],
      color: "bg-amber-100 dark:bg-amber-900",
      textColor: "text-amber-900 dark:text-amber-100",
      stripeMonthlyId:
        import.meta.env.VITE_STRIPE_SCHOLAR_MONTHLY_PRICE_ID ||
        "price_scholar_monthly",
      stripeAnnualId:
        import.meta.env.VITE_STRIPE_SCHOLAR_ANNUAL_PRICE_ID ||
        "price_scholar_annual",
    },
    {
      id: "professional",
      name: "Professional",
      price: 49.99,
      monthlySearches: 2000,
      features: [
        "2,000 searches per month",
        "Premium AI models",
        "API access",
        "Custom models",
        "Priority support",
      ],
      color: "bg-green-100 dark:bg-green-900",
      textColor: "text-green-900 dark:text-green-100",
      stripeMonthlyId:
        import.meta.env.VITE_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID ||
        "price_professional_monthly",
      stripeAnnualId:
        import.meta.env.VITE_STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID ||
        "price_professional_annual",
    },
    {
      id: "institution",
      name: "Institution",
      price: 99.99,
      monthlySearches: -1,
      features: [
        "Unlimited searches",
        "All AI models",
        "Team collaboration",
        "White-label options",
        "Dedicated support",
      ],
      color: "bg-purple-100 dark:bg-purple-900",
      textColor: "text-purple-900 dark:text-purple-100",
      stripeMonthlyId:
        import.meta.env.VITE_STRIPE_INSTITUTION_MONTHLY_PRICE_ID ||
        "price_institution_monthly",
      stripeAnnualId:
        import.meta.env.VITE_STRIPE_INSTITUTION_ANNUAL_PRICE_ID ||
        "price_institution_annual",
    },
  ];

  useEffect(() => {
    loadSubscriptionData();
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Get subscription data from user profile
      const subscriptionData: SubscriptionData = {
        tier: user.planType || "free",
        status: user.subscriptionStatus || "active",
        nextBillingDate: user.subscriptionEndDate,
        stripeCustomerId: user.stripeCustomerId,
        stripeSubscriptionId: user.stripeSubscriptionId,
      };

      setSubscription(subscriptionData);
    } catch (error) {
      console.error("Error loading subscription data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanChange = async (newPlan: string) => {
    if (!user || isUpdating) return;

    setIsUpdating(true);
    try {
      // In a real implementation, you would integrate with Stripe here
      // For now, we'll simulate the upgrade/downgrade

      if (newPlan === "free") {
        // Downgrade to free
        await updateUser({
          planType: "free",
          monthlySearchLimit: 10,
          subscriptionStatus: "cancelled",
          stripeSubscriptionId: undefined,
        });

        setSubscription((prev) =>
          prev ? { ...prev, tier: "free", status: "active" } : null,
        );

        alert(
          "Successfully downgraded to Free plan. Your subscription has been cancelled.",
        );
      } else {
        // Upgrade to paid plan
        const selectedPlan = plans.find((p) => p.id === newPlan);
        if (!selectedPlan) return;

        // In production, this would redirect to Stripe Checkout
        const confirmUpgrade = confirm(
          `Upgrade to ${selectedPlan.name} plan for $${selectedPlan.price}/month?\n\nThis would redirect to Stripe Checkout in a real implementation.`,
        );

        if (confirmUpgrade) {
          await updateUser({
            planType: newPlan as
              | "free"
              | "scholar"
              | "professional"
              | "institution",
            monthlySearchLimit:
              selectedPlan.monthlySearches === -1
                ? 999999
                : selectedPlan.monthlySearches,
            subscriptionStatus: "active",
            stripeCustomerId: `cus_${Date.now()}`, // Simulated Stripe customer ID
            stripeSubscriptionId: `sub_${Date.now()}`, // Simulated Stripe subscription ID
          });

          setSubscription((prev) =>
            prev ? { ...prev, tier: newPlan, status: "active" } : null,
          );

          alert(`Successfully upgraded to ${selectedPlan.name} plan!`);
        }
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      alert("Failed to update subscription. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getCurrentPlan = () => {
    return plans.find(
      (p) => p.id === (subscription?.tier || user?.planType || "free"),
    );
  };

  const currentPlan = getCurrentPlan();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 dark:bg-gray-700 rounded"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Current Plan Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Current Subscription
        </h2>

        {currentPlan && (
          <div className={`${currentPlan.color} rounded-xl p-6 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-xl font-bold ${currentPlan.textColor}`}>
                  {currentPlan.name} Plan
                </h3>
                <p className={`${currentPlan.textColor} opacity-80`}>
                  {currentPlan.price === 0
                    ? "Free forever"
                    : `$${currentPlan.price}/month`}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  subscription?.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {subscription?.status === "active" ? "Active" : "Inactive"}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p
                  className={`text-sm ${currentPlan.textColor} opacity-80 mb-1`}
                >
                  Monthly Searches
                </p>
                <p className={`font-semibold ${currentPlan.textColor}`}>
                  {currentPlan.monthlySearches === -1
                    ? "Unlimited"
                    : currentPlan.monthlySearches.toLocaleString()}
                </p>
              </div>
              <div>
                <p
                  className={`text-sm ${currentPlan.textColor} opacity-80 mb-1`}
                >
                  Used This Month
                </p>
                <p className={`font-semibold ${currentPlan.textColor}`}>
                  {user?.searchCount || 0} /{" "}
                  {currentPlan.monthlySearches === -1
                    ? "∞"
                    : currentPlan.monthlySearches}
                </p>
              </div>
              {subscription?.nextBillingDate && (
                <div className="md:col-span-2">
                  <p
                    className={`text-sm ${currentPlan.textColor} opacity-80 mb-1`}
                  >
                    Next Billing Date
                  </p>
                  <p className={`font-semibold ${currentPlan.textColor}`}>
                    {new Date(
                      subscription.nextBillingDate,
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Available Plans */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Available Plans
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan =
              plan.id === (subscription?.tier || user?.planType || "free");

            return (
              <div
                key={plan.id}
                className={`relative border-2 rounded-xl p-6 transition-all ${
                  isCurrentPlan
                    ? "border-[#FFFD63] bg-[#FFFD63]/5"
                    : "border-gray-200 dark:border-gray-700 hover:border-[#FFFD63]/50"
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#FFFD63] text-[#0A0B1E] px-3 py-1 rounded-full text-sm font-bold">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-3">
                    <span className="text-3xl font-black text-gray-900 dark:text-white">
                      {plan.price === 0 ? "Free" : `$${plan.price}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        /month
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {plan.monthlySearches === -1
                      ? "Unlimited"
                      : plan.monthlySearches}{" "}
                    searches per month
                  </p>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <svg
                        className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanChange(plan.id)}
                  disabled={isCurrentPlan || isUpdating}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    isCurrentPlan
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                      : plan.id === "free"
                        ? "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                        : "bg-[#FFFD63] hover:bg-[#FFFD63]/90 text-[#0A0B1E]"
                  } disabled:opacity-50`}
                >
                  {isUpdating
                    ? "Processing..."
                    : isCurrentPlan
                      ? "Current Plan"
                      : plan.id === "free"
                        ? "Downgrade to Free"
                        : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Billing History
        </h2>

        <div className="text-center py-8">
          <svg
            className="w-12 h-12 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 dark:text-gray-400">
            No billing history available yet
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Your billing history will appear here once you subscribe to a paid
            plan
          </p>
        </div>
      </div>
    </div>
  );
}

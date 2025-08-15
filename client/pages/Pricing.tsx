import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import StripeCheckout from "@/components/StripeCheckout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Zap, Crown } from "lucide-react";
import { stripeProducts, getProductByName } from "../../src/stripe-config";

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "Free",
      subtitle: "Perfect for getting started",
      description: "Ideal for students and casual researchers",
      icon: "🚀",
      iconColor: "bg-blue-500",
      features: [
        "10 AI-powered searches per month",
        "Access to full chapter content",
        "Basic AI insights and analysis",
        "Search history tracking",
        "Mobile-friendly interface",
      ],
      cta: "Start Free Forever",
      popular: false,
    },
    {
      id: "scholar",
      name: "Scholar",
      price: "$19.99",
      subtitle: "Most popular choice",
      description: "For professionals and serious researchers",
      icon: "📚",
      iconColor: "bg-amber-500",
      features: [
        "500 AI-powered searches per month",
        "Advanced AI insights and analysis",
        "Priority search processing",
        "Export results to various formats",
        "Advanced search filters",
        "Email support",
        "Search analytics dashboard",
      ],
      cta: "Start 14-Day Free Trial",
      popular: true,
      trial: true,
    },
    {
      id: "professional",
      name: "Professional",
      price: "$29.99",
      subtitle: "For power users",
      description: "Advanced features for professional researchers",
      icon: "⚡",
      iconColor: "bg-green-500",
      features: [
        "2,000 AI-powered searches per month",
        "Premium AI models access",
        "Advanced search filters and analytics",
        "API access for integrations",
        "Priority customer support",
        "Bulk export capabilities",
        "Custom search models",
        "Advanced reporting dashboard",
      ],
      cta: "Upgrade to Professional",
      popular: false,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$99.99",
      subtitle: "For teams and organizations",
      description: "Enterprise-grade research capabilities",
      icon: "👑",
      iconColor: "bg-purple-500",
      features: [
        "Unlimited AI-powered searches",
        "All premium AI models",
        "Dedicated account manager",
        "Custom integrations and APIs",
        "Team collaboration features",
        "Advanced analytics and reporting",
        "White-label options",
        "SLA guarantee",
        "Custom training and onboarding",
      ],
      cta: "Contact Sales",
      popular: false,
      customPricing: true,
    },
  ];

  const handlePlanSelect = (planId: string) => {
    if (planId === "free") {
      if (!user) {
        navigate("/signup");
      } else {
        navigate("/dashboard");
      }
      return;
    }

    if (planId === "enterprise") {
      navigate("/contact");
      return;
    }

    if (!user) {
      navigate("/signup");
      return;
    }

    // Find the corresponding Stripe product
    const stripeProduct = getProductByName(planId);
    if (stripeProduct) {
      setSelectedProduct(planId);
    }
  };

  const handleCheckoutSuccess = () => {
    setSelectedProduct(null);
    navigate("/checkout/success");
  };

  const handleCheckoutCancel = () => {
    setSelectedProduct(null);
  };

  // If a product is selected, show checkout
  if (selectedProduct) {
    const stripeProduct = getProductByName(selectedProduct);
    if (stripeProduct) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Navigation />
          <div className="max-w-2xl mx-auto px-4 py-16">
            <div className="text-center mb-8">
              <Button
                variant="ghost"
                onClick={() => setSelectedProduct(null)}
                className="mb-4"
              >
                ← Back to Plans
              </Button>
            </div>
            <StripeCheckout
              product={stripeProduct}
              onSuccess={handleCheckoutSuccess}
              onCancel={handleCheckoutCancel}
            />
          </div>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#FFFD63]/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-[#0A0B1E] dark:text-white mb-6">
          Find the perfect plan for your research needs
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
          Unlock the full potential of AI-powered chapter discovery with plans
          designed for every type of researcher
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {plans.map((plan) => {
            const isCurrentPlan = user?.planType === plan.id;
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl overflow-hidden ${
                  isPopular
                    ? "border-[#FFFD63] ring-4 ring-[#FFFD63]/20 transform scale-105"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-0 left-0 right-0">
                    <div className="bg-gradient-to-r from-[#FFFD63] to-amber-400 text-[#0A0B1E] text-center py-3 font-bold text-sm tracking-wide">
                      ⭐ MOST POPULAR
                    </div>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white">
                      Current Plan
                    </Badge>
                  </div>
                )}

                <div className={`p-6 ${isPopular ? "pt-12" : "pt-8"}`}>
                  {/* Icon */}
                  <div
                    className={`w-16 h-16 ${plan.iconColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}
                  >
                    <span className="text-3xl">{plan.icon}</span>
                  </div>

                  {/* Plan Name & Price */}
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <div className="mb-2">
                      <span className="text-4xl font-black text-gray-900 dark:text-white">
                        {plan.price}
                      </span>
                      {plan.price !== "Free" && !plan.customPricing && (
                        <span className="text-gray-600 dark:text-gray-400 ml-1">
                          /month
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-amber-600 dark:text-amber-400">
                      {plan.subtitle}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={isCurrentPlan}
                    className={`w-full py-4 px-6 rounded-xl font-bold transition-all duration-300 ${
                      isPopular
                        ? "bg-[#FFFD63] hover:bg-[#FFFD63]/90 text-[#0A0B1E] shadow-lg hover:shadow-xl"
                        : plan.id === "free"
                          ? "bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                          : "bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-white shadow-lg hover:shadow-xl"
                    } ${isCurrentPlan ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {isCurrentPlan ? "Current Plan" : plan.cta}
                  </Button>

                  {plan.trial && !isCurrentPlan && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                      14-day free trial included
                    </p>
                  )}

                  {plan.customPricing && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                      Custom pricing available
                    </p>
                  )}

                  {plan.id === "free" && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3">
                      No credit card required
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <Card className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
            Compare all features
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-4 text-lg font-bold text-gray-900 dark:text-white">
                    Features
                  </th>
                  <th className="text-center py-4 text-lg font-bold text-gray-900 dark:text-white">
                    Free
                  </th>
                  <th className="text-center py-4 text-lg font-bold text-gray-900 dark:text-white">
                    Scholar
                  </th>
                  <th className="text-center py-4 text-lg font-bold text-gray-900 dark:text-white">
                    Professional
                  </th>
                  <th className="text-center py-4 text-lg font-bold text-gray-900 dark:text-white">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">
                    Monthly searches
                  </td>
                  <td className="py-4 text-center text-gray-600 dark:text-gray-400">
                    10
                  </td>
                  <td className="py-4 text-center text-gray-600 dark:text-gray-400">
                    500
                  </td>
                  <td className="py-4 text-center text-gray-600 dark:text-gray-400">
                    2,000
                  </td>
                  <td className="py-4 text-center text-gray-600 dark:text-gray-400">
                    Unlimited
                  </td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">
                    AI-powered insights
                  </td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">
                    Advanced AI models
                  </td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">
                    Priority processing
                  </td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">
                    API access
                  </td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">
                    Team collaboration
                  </td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Frequently Asked Questions
        </h2>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can upgrade or downgrade your plan at any time. Changes
                take effect immediately, and we'll prorate your billing
                accordingly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                What happens if I exceed my search limit?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                If you reach your monthly search limit, you can either upgrade
                your plan or wait until the next billing cycle. We'll send you
                notifications as you approach your limit.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                Do you offer discounts for students or nonprofits?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! We offer special pricing for students and nonprofit
                organizations. Contact our sales team for more information about
                available discounts.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
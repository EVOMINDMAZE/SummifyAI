import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function Pricing() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'Free',
      subtitle: 'Perfect for getting started',
      description: 'Ideal for students and casual researchers',
      icon: '🚀',
      iconColor: 'bg-blue-500',
      features: [
        '10 AI-powered searches per month',
        'Access to full chapter content',
        'Basic AI insights and analysis',
        'Search history tracking',
        'Mobile-friendly interface'
      ],
      cta: 'Start Free Forever',
      ctaAction: 'signup',
      popular: false
    },
    {
      id: 'scholar',
      name: 'Scholar',
      price: '$19.99',
      priceId: 'price_scholar_monthly', // Replace with your actual Stripe price ID
      subtitle: 'Most popular choice',
      description: 'For professionals and serious researchers',
      icon: '📚',
      iconColor: 'bg-yellow-500',
      features: [
        '500 AI-powered searches per month',
        'Advanced AI insights and analysis',
        'Priority search processing',
        'Export results to various formats',
        'Advanced search filters',
        'Email support',
        'Search analytics dashboard'
      ],
      cta: 'Start 14-Day Free Trial',
      ctaAction: 'trial',
      popular: true,
      trial: true
    },
    {
      id: 'professional',
      name: 'Professional',
      price: '$49.99',
      priceId: 'price_professional_monthly', // Replace with your actual Stripe price ID
      subtitle: 'For power users',
      description: 'Advanced features for professional researchers',
      icon: '⚡',
      iconColor: 'bg-green-500',
      features: [
        '2,000 AI-powered searches per month',
        'Premium AI models access',
        'Advanced search filters and analytics',
        'API access for integrations',
        'Priority customer support',
        'Bulk export capabilities',
        'Custom search models',
        'Advanced reporting dashboard'
      ],
      cta: 'Upgrade to Professional',
      ctaAction: 'upgrade',
      popular: false
    },
    {
      id: 'institution',
      name: 'Institution',
      price: '$99.99',
      priceId: 'price_institution_monthly', // Replace with your actual Stripe price ID
      subtitle: 'For teams and organizations',
      description: 'Enterprise-grade research capabilities',
      icon: '👑',
      iconColor: 'bg-purple-500',
      features: [
        'Unlimited AI-powered searches',
        'All premium AI models',
        'Dedicated account manager',
        'Custom integrations and APIs',
        'Team collaboration features',
        'Advanced analytics and reporting',
        'White-label options',
        'SLA guarantee',
        'Custom training and onboarding'
      ],
      cta: 'Contact Sales',
      ctaAction: 'contact',
      popular: false,
      customPricing: true
    }
  ];

  const handlePlanSelect = async (plan: any) => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      if (plan.ctaAction === 'signup') {
        navigate('/signup');
      } else if (plan.ctaAction === 'contact') {
        navigate('/contact');
      } else if (plan.ctaAction === 'trial' || plan.ctaAction === 'upgrade') {
        if (!user) {
          navigate('/signup');
          return;
        }
        
        // In a real implementation, you would integrate with Stripe here
        // Example:
        // const stripe = await loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);
        // const response = await fetch('/api/create-checkout-session', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ priceId: plan.priceId, userId: user.id })
        // });
        // const session = await response.json();
        // await stripe.redirectToCheckout({ sessionId: session.id });
        
        alert(`Redirecting to ${plan.name} subscription checkout...`);
      }
    } catch (error) {
      console.error('Error selecting plan:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#FFFD63]/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <span className="text-[#0A0B1E] font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                SummifyIO
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium"
                  >
                    Sign In
                  </Link>
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

      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-black text-[#0A0B1E] dark:text-white mb-6">
          Find the perfect plan for your research needs
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
          Unlock the full potential of AI-powered chapter discovery with plans designed for every type of researcher
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white dark:bg-gray-800 rounded-3xl shadow-lg border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                plan.popular
                  ? 'border-[#FFFD63] ring-4 ring-[#FFFD63]/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#FFFD63] text-[#0A0B1E] px-4 py-1 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                {/* Icon */}
                <div className={`w-16 h-16 ${plan.iconColor} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
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
                    {plan.price !== 'Free' && !plan.customPricing && (
                      <span className="text-gray-600 dark:text-gray-400 ml-1">
                        /month
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#FFFD63]">
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
                      <svg
                        className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isProcessing}
                  className={`w-full py-3 px-6 rounded-xl font-bold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-[#FFFD63] hover:bg-[#FFFD63]/90 text-[#0A0B1E] transform hover:scale-105'
                      : plan.id === 'free'
                      ? 'bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white'
                      : 'bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? 'Processing...' : plan.cta}
                </button>

                {plan.trial && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    14-day free trial included
                  </p>
                )}

                {plan.customPricing && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    Custom pricing available
                  </p>
                )}

                {plan.id === 'free' && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    No credit card required
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <div className="max-w-7xl mx-auto px-6 pb-16">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8">
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
                    Institution
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">Monthly searches</td>
                  <td className="py-4 text-center text-gray-600 dark:text-gray-400">10</td>
                  <td className="py-4 text-center text-gray-600 dark:text-gray-400">500</td>
                  <td className="py-4 text-center text-gray-600 dark:text-gray-400">2,000</td>
                  <td className="py-4 text-center text-gray-600 dark:text-gray-400">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">AI-powered insights</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">Advanced AI models</td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">Priority processing</td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">Custom search models</td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">Export capabilities</td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">Advanced filters</td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                </tr>
                <tr>
                  <td className="py-4 font-medium text-gray-900 dark:text-white">Analytics dashboard</td>
                  <td className="py-4 text-center">❌</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                  <td className="py-4 text-center">✅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          Frequently Asked Questions
        </h2>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              Can I change my plan anytime?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              What happens if I exceed my search limit?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              If you reach your monthly search limit, you can either upgrade your plan or wait until the next billing cycle. We'll send you notifications as you approach your limit.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
              Do you offer discounts for students or nonprofits?
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Yes! We offer special pricing for students and nonprofit organizations. Contact our sales team for more information about available discounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

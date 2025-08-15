import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<any>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Refresh user data to get updated subscription info
    const refreshData = async () => {
      if (user) {
        try {
          await refreshUser();
          // Give the webhook a moment to process
          setTimeout(async () => {
            await refreshUser();
            setIsLoading(false);
          }, 2000);
        } catch (error) {
          console.error("Failed to refresh user data:", error);
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    refreshData();
  }, [user, refreshUser]);

  const getPlanName = () => {
    if (!user?.planType) return "Premium";
    return user.planType.charAt(0).toUpperCase() + user.planType.slice(1);
  };

  const getPlanFeatures = () => {
    switch (user?.planType) {
      case 'scholar':
        return [
          '500 searches per month',
          'Advanced AI insights',
          'Priority processing',
          'Export results',
        ];
      case 'professional':
        return [
          '2,000 searches per month',
          'Premium AI models',
          'API access',
          'Custom models',
          'Priority support',
        ];
      case 'institution':
        return [
          'Unlimited searches',
          'All AI models',
          'Team collaboration',
          'White-label options',
          'Dedicated support',
        ];
      default:
        return [
          'Premium features activated',
          'Enhanced search capabilities',
          'Priority support',
        ];
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navigation />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Card>
            <CardContent className="p-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Please Sign In
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Sign in to view your subscription details.
              </p>
              <Link to="/signin">
                <Button className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E]">
                  Sign In
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎉 Welcome to {getPlanName()}!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your subscription has been activated successfully
          </p>
        </div>

        {/* Subscription Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFFD63]" />
              Your New Plan Features
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFFD63]"></div>
                <span className="ml-3 text-gray-600 dark:text-gray-400">
                  Loading your subscription details...
                </span>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Plan: {getPlanName()}
                  </h3>
                  <ul className="space-y-2">
                    {getPlanFeatures().map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Account Status
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Status:</span>
                      <span className="font-medium text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Plan:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {getPlanName()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Searches Used:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {user.searchCount} / {user.monthlySearchLimit === 999999 ? '∞' : user.monthlySearchLimit}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🔍</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Start Searching
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Begin discovering exact chapters from thousands of books
                </p>
                <Link to="/search">
                  <Button size="sm" className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E]">
                    Start Searching
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  View Dashboard
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Track your usage and manage your account
                </p>
                <Link to="/dashboard">
                  <Button size="sm" variant="outline">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Manage Subscription
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Update billing and subscription settings
                </p>
                <Link to="/settings">
                  <Button size="sm" variant="outline">
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Info (for debugging) */}
        {sessionId && (
          <Card className="bg-gray-50 dark:bg-gray-800">
            <CardContent className="p-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Session ID: {sessionId}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CheckoutSuccess;
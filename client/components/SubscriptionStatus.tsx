import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Crown, Calendar, CreditCard } from "lucide-react";

interface SubscriptionData {
  subscription_status: string;
  price_id: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  payment_method_brand?: string;
  payment_method_last4?: string;
}

export default function SubscriptionStatus() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSubscriptionData();
    }
  }, [user]);

  const loadSubscriptionData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('stripe_user_subscriptions')
        .select('*')
        .maybeSingle();

      if (error) {
        console.error('Error loading subscription:', error);
        return;
      }

      setSubscription(data);
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanName = () => {
    if (!subscription?.price_id) return user?.planType || 'Free';
    
    // Map price IDs to plan names
    const priceIdMap: Record<string, string> = {
      'price_1RobHbDEMsXB9pF0WUK8SzZb': 'Scholar',
      'price_1RoubeDEMsXB9pF0W6wzgCFX': 'Professional', 
      'price_1RoudgDEMsXB9pF0WqO4Dt4L': 'Enterprise',
    };

    return priceIdMap[subscription.price_id] || 'Premium';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'trialing':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'past_due':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'canceled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const planName = getPlanName();
  const isFreePlan = !subscription || planName === 'Free';

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#FFFD63]" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {planName} Plan
              </span>
            </div>
            
            {subscription && (
              <Badge className={getStatusColor(subscription.subscription_status)}>
                {subscription.subscription_status}
              </Badge>
            )}
          </div>

          {isFreePlan ? (
            <Link to="/pricing">
              <Button size="sm" className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E]">
                Upgrade
              </Button>
            </Link>
          ) : (
            <Link to="/settings">
              <Button size="sm" variant="outline">
                Manage
              </Button>
            </Link>
          )}
        </div>

        {/* Additional subscription details */}
        {subscription && (
          <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {subscription.current_period_end && (
              <div className="flex items-center gap-2">
                <Calendar className="w-3 h-3" />
                <span>
                  {subscription.cancel_at_period_end ? 'Expires' : 'Renews'} on{' '}
                  {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                </span>
              </div>
            )}
            
            {subscription.payment_method_brand && subscription.payment_method_last4 && (
              <div className="flex items-center gap-2">
                <CreditCard className="w-3 h-3" />
                <span>
                  {subscription.payment_method_brand} ending in {subscription.payment_method_last4}
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
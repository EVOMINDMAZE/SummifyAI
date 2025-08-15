import React, { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CreditCard, Shield } from "lucide-react";
import { stripeProducts, type StripeProduct } from "../../src/stripe-config";

interface StripeCheckoutProps {
  product: StripeProduct;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const StripeCheckout: React.FC<StripeCheckoutProps> = ({
  product,
  onSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!user) {
      setError("Please sign in to continue");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get user session token
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session found");
      }

      // Create checkout session
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          price_id: product.priceId,
          mode: product.mode,
          success_url: `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/pricing`,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to create checkout session');
      }

      if (!data?.url) {
        throw new Error('No checkout URL received');
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getPriceDisplay = () => {
    switch (product.name) {
      case 'Scholar':
        return '$19.99';
      case 'Professional':
        return '$29.99';
      case 'Enterprise':
        return '$99.99';
      default:
        return 'Contact us';
    }
  };

  const getFeatures = () => {
    switch (product.name) {
      case 'Scholar':
        return [
          '500 searches per month',
          'Advanced AI insights',
          'Priority processing',
          'Export results',
        ];
      case 'Professional':
        return [
          '2,000 searches per month',
          'Premium AI models',
          'API access',
          'Custom models',
          'Priority support',
        ];
      case 'Enterprise':
        return [
          'Unlimited searches',
          'All AI models',
          'Team collaboration',
          'White-label options',
          'Dedicated support',
        ];
      default:
        return [];
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">
          Upgrade to {product.name}
        </CardTitle>
        <div className="text-3xl font-bold text-primary">
          {getPriceDisplay()}
          <span className="text-lg font-normal text-muted-foreground">
            /month
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Features */}
        <div className="space-y-3">
          <h4 className="font-semibold">What's included:</h4>
          <ul className="space-y-2">
            {getFeatures().map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm">
                <span className="text-green-500">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Security Notice */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">Secured by Stripe</span>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-1">
            Your payment information is encrypted and secure. Cancel anytime.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Checkout Button */}
        <Button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full h-12 bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] font-bold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Subscribe to {product.name}
            </>
          )}
        </Button>

        {/* Cancel Button */}
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full"
          >
            Cancel
          </Button>
        )}

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          You can cancel anytime from your account settings.
        </p>
      </CardContent>
    </Card>
  );
};

export default StripeCheckout;
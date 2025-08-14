import type { Handler } from "@netlify/functions";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Map Stripe price IDs to plan details
const getPlanFromPriceId = (priceId: string) => {
  const priceMapping: Record<string, { plan: string; limit: number }> = {
    // Scholar Plan
    [process.env.STRIPE_SCHOLAR_MONTHLY_PRICE_ID!]: {
      plan: "scholar",
      limit: 500,
    },
    [process.env.STRIPE_SCHOLAR_ANNUAL_PRICE_ID!]: {
      plan: "scholar",
      limit: 500,
    },

    // Professional Plan
    [process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID!]: {
      plan: "professional",
      limit: 2000,
    },
    [process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID!]: {
      plan: "professional",
      limit: 2000,
    },

    // Institution Plan
    [process.env.STRIPE_INSTITUTION_MONTHLY_PRICE_ID!]: {
      plan: "institution",
      limit: 999999,
    },
    [process.env.STRIPE_INSTITUTION_ANNUAL_PRICE_ID!]: {
      plan: "institution",
      limit: 999999,
    },
  };

  return priceMapping[priceId] || { plan: "free", limit: 10 };
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const sig = event.headers["stripe-signature"];

  if (!sig) {
    console.error("Missing stripe-signature header");
    return { statusCode: 400, body: "Missing signature" };
  }

  try {
    // Verify webhook signature
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body!,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    console.log(`Processing webhook event: ${stripeEvent.type}`);

    switch (stripeEvent.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          stripeEvent.data.object as Stripe.Checkout.Session,
        );
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(
          stripeEvent.data.object as Stripe.Subscription,
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionCancellation(
          stripeEvent.data.object as Stripe.Subscription,
        );
        break;

      case "invoice.payment_succeeded":
        await handlePaymentSucceeded(stripeEvent.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handlePaymentFailed(stripeEvent.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return { statusCode: 200, body: "Success" };
  } catch (error) {
    console.error("Webhook error:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Webhook error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const customerEmail =
    session.customer_details?.email || session.metadata?.customer_email;

  if (!customerEmail) {
    console.error("No customer email found in checkout session");
    return;
  }

  // Update user with Stripe customer ID
  const { error } = await supabase
    .from("users")
    .update({
      stripe_customer_id: customerId,
    })
    .eq("email", customerEmail);

  if (error) {
    console.error("Error updating user with customer ID:", error);
  } else {
    console.log(
      `Updated user ${customerEmail} with Stripe customer ID ${customerId}`,
    );
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price?.id;

  if (!priceId) {
    console.error("No price ID found in subscription");
    return;
  }

  const planDetails = getPlanFromPriceId(priceId);

  const updateData = {
    plan_type: planDetails.plan,
    monthly_search_limit: planDetails.limit,
    subscription_status: subscription.status,
    stripe_subscription_id: subscription.id,
    subscription_end_date: new Date(
      subscription.current_period_end * 1000,
    ).toISOString(),
  };

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error updating subscription:", error);
  } else {
    console.log(
      `Updated subscription for customer ${customerId} to ${planDetails.plan} plan`,
    );
  }
}

async function handleSubscriptionCancellation(
  subscription: Stripe.Subscription,
) {
  const customerId = subscription.customer as string;

  const updateData = {
    plan_type: "free",
    monthly_search_limit: 10,
    subscription_status: "cancelled",
    stripe_subscription_id: null,
    subscription_end_date: new Date(
      subscription.current_period_end * 1000,
    ).toISOString(),
  };

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error handling subscription cancellation:", error);
  } else {
    console.log(`Cancelled subscription for customer ${customerId}`);
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Ensure subscription is active after successful payment
  const { error } = await supabase
    .from("users")
    .update({
      subscription_status: "active",
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error updating payment success:", error);
  } else {
    console.log(`Payment succeeded for customer ${customerId}`);
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  // Mark subscription as past_due after failed payment
  const { error } = await supabase
    .from("users")
    .update({
      subscription_status: "past_due",
    })
    .eq("stripe_customer_id", customerId);

  if (error) {
    console.error("Error updating payment failure:", error);
  } else {
    console.log(`Payment failed for customer ${customerId}`);
  }
}

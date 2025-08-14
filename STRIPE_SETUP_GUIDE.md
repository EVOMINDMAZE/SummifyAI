# 🔥 SummifyAI Stripe Integration Setup Guide

## 📋 Overview

This guide will help you set up real Stripe billing for your SummifyAI application with proper plan tiers, webhooks, and subscription management.

## 🏗️ Current Plan Structure

Based on your SubscriptionManagement component:

| Plan             | Price  | Searches/Month | Features                                                                  |
| ---------------- | ------ | -------------- | ------------------------------------------------------------------------- |
| **Free**         | $0     | 10             | Basic AI insights, Search history                                         |
| **Scholar**      | $19.99 | 500            | Advanced AI insights, Priority processing, Export results                 |
| **Professional** | $49.99 | 2,000          | Premium AI models, API access, Custom models, Priority support            |
| **Institution**  | $99.99 | Unlimited      | All AI models, Team collaboration, White-label options, Dedicated support |

## 🚀 Step-by-Step Setup

### 1. Create Stripe Account & Get API Keys

1. **Sign up at [stripe.com](https://stripe.com)**
2. **Complete account verification**
3. **Get your API keys:**
   - Dashboard → Developers → API keys
   - Copy **Publishable key** (pk*test*... or pk*live*...)
   - Copy **Secret key** (sk*test*... or sk*live*...)

### 2. Create Products & Prices in Stripe Dashboard

Navigate to **Products** in your Stripe dashboard and create:

#### Scholar Plan

- **Product Name**: "SummifyAI Scholar"
- **Monthly Price**: $19.99 USD (recurring)
- **Annual Price**: $199.99 USD (recurring) - 17% discount
- **Copy the Price IDs**: `price_xxxx_scholar_monthly`, `price_xxxx_scholar_annual`

#### Professional Plan

- **Product Name**: "SummifyAI Professional"
- **Monthly Price**: $49.99 USD (recurring)
- **Annual Price**: $499.99 USD (recurring) - 17% discount
- **Copy the Price IDs**: `price_xxxx_professional_monthly`, `price_xxxx_professional_annual`

#### Institution Plan

- **Product Name**: "SummifyAI Institution"
- **Monthly Price**: $99.99 USD (recurring)
- **Annual Price**: $999.99 USD (recurring) - 17% discount
- **Copy the Price IDs**: `price_xxxx_institution_monthly`, `price_xxxx_institution_annual`

### 3. Environment Variables Setup

Add these to your `.env` file:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase (required for webhook functions)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Stripe Price IDs (replace with your actual IDs)
STRIPE_SCHOLAR_MONTHLY_PRICE_ID=price_xxxx_scholar_monthly
STRIPE_SCHOLAR_ANNUAL_PRICE_ID=price_xxxx_scholar_annual
STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_xxxx_professional_monthly
STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=price_xxxx_professional_annual
STRIPE_INSTITUTION_MONTHLY_PRICE_ID=price_xxxx_institution_monthly
STRIPE_INSTITUTION_ANNUAL_PRICE_ID=price_xxxx_institution_annual
```

### 4. Backend API Endpoints Needed

Create these Netlify functions:

#### `/netlify/functions/create-checkout-session.ts`

```typescript
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { priceId, customerId, successUrl, cancelUrl } = JSON.parse(
      event.body,
    );

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to create checkout session" }),
    };
  }
};
```

#### `/netlify/functions/stripe-webhook.ts`

```typescript
import Stripe from "stripe";
import { supabase } from "../../client/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

export const handler = async (event: any) => {
  const sig = event.headers["stripe-signature"];

  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );

    switch (stripeEvent.type) {
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
    }

    return { statusCode: 200, body: "Success" };
  } catch (error) {
    console.error("Webhook error:", error);
    return { statusCode: 400, body: "Webhook error" };
  }
};

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;

  // Map price IDs to plan types
  const planMapping: Record<string, { plan: string; limit: number }> = {
    [process.env.STRIPE_SCHOLAR_MONTHLY_PRICE_ID!]: {
      plan: "scholar",
      limit: 500,
    },
    [process.env.STRIPE_SCHOLAR_ANNUAL_PRICE_ID!]: {
      plan: "scholar",
      limit: 500,
    },
    [process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID!]: {
      plan: "professional",
      limit: 2000,
    },
    [process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID!]: {
      plan: "professional",
      limit: 2000,
    },
    [process.env.STRIPE_INSTITUTION_MONTHLY_PRICE_ID!]: {
      plan: "institution",
      limit: 999999,
    },
    [process.env.STRIPE_INSTITUTION_ANNUAL_PRICE_ID!]: {
      plan: "institution",
      limit: 999999,
    },
  };

  const planDetails = planMapping[priceId];
  if (!planDetails) return;

  // Update user in Supabase
  await supabase
    .from("users")
    .update({
      plan_type: planDetails.plan,
      monthly_search_limit: planDetails.limit,
      subscription_status: subscription.status,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      subscription_end_date: new Date(
        subscription.current_period_end * 1000,
      ).toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}

async function handleSubscriptionCancellation(
  subscription: Stripe.Subscription,
) {
  const customerId = subscription.customer as string;

  await supabase
    .from("users")
    .update({
      plan_type: "free",
      monthly_search_limit: 10,
      subscription_status: "cancelled",
      subscription_end_date: new Date(
        subscription.current_period_end * 1000,
      ).toISOString(),
    })
    .eq("stripe_customer_id", customerId);
}
```

### 5. Update SubscriptionManagement Component

Replace the mock price IDs with environment variables:

```typescript
const plans = [
  {
    id: "scholar",
    name: "Scholar",
    price: 19.99,
    stripeMonthlyId: import.meta.env.VITE_STRIPE_SCHOLAR_MONTHLY_PRICE_ID,
    stripeAnnualId: import.meta.env.VITE_STRIPE_SCHOLAR_ANNUAL_PRICE_ID,
    // ... rest of config
  },
  // ... other plans
];
```

### 6. Stripe Checkout Integration

Update the checkout flow to use Stripe Checkout Sessions:

```typescript
const handleUpgrade = async (
  planId: string,
  billingCycle: "monthly" | "annual",
) => {
  const plan = plans.find((p) => p.id === planId);
  const priceId =
    billingCycle === "monthly" ? plan.stripeMonthlyId : plan.stripeAnnualId;

  const response = await fetch("/.netlify/functions/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      priceId,
      customerId: user.stripeCustomerId,
      successUrl: `${window.location.origin}/settings?success=true`,
      cancelUrl: `${window.location.origin}/settings?cancelled=true`,
    }),
  });

  const { sessionId } = await response.json();

  // Redirect to Stripe Checkout
  const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  await stripe.redirectToCheckout({ sessionId });
};
```

### 7. Webhook Configuration

1. **In Stripe Dashboard**: Developers → Webhooks → Add endpoint
2. **Endpoint URL**: `https://your-domain.netlify.app/.netlify/functions/stripe-webhook`
3. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy the webhook signing secret** to your `.env`

### 8. Database Schema Updates

Ensure your Supabase `users` table has these columns:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP;
```

## 🧪 Testing

### Test Mode Setup

1. Use Stripe test keys (`sk_test_...`, `pk_test_...`)
2. Use test card numbers: `4242424242424242`
3. Test webhook endpoints with Stripe CLI

### Production Checklist

- [ ] Replace test keys with live keys
- [ ] Update webhook URLs to production domain
- [ ] Test all subscription flows end-to-end
- [ ] Set up monitoring and error tracking

## 🔒 Security Best Practices

1. **Never expose secret keys** in client-side code
2. **Validate webhook signatures** to prevent fake events
3. **Use HTTPS** for all webhook endpoints
4. **Store customer data securely** in Supabase with RLS
5. **Implement proper error handling** for failed payments

## 💡 Additional Features

Once basic billing is working, consider adding:

- **Proration handling** for plan changes
- **Usage-based billing** for overage charges
- **Team/organization accounts**
- **Annual discount promotions**
- **Trial periods** for new users
- **Dunning management** for failed payments

## 🆘 Need Help?

1. **Stripe Documentation**: [stripe.com/docs](https://stripe.com/docs)
2. **Stripe Support**: Available in your dashboard
3. **Test webhook events**: Use Stripe CLI for local testing

---

**🚨 Important**: Start with test mode and thoroughly test all flows before going live with real payments.

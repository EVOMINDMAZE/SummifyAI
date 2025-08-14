import type { Handler } from "@netlify/functions";

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  // This function helps debug Stripe configuration without exposing secrets
  const config = {
    hasStripeSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    priceIds: {
      scholarMonthly: process.env.STRIPE_SCHOLAR_MONTHLY_PRICE_ID || "NOT_SET",
      scholarAnnual: process.env.STRIPE_SCHOLAR_ANNUAL_PRICE_ID || "NOT_SET",
      professionalMonthly:
        process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID || "NOT_SET",
      professionalAnnual:
        process.env.STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID || "NOT_SET",
      institutionMonthly:
        process.env.STRIPE_INSTITUTION_MONTHLY_PRICE_ID || "NOT_SET",
      institutionAnnual:
        process.env.STRIPE_INSTITUTION_ANNUAL_PRICE_ID || "NOT_SET",
    },
  };

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(
      {
        message: "Stripe Configuration Debug Info",
        config,
        instructions: {
          step1: "Check that all price IDs are set correctly",
          step2:
            "Price IDs should start with 'price_1' followed by random characters",
          step3:
            "If any show 'NOT_SET', add them to your Netlify environment variables",
          example: "price_1ABC123def456GHI",
          note: "All fallback placeholder IDs have been removed - only real Stripe price IDs will work now",
        },
      },
      null,
      2,
    ),
  };
};

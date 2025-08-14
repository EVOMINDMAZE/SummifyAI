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
    fallbackIds: {
      // These are the fallback IDs that will cause errors
      scholarMonthly: "price_scholar_monthly",
      scholarAnnual: "price_scholar_annual",
      professionalMonthly: "price_professional_monthly",
      professionalAnnual: "price_professional_annual",
      institutionMonthly: "price_institution_monthly",
      institutionAnnual: "price_institution_annual",
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
          step1: "Create products in your Stripe Dashboard",
          step2: "Copy the price IDs from Stripe",
          step3: "Set environment variables in Netlify Dashboard",
          step4:
            'Price IDs should start with "price_" followed by random characters',
          example: "price_1ABC123def456GHI",
        },
      },
      null,
      2,
    ),
  };
};

import type { Handler } from "@netlify/functions";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

interface CheckoutSessionRequest {
  priceId: string;
  customerId?: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const {
      priceId,
      customerId,
      customerEmail,
      successUrl,
      cancelUrl,
    }: CheckoutSessionRequest = JSON.parse(event.body!);

    // Validate required fields
    if (!priceId || !customerEmail || !successUrl || !cancelUrl) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }


    // Create or retrieve customer
    let customer;
    if (customerId) {
      try {
        customer = await stripe.customers.retrieve(customerId);
      } catch (error) {
        // Customer doesn't exist, create new one
        customer = null;
      }
    }

    if (!customer) {
      customer = await stripe.customers.create({
        email: customerEmail,
        metadata: {
          source: "summifyai_website",
        },
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      allow_promotion_codes: true,
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        customer_email: customerEmail,
      },
      subscription_data: {
        metadata: {
          customer_email: customerEmail,
        },
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        sessionId: session.id,
        customerId: customer.id,
      }),
    };
  } catch (error) {
    console.error("Error creating checkout session:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};

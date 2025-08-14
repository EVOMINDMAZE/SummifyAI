# 🚀 Quick Stripe Setup Guide

## ❌ **Current Error:**

`No such price: 'price_scholar_monthly'`

This means you need to create Stripe products and set the correct price IDs.

## ✅ **Quick Fix (5 minutes):**

### 1. **Go to Stripe Dashboard**

- Open [stripe.com/dashboard](https://dashboard.stripe.com)
- Go to **Products** section

### 2. **✅ Products Already Created!**

I can see you already have these products in Stripe:

#### **Scholar Plan** ✅
- Product name: "Scholar" (already created)
- Monthly price: $19.99 ✅
- Annual price: $190.00 ✅
- **Action needed**: Click on each price → copy the price ID (starts with `price_1ABC...`)

#### **Professional Plan** ✅
- Product name: "Professional" (already created)
- Monthly price: $49.99 ✅
- Annual price: $499.00 ✅
- **Action needed**: Click on each price → copy the price ID

#### **Enterprise Plan** ✅
- Product name: "Enterprise" (already created)
- Monthly price: $99.99 ✅
- Annual price: $999.00 ✅
- **Action needed**: Click on each price → copy the price ID

**⚠️ Important**: You need the actual **price IDs** (not product names). Click on each price to see the ID like `price_1ABC123def456GHI`

### 3. **Set Environment Variables in Netlify**

Go to your Netlify dashboard → Site Settings → Environment Variables

Add these 6 variables with your actual price IDs from Stripe:

```bash
STRIPE_SCHOLAR_MONTHLY_PRICE_ID=price_1ABC123_your_actual_id
STRIPE_SCHOLAR_ANNUAL_PRICE_ID=price_1XYZ789_your_actual_id
STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_1DEF456_your_actual_id
STRIPE_PROFESSIONAL_ANNUAL_PRICE_ID=price_1UVW012_your_actual_id
STRIPE_INSTITUTION_MONTHLY_PRICE_ID=price_1GHI789_your_actual_id
STRIPE_INSTITUTION_ANNUAL_PRICE_ID=price_1RST345_your_actual_id

# Note: Your products are named "Scholar", "Professional", "Enterprise"
# but the environment variable names stay the same (INSTITUTION = Enterprise)
```

### 4. **Test Configuration**

Visit: `https://your-site.netlify.app/.netlify/functions/debug-stripe-config`

This will show you what price IDs are currently configured.

## 🔗 **Alternative: Skip Stripe for Now**

If you want to test without setting up Stripe billing:

1. The "Free" plan will always work (no Stripe needed)
2. You can disable paid plans temporarily
3. Focus on the core search functionality first

## 💡 **Next Steps After Setup:**

1. Deploy the changes (environment variables auto-trigger rebuild)
2. Test the checkout flow with Stripe test cards
3. Set up webhooks for production use

---

**Need help?** The error will be much clearer now and guide you through the exact steps needed.

# 🔐 Complete Guide: Securing API Keys (Beginner-Friendly)

## Why You Should NEVER Put API Keys in Code

❌ **What NOT to do:**

```env
# DON'T: This is visible to anyone who sees your code
OPENAI_API_KEY=sk-1234567890abcdef...
```

✅ **Why this matters:**

- Anyone with access to your code can steal your API keys
- If you push to GitHub, your keys become public
- Stolen keys can rack up huge bills on your account
- Your app could be used maliciously

## 🎯 Method 1: Using Neon's Environment Variables (Recommended)

### Step 1: Access Your Neon Project Dashboard

1. Go to [console.neon.tech](https://console.neon.tech)
2. Sign in to your account
3. Select your SummifyAI project

### Step 2: Navigate to Environment Variables

1. In your project dashboard, look for **"Settings"** in the left sidebar
2. Click on **"Environment Variables"** (or similar section)
3. You'll see a form to add new environment variables

### Step 3: Add Your API Keys as Environment Variables

Add these environment variables one by one:

```
Name: OPENAI_API_KEY
Value: sk-your-actual-openai-key-here

Name: GOOGLE_BOOKS_API_KEY
Value: your-actual-google-books-key-here

Name: AMAZON_ASSOCIATE_TAG
Value: your-amazon-associate-tag

Name: RATE_LIMIT_MAX_REQUESTS
Value: 100

Name: RATE_LIMIT_WINDOW_MS
Value: 900000
```

### Step 4: Save and Deploy

1. Click **"Save"** or **"Update"** after adding each variable
2. Your app will automatically restart with the new environment variables
3. **Remove the keys from your `.env` file** - they're now secure!

## 🚀 Method 2: Using Vercel (If Deploying to Vercel)

### Step 1: Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your SummifyAI project
3. Go to **Settings** → **Environment Variables**

### Step 2: Add Environment Variables

```
OPENAI_API_KEY = sk-your-actual-key
GOOGLE_BOOKS_API_KEY = your-google-key
AMAZON_ASSOCIATE_TAG = your-tag
```

### Step 3: Set Environment

- Choose **Production**, **Preview**, and **Development**
- Click **Save**
- Redeploy your app

## 🛠 Method 3: Using Railway (If Deploying to Railway)

### Step 1: Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Select your project
3. Click on **Variables** tab

### Step 2: Add Variables

```
OPENAI_API_KEY=sk-your-key
GOOGLE_BOOKS_API_KEY=your-key
```

## 🔧 Method 4: Local Development with Git-Ignored .env

### Step 1: Create Secure Local .env

```bash
# Create a .env file (make sure it's in .gitignore)
touch .env
```

### Step 2: Add to .gitignore

```gitignore
# Add this to your .gitignore file
.env
.env.local
.env.production
```

### Step 3: Use .env.example for Team

```env
# .env.example - safe to commit
OPENAI_API_KEY=your-openai-key-here
GOOGLE_BOOKS_API_KEY=your-google-books-key-here
AMAZON_ASSOCIATE_TAG=your-amazon-tag-here
```

## 📝 How to Get Your API Keys

### OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/Login
3. Click **"API Keys"** in left sidebar
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-`)
6. ⚠️ **Important:** Copy immediately - you can't see it again!

### Google Books API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Go to **APIs & Services** → **Library**
4. Search for **"Books API"**
5. Click **"Enable"**
6. Go to **APIs & Services** → **Credentials**
7. Click **"Create Credentials"** → **"API Key"**
8. Copy your API key

### Amazon Associate Tag (Optional)

1. Go to [Amazon Associates](https://affiliate-program.amazon.com)
2. Sign up for the affiliate program
3. Get your Associate Tag (usually format: `yourname-20`)

## 🔄 Update Your Code to Use Environment Variables

Your app is already configured to use environment variables! The code automatically reads from:

```javascript
// server/index.ts - Already configured!
const openaiKey = process.env.OPENAI_API_KEY;
const googleBooksKey = process.env.GOOGLE_BOOKS_API_KEY;
```

## ✅ Verification Checklist

### ✅ Security Checklist

- [ ] API keys are NOT in your code files
- [ ] `.env` file is in `.gitignore`
- [ ] Environment variables are set in your hosting platform
- [ ] Test that your app still works with the secure keys

### ✅ Testing Your Setup

1. **Remove keys from `.env`** (or comment them out)
2. **Set them in your hosting platform**
3. **Restart your app**
4. **Test the Generate page**
5. **Check if summaries are generated**

## 🚨 Security Best Practices

### 1. Regular Key Rotation

- Regenerate API keys every 3-6 months
- Update them in your environment variables
- Never reuse old keys

### 2. Monitor Usage

- Check your OpenAI usage dashboard regularly
- Set up billing alerts
- Monitor for unusual activity

### 3. Principle of Least Privilege

- Only give keys the minimum permissions needed
- Use separate keys for development and production
- Never share keys in chat/email

### 4. Emergency Response

If you accidentally expose a key:

1. **Immediately revoke** the key in the provider's dashboard
2. **Generate a new key**
3. **Update your environment variables**
4. **Monitor for any unauthorized usage**

## 🎯 Quick Setup for SummifyAI

### Option A: Use Without Real Keys (Fallback Mode)

Your app works without real API keys using high-quality fallback data!

1. Leave the demo keys in place
2. Your app will automatically use fallback content
3. Perfect for testing and demonstrations

### Option B: Use Real Keys (Production Mode)

1. Get your OpenAI API key
2. Get your Google Books API key
3. Add them to your hosting platform's environment variables
4. Remove them from your `.env` file
5. Deploy and test

## 💡 Pro Tips

1. **Use different keys for different environments** (dev, staging, prod)
2. **Set up monitoring and alerts** for API usage
3. **Document which keys are used where** (but not the actual keys!)
4. **Regularly audit who has access** to your environment variables
5. **Use key management services** for enterprise applications

## ❓ Troubleshooting

### Problem: "API key not found"

**Solution:** Make sure the environment variable names match exactly:

- `OPENAI_API_KEY` (not `OPENAI_KEY`)
- `GOOGLE_BOOKS_API_KEY` (not `GOOGLE_API_KEY`)

### Problem: App not reading environment variables

**Solution:**

1. Restart your app/server
2. Check environment variable names for typos
3. Verify the variables are set in the right environment

### Problem: Keys work locally but not in production

**Solution:**

1. Set the environment variables in your hosting platform
2. Make sure you deployed after setting them
3. Check the hosting platform's logs for errors

## 🎉 You're Secure!

Once you've followed this guide:

- ✅ Your API keys are secure
- ✅ Your app works in production
- ✅ You can safely share your code
- ✅ Your billing is protected

Remember: **Security is not optional** - it's essential for any real application!

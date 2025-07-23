# Step-by-Step Edge Functions Deployment Guide

## Why You Can't See Them Yet
Edge Functions only appear in your Supabase dashboard **AFTER** you deploy them using the CLI. They're created locally in your project but need to be uploaded to Supabase.

## Step 1: Install Supabase CLI

### On Windows:
```bash
npm install -g supabase
```

### On Mac:
```bash
brew install supabase/tap/supabase
# OR
npm install -g supabase
```

### On Linux:
```bash
npm install -g supabase
```

## Step 2: Login to Supabase
```bash
supabase login
```
*This will open your browser to authenticate*

## Step 3: Link Your Project
```bash
supabase link --project-ref voosuqmkazvjzheipbrl
```
*This connects your local project to your Supabase project*

## Step 4: Deploy the Edge Functions
```bash
# Deploy all functions at once
supabase functions deploy

# OR deploy them individually
supabase functions deploy analyze-topic
supabase functions deploy analyze-chapter
supabase functions deploy generate-embeddings
```

## Step 5: Verify Deployment
After deployment, you should see:
```
✅ Functions deployed:
  - analyze-topic
  - analyze-chapter  
  - generate-embeddings
```

## Step 6: Check in Supabase Dashboard
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **"Edge Functions"** in the left sidebar
4. You should now see your deployed functions!

## Step 7: Set OpenAI API Key (If Not Set)
1. In Supabase Dashboard → **Edge Functions**
2. Click **"Manage secrets"**
3. Add a new secret:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your actual OpenAI API key (starts with `sk-`)

## Troubleshooting

### "supabase: command not found"
- Make sure Node.js is installed
- Try restarting your terminal
- Install globally: `npm install -g supabase`

### "Project not found"
- Double-check your project reference ID: `voosuqmkazvjzheipbrl`
- Make sure you're logged in: `supabase login`

### "Authentication failed"
- Run `supabase logout` then `supabase login` again

### Functions still not visible
- Wait 1-2 minutes after deployment
- Refresh your Supabase dashboard
- Check the Functions tab (not Database)

## What Happens After Deployment

Once deployed successfully:
- ✅ Functions appear in Supabase dashboard
- ✅ Your app status shows "Edge Functions: Connected"
- ✅ AI features work with server-side OpenAI calls
- ✅ Logs show successful function calls

## Quick Copy-Paste Commands

```bash
# Complete deployment in 4 commands:
npm install -g supabase
supabase login
supabase link --project-ref voosuqmkazvjzheipbrl
supabase functions deploy
```

That's it! Your Edge Functions will be live and working.

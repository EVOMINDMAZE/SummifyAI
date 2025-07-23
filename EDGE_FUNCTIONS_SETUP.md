# Supabase Edge Functions Setup Guide

## Overview
Your OpenAI API calls have been moved to secure Supabase Edge Functions! This provides better security, performance, and scalability.

## ✅ What's Created

### Edge Functions
- **`analyze-topic`** - AI-powered search topic analysis
- **`analyze-chapter`** - Detailed chapter relevance analysis  
- **`generate-embeddings`** - Vector embeddings for semantic search

### Updated Client Code
- **`edgeFunctionService.ts`** - Service layer for calling edge functions
- **`supabaseApiService.ts`** - Updated to use edge functions instead of direct OpenAI calls

## 🚀 Deployment Steps

### 1. Install Supabase CLI
```bash
npm install -g supabase
```

### 2. Login to Supabase
```bash
supabase login
```

### 3. Link Your Project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```
*Your project ref is the ID from your Supabase dashboard URL*

### 4. Set Your OpenAI API Key
Since you mentioned it's already in Supabase secrets, verify it's set as:
```
OPENAI_API_KEY=your_openai_api_key_here
```

If not set, add it via Supabase Dashboard:
- Go to Project Settings → Edge Function Secrets
- Add key: `OPENAI_API_KEY`
- Add value: Your OpenAI API key

### 5. Deploy Edge Functions
```bash
# Deploy all functions
supabase functions deploy analyze-topic
supabase functions deploy analyze-chapter  
supabase functions deploy generate-embeddings

# Or deploy all at once
supabase functions deploy
```

### 6. Test Functions
```bash
# Test topic analysis
supabase functions invoke analyze-topic --data '{"topic":"leadership"}'

# Test chapter analysis  
supabase functions invoke analyze-chapter --data '{"chapter":{"id":1,"chapter_title":"Test","chapter_text":"Sample text"},"query":"leadership"}'

# Test embeddings
supabase functions invoke generate-embeddings --data '{"query":"leadership strategies"}'
```

## 🔧 Verification

Once deployed, your app will automatically use Edge Functions for:

1. **Topic Analysis** - When you analyze search terms
2. **Chapter Analysis** - When searching and getting AI relevance scores
3. **Embeddings** - For semantic vector search

Check your app logs (📋 Logs button) to see:
- ✅ `🔄 Calling edge function: analyze-topic`
- ✅ `✅ Edge function analyze-topic completed successfully`

## 🛡️ Security Benefits

- ✅ **API Key Security**: OpenAI key is server-side only
- ✅ **Rate Limiting**: Built-in Supabase rate limiting
- ✅ **Global Edge**: Functions run close to your users
- ✅ **Error Handling**: Graceful fallbacks for reliability

## 🔍 Troubleshooting

### Function Not Found Error
```bash
# Re-deploy specific function
supabase functions deploy analyze-topic
```

### API Key Not Working
- Check Edge Function Secrets in Supabase Dashboard
- Ensure key name is exactly `OPENAI_API_KEY`
- Verify key starts with `sk-`

### CORS Issues
- Functions include proper CORS headers
- If issues persist, check browser network tab

### Local Development
```bash
# Start local functions for testing
supabase start
supabase functions serve

# Functions will be available at:
# http://localhost:54321/functions/v1/analyze-topic
```

## 📊 Performance

Expected improvements:
- **Security**: API keys server-side only
- **Speed**: Global edge deployment
- **Reliability**: Built-in retry logic and fallbacks
- **Scalability**: Auto-scaling serverless functions

## �� Rollback Plan

If needed, you can temporarily revert to client-side OpenAI by:
1. Updating your `.env` with valid OpenAI API key
2. The app includes fallback logic automatically

Your Edge Functions setup is complete and ready to deploy! 🚀

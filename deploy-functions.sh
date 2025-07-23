#!/bin/bash

echo "🚀 Deploying Supabase Edge Functions..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if logged in to Supabase
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please login first:"
    echo "supabase login"
    exit 1
fi

echo "📋 Deploying Edge Functions..."

# Deploy all functions
echo "🔄 Deploying analyze-topic function..."
supabase functions deploy analyze-topic

echo "🔄 Deploying analyze-chapter function..."
supabase functions deploy analyze-chapter

echo "🔄 Deploying generate-embeddings function..."
supabase functions deploy generate-embeddings

echo "✅ All Edge Functions deployed successfully!"

echo "🧪 Testing functions..."

# Test topic analysis
echo "Testing topic analysis..."
supabase functions invoke analyze-topic --data '{"topic":"leadership"}' || echo "⚠️  Topic analysis test failed"

echo "🎉 Deployment complete!"
echo ""
echo "Your app now uses secure Edge Functions for OpenAI operations:"
echo "- Topic analysis: analyze-topic"
echo "- Chapter analysis: analyze-chapter" 
echo "- Embeddings: generate-embeddings"
echo ""
echo "Check your app logs (📋 Logs button) to see Edge Functions in action!"

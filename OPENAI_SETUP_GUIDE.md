# OpenAI Integration Setup Guide

## Overview
This application uses OpenAI's GPT-4o-mini model to provide AI-powered analysis for book searches and topic analysis. To enable these features, you need to configure your OpenAI API key.

## Current Status ✅
- ✅ OpenAI package (v5.10.1) is installed
- ✅ AI service integration is complete
- ✅ Error handling and fallbacks are implemented
- ✅ All AI operations are ready to work with OpenAI

## Required: OpenAI API Key Setup

### Step 1: Get Your OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your OpenAI account (or create one)
3. Click "Create new secret key"
4. Copy the generated key (starts with `sk-`)

### Step 2: Configure Your Environment
1. Open the `.env` file in your project root
2. Replace `your_openai_api_key_here` with your actual API key:
   ```
   VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
   ```
3. Save the file and restart the development server

### Step 3: Verify Setup
1. Open the application
2. Go to the Generate page
3. Click the "Debug" button (if visible) to run a health check
4. Look for ✅ confirmation that OpenAI is connected

## AI Features Enabled

Once your API key is configured, these features will work:

### 🧠 AI-Powered Search Analysis
- **Topic Analysis**: AI evaluates search terms and suggests refinements
- **Chapter Relevance**: AI scores how relevant each chapter is to your query
- **Smart Explanations**: AI explains why specific chapters match your search

### 🎯 Intelligent Content Processing
- **Semantic Understanding**: AI understands context beyond keyword matching
- **Relevance Scoring**: 25-100 point scale for chapter relevance
- **Key Topic Extraction**: AI identifies main themes in each chapter
- **Practical Applications**: AI suggests how to apply the content

### 🔍 Enhanced Search Experience
- **Query Refinement Suggestions**: Get better search terms automatically
- **Leadership Principles**: AI extracts core leadership concepts
- **Actionable Insights**: AI highlights practical takeaways

## Error Handling

The application includes robust fallback systems:

- **No API Key**: Falls back to basic text search with simulated AI analysis
- **API Errors**: Gracefully handles network issues and API rate limits
- **Invalid Keys**: Clear error messages guide you to fix configuration

## Model Configuration

The application uses `gpt-4o-mini` for optimal balance of:
- ⚡ **Speed**: Fast response times for real-time analysis
- 💰 **Cost-effectiveness**: Affordable pricing for frequent queries
- 🎯 **Accuracy**: High-quality analysis for business content

## Troubleshooting

### "Invalid or missing OPENAI_API_KEY" Error
- Check that your API key starts with `sk-`
- Ensure you've updated the `.env` file correctly
- Restart the development server after making changes

### API Key Not Working
- Verify your OpenAI account has available credits
- Check that your API key hasn't been revoked
- Ensure your key has the necessary permissions

### Rate Limiting
- The application includes automatic retry logic
- Consider upgrading your OpenAI plan for higher rate limits
- Monitor your usage at [OpenAI Usage Dashboard](https://platform.openai.com/usage)

## Security Notes

- ⚠️ **Never commit your API key to version control**
- 🔒 **Keep your `.env` file in `.gitignore`**
- 🔄 **Rotate your API key regularly**
- 📊 **Monitor your OpenAI usage and costs**

## Cost Estimation

With `gpt-4o-mini` pricing:
- **Search Analysis**: ~$0.0001 per search query
- **Chapter Analysis**: ~$0.0003 per chapter
- **Topic Analysis**: ~$0.00005 per topic

For typical usage (50 searches/day, 5 chapters each):
- **Daily Cost**: ~$0.075 
- **Monthly Cost**: ~$2.25

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your OpenAI account status and credits
3. Review this guide for configuration steps
4. Test with a simple query first

The application is designed to work seamlessly once your OpenAI API key is properly configured!

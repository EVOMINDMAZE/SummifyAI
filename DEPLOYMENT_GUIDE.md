# Deployment Guide

## Netlify Functions Fix

The error you encountered was due to ES module compatibility issues with Netlify Functions. Here's what was fixed:

### Problem

```
TypeError [ERR_INVALID_ARG_TYPE]: The "path" argument must be of type string or an instance of URL. Received undefined
    at fileURLToPath (node:internal/url:1507:11)
```

This occurred because:

1. The main project uses `"type": "module"` in package.json
2. The server code uses `import.meta.url` and `fileURLToPath`
3. Netlify Functions don't support these ES module features properly

### Solution

1. **Replaced the complex server import** with a simplified Netlify function
2. **Updated netlify.toml** to specify correct external dependencies
3. **Created standalone API endpoints** that don't depend on ES modules

### Environment Variables Required

Ensure these are set in your Netlify environment:

```
DATABASE_URL=your_neon_database_url
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-nano
GOOGLE_BOOKS_API_KEY=your_google_books_key (optional)
NODE_ENV=production
```

### Testing the Fix

You can test the deployed function with:

```bash
# Health check
curl https://your-site.netlify.app/api/health

# Database search
curl "https://your-site.netlify.app/api/database?q=leadership"

# Topic analysis
curl -X POST https://your-site.netlify.app/api/topic \
  -H "Content-Type: application/json" \
  -d '{"topic":"negotiation"}'
```

### Current Function Endpoints

- `GET /api/health` - Health check
- `GET /api/database?q=query` - Search chapters
- `POST /api/topic` - Analyze topics

The simplified function provides the same API interface but without the ES module dependencies that were causing the deployment issues.

# AI-Powered Book Chapter Discovery

A serverless React application that uses AI to discover relevant book chapters based on user queries.

## Architecture

This application uses a **serverless-only architecture**:

- **Frontend**: React + Vite for client-side application
- **Backend**: Netlify Functions for serverless API endpoints
- **Database**: PostgreSQL with pgvector for AI embeddings
- **AI**: OpenAI GPT-4.1-nano and embeddings for semantic search

## Key Features

- **AI-Powered Search**: Uses OpenAI embeddings for semantic chapter discovery
- **Real-time Analysis**: GPT-4.1-nano analyzes relevance and generates explanations
- **Serverless Deployment**: Scales automatically with Netlify Functions
- **Vector Search**: PostgreSQL with pgvector for similarity matching

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Serverless Functions

All backend logic runs in `/netlify/functions/`:

- `api.ts` - Main API handler for all routes:
  - `GET /api/health` - Health check
  - `GET /api/database?q={query}` - Chapter search with AI analysis
  - `POST /api/topic/analyze` - Query analysis and refinement

## Environment Variables

Required for production:

```
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-nano
```

## Database Schema

- `books` - Book metadata (title, author, cover, ISBN)
- `chapters` - Chapter content with vector embeddings for similarity search

## Deployment

Deploy to Netlify with automatic serverless function deployment:

1. Connect repository to Netlify
2. Set environment variables
3. Deploy - functions are automatically deployed to `/.netlify/functions/`

No server management required - fully serverless!

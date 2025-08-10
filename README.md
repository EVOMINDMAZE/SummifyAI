# AI-Powered Book Chapter Discovery

A React application that uses AI to discover relevant book chapters based on user queries, powered by Supabase backend.

## Architecture

This application uses **Supabase as the complete backend**:

- **Frontend**: React + Vite for client-side application
- **Backend**: Supabase PostgreSQL database with edge functions
- **Database**: PostgreSQL with pgvector for AI embeddings
- **AI**: OpenAI GPT-4o and embeddings for semantic search
- **Authentication**: Supabase Auth (ready for implementation)
- **Real-time**: Supabase real-time subscriptions (ready for implementation)

## Key Features

- **AI-Powered Search**: Uses OpenAI embeddings for semantic chapter discovery
- **Real-time Analysis**: GPT-4o analyzes relevance and generates explanations
- **Supabase Integration**: Leverages Supabase's full-stack platform
- **Vector Search**: PostgreSQL with pgvector for similarity matching
- **Client-side Architecture**: Direct browser-to-Supabase communication

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Supabase Configuration

The app connects directly to your Supabase project with these services:

### Database

- `books` - Book metadata (title, author, cover, ISBN)
- `chapters` - Chapter content with vector embeddings for similarity search

### Required Extensions

Make sure these extensions are enabled in your Supabase project:

- `vector` - For pgvector similarity search

## Environment Variables

Required for production:

```
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-nano
```

## API Services

All backend logic runs through Supabase:

- **Database Search** - Vector similarity and text search with AI analysis
- **Topic Analysis** - Query analysis and refinement suggestions
- **Health Check** - Database and OpenAI connectivity verification

## Deployment

Deploy to any static hosting platform (Vercel, Netlify, etc.):

1. Build the React app: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Set environment variables in your hosting platform
4. Your Supabase database handles all backend functionality

## Supabase Features Ready for Implementation

- **Authentication** - User sign-up, sign-in, password reset
- **Real-time subscriptions** - Live updates for collaborative features
- **Edge Functions** - Server-side processing for complex operations
- **Storage** - File uploads for book covers and documents
- **Row Level Security** - Fine-grained access control

No server management required - fully client-side with Supabase backend! 🚀

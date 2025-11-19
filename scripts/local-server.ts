import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handler as generateEmbeddings } from '../netlify/functions/generate-embeddings-v2.mts';
import { handler as analyzeSearchResults } from '../netlify/functions/analyze-search-results-v2.mts';

dotenv.config();

console.log('[LocalServer] Environment Check:');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set (' + process.env.OPENAI_API_KEY.substring(0, 3) + '... length ' + process.env.OPENAI_API_KEY.length + ')' : 'Not Set');
console.log('GROK_API_KEY:', process.env.GROK_API_KEY ? 'Set (' + process.env.GROK_API_KEY.substring(0, 3) + '... length ' + process.env.GROK_API_KEY.length + ')' : 'Not Set');

const app = express();
app.use(cors());
// Handle raw body for some functions if needed, but JSON is mostly used
app.use(express.json({ limit: '10mb' }));

// Helper to adapt Express to Netlify Handler
const adapt = (handler: any) => async (req: any, res: any) => {
  console.log(`[LocalServer] Request: ${req.method} ${req.path}`);
  
  const event = {
    body: JSON.stringify(req.body),
    headers: req.headers,
    httpMethod: req.method,
    path: req.path,
    queryStringParameters: req.query,
    rawQuery: req.url.split('?')[1] || '',
  };

  const context = {}; 

  try {
    const result = await handler(event, context);
    
    // Handle headers
    if (result.headers) {
      Object.entries(result.headers).forEach(([key, value]) => {
        res.setHeader(key, value as string);
      });
    }

    res.status(result.statusCode || 200);
    
    // Handle body
    if (result.body) {
      res.send(result.body);
    } else {
      res.end();
    }
  } catch (error: any) {
    console.error(`[LocalServer] Error in ${req.path}:`, error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

// Register routes
// Note: The client calls /api/generate-embeddings-v2
// We will proxy /api/* to this server, so the path here should match or we strip /api
// If we proxy http://localhost:5173/api/foo -> http://localhost:9999/api/foo
// Then we need /api/foo here.

app.all('/api/generate-embeddings-v2', adapt(generateEmbeddings));
app.all('/api/analyze-search-results-v2', adapt(analyzeSearchResults));

// Health check
app.get('/health', (req, res) => res.send('OK'));

const PORT = 9999;
app.listen(PORT, () => {
  console.log(`
🚀 Local Netlify Functions Server running on port ${PORT}
👉 http://localhost:${PORT}/api/generate-embeddings-v2
👉 http://localhost:${PORT}/api/analyze-search-results-v2
  `);
});

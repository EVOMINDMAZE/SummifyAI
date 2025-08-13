-- Create table for caching AI chapter analyses
CREATE TABLE IF NOT EXISTS chapter_analyses (
  id BIGSERIAL PRIMARY KEY,
  chapter_id TEXT NOT NULL,
  user_query TEXT NOT NULL,
  relevance_score INTEGER NOT NULL DEFAULT 0,
  why_relevant TEXT,
  key_topics TEXT[] DEFAULT '{}',
  confidence INTEGER DEFAULT 50,
  analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_chapter_analyses_chapter_id ON chapter_analyses(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_analyses_query ON chapter_analyses(user_query);
CREATE INDEX IF NOT EXISTS idx_chapter_analyses_analyzed_at ON chapter_analyses(analyzed_at);
CREATE INDEX IF NOT EXISTS idx_chapter_analyses_relevance ON chapter_analyses(relevance_score DESC);

-- Create unique constraint to prevent duplicate analyses for same chapter + query combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_chapter_analyses_unique 
ON chapter_analyses(chapter_id, user_query);

-- Add RLS policies
ALTER TABLE chapter_analyses ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read analyses
CREATE POLICY "Users can read chapter analyses" ON chapter_analyses
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy to allow service role to manage analyses
CREATE POLICY "Service role can manage chapter analyses" ON chapter_analyses
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_chapter_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_chapter_analyses_updated_at
  BEFORE UPDATE ON chapter_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_chapter_analyses_updated_at();

-- Create function for vector similarity search if not exists
CREATE OR REPLACE FUNCTION search_chapters_by_embedding(
  query_text TEXT,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 20
)
RETURNS TABLE (
  id TEXT,
  chapter_title TEXT,
  chapter_summary TEXT,
  book_id TEXT,
  similarity FLOAT,
  books JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- This is a placeholder for vector search functionality
  -- In a real implementation, this would use pgvector extension
  -- For now, return empty to fall back to text search
  RETURN QUERY
  SELECT 
    c.id::TEXT,
    c.chapter_title,
    c.chapter_summary,
    c.book_id::TEXT,
    0.5::FLOAT as similarity,
    to_jsonb(b.*) as books
  FROM chapters c
  JOIN books b ON c.book_id = b.id
  WHERE c.chapter_summary ILIKE '%' || query_text || '%'
     OR c.chapter_title ILIKE '%' || query_text || '%'
     OR b.title ILIKE '%' || query_text || '%'
  LIMIT match_count;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON chapter_analyses TO postgres, anon, authenticated, service_role;
GRANT ALL ON SEQUENCE chapter_analyses_id_seq TO postgres, anon, authenticated, service_role;

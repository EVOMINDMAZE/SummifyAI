-- Create table for caching embedding generation results
CREATE TABLE IF NOT EXISTS search_embeddings_cache (
  id BIGSERIAL PRIMARY KEY,
  query_text TEXT NOT NULL,
  embedding VECTOR(1536), -- text-embedding-3-small dimension
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days',
  usage_count INT DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(query_text)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_embeddings_cache_query ON search_embeddings_cache USING BTREE (query_text);
CREATE INDEX IF NOT EXISTS idx_embeddings_cache_expires ON search_embeddings_cache (expires_at);

-- Create table for caching AI analysis results
CREATE TABLE IF NOT EXISTS search_analysis_cache (
  id BIGSERIAL PRIMARY KEY,
  chapter_id BIGINT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  query_text TEXT NOT NULL,
  analysis_level VARCHAR(50) NOT NULL, -- basic, advanced, premium
  analysis_text TEXT NOT NULL,
  enhanced_score FLOAT NOT NULL,
  key_topics TEXT[] DEFAULT ARRAY[]::TEXT[],
  relevance_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '30 days',
  usage_count INT DEFAULT 1,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(chapter_id, query_text, analysis_level)
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_analysis_cache_chapter_query ON search_analysis_cache USING BTREE (chapter_id, query_text, analysis_level);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_expires ON search_analysis_cache (expires_at);
CREATE INDEX IF NOT EXISTS idx_analysis_cache_created ON search_analysis_cache (created_at DESC);

-- Add RLS policies for cache tables (can be read by anyone, but only system can insert/update)
ALTER TABLE search_embeddings_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_analysis_cache ENABLE ROW LEVEL SECURITY;

-- Allow reads from cache tables for all authenticated users
CREATE POLICY "Allow read access to embeddings cache" ON search_embeddings_cache
  FOR SELECT
  USING (true);

CREATE POLICY "Allow read access to analysis cache" ON search_analysis_cache
  FOR SELECT
  USING (true);

-- Create function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM search_embeddings_cache WHERE expires_at < CURRENT_TIMESTAMP;
  DELETE FROM search_analysis_cache WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Create function to update cache usage statistics
CREATE OR REPLACE FUNCTION update_cache_usage(cache_type TEXT, cache_id BIGINT)
RETURNS void AS $$
BEGIN
  IF cache_type = 'embedding' THEN
    UPDATE search_embeddings_cache
    SET usage_count = usage_count + 1,
        last_used_at = CURRENT_TIMESTAMP
    WHERE id = cache_id;
  ELSIF cache_type = 'analysis' THEN
    UPDATE search_analysis_cache
    SET usage_count = usage_count + 1,
        last_used_at = CURRENT_TIMESTAMP
    WHERE id = cache_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

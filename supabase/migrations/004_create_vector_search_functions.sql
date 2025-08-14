-- Enable vector extension for similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Update chapters table to ensure vector columns exist with proper types
DO $$ 
BEGIN
    -- Add vector_embedding column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chapters' AND column_name = 'vector_embedding') THEN
        ALTER TABLE chapters ADD COLUMN vector_embedding vector(1536);
    END IF;
    
    -- Add summary_embedding column if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'chapters' AND column_name = 'summary_embedding') THEN
        ALTER TABLE chapters ADD COLUMN summary_embedding vector(1536);
    END IF;
END $$;

-- Create indexes for vector similarity search
DROP INDEX IF EXISTS chapters_vector_embedding_idx;
DROP INDEX IF EXISTS chapters_summary_embedding_idx;

CREATE INDEX chapters_summary_embedding_idx ON chapters 
USING ivfflat (summary_embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX chapters_vector_embedding_idx ON chapters 
USING ivfflat (vector_embedding vector_cosine_ops) WITH (lists = 100);

-- Create full-text search index
DROP INDEX IF EXISTS chapters_fulltext_idx;
CREATE INDEX chapters_fulltext_idx ON chapters 
USING GIN (to_tsvector('english', chapter_title || ' ' || chapter_text));

-- Function for summary embedding search (Stage 1 - Fast filtering)
CREATE OR REPLACE FUNCTION search_summary_embeddings(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.7,
    match_count int DEFAULT 50
)
RETURNS TABLE (
    id bigint,
    book_title text,
    chapter_title text,
    chapter_summary text,
    distance float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        b.title as book_title,
        c.chapter_title,
        c.chapter_summary,
        (c.summary_embedding <=> query_embedding) as distance
    FROM chapters c
    JOIN books b ON c.book_id = b.id
    WHERE c.summary_embedding IS NOT NULL
        AND (c.summary_embedding <=> query_embedding) < (1 - match_threshold)
    ORDER BY c.summary_embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function for chapter embedding search (Stage 2 - Detailed search on candidates)
CREATE OR REPLACE FUNCTION search_chapter_embeddings(
    query_embedding vector(1536),
    candidate_ids bigint[] DEFAULT NULL,
    match_threshold float DEFAULT 0.6,
    match_count int DEFAULT 25
)
RETURNS TABLE (
    id bigint,
    book_title text,
    chapter_title text,
    chapter_text text,
    distance float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        b.title as book_title,
        c.chapter_title,
        c.chapter_text,
        (c.vector_embedding <=> query_embedding) as distance
    FROM chapters c
    JOIN books b ON c.book_id = b.id
    WHERE c.vector_embedding IS NOT NULL
        AND (candidate_ids IS NULL OR c.id = ANY(candidate_ids))
        AND (c.vector_embedding <=> query_embedding) < (1 - match_threshold)
    ORDER BY c.vector_embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Function for full-text search (Stage 3 - Professional tier)
CREATE OR REPLACE FUNCTION search_fulltext(
    search_query text,
    match_count int DEFAULT 20
)
RETURNS TABLE (
    id bigint,
    book_title text,
    chapter_title text,
    chapter_text text,
    rank float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        b.title as book_title,
        c.chapter_title,
        c.chapter_text,
        ts_rank(to_tsvector('english', c.chapter_title || ' ' || c.chapter_text), 
                plainto_tsquery('english', search_query)) as rank
    FROM chapters c
    JOIN books b ON c.book_id = b.id
    WHERE to_tsvector('english', c.chapter_title || ' ' || c.chapter_text) @@ 
          plainto_tsquery('english', search_query)
    ORDER BY rank DESC
    LIMIT match_count;
END;
$$;

-- Function to check user search tier and remaining queries
CREATE OR REPLACE FUNCTION get_user_search_status(user_id uuid)
RETURNS TABLE (
    plan_type text,
    search_count int,
    monthly_search_limit int,
    queries_remaining int
)
LANGUAGE plpgsql
AS $$
DECLARE
    user_plan text;
    current_count int;
    search_limit int;
BEGIN
    -- Get user plan and current search count
    SELECT 
        u.plan_type,
        u.search_count,
        u.monthly_search_limit
    INTO user_plan, current_count, search_limit
    FROM users u
    WHERE u.id = user_id;
    
    -- Handle case where user not found
    IF user_plan IS NULL THEN
        user_plan := 'free';
        current_count := 0;
        search_limit := 10;
    END IF;
    
    RETURN QUERY
    SELECT 
        user_plan,
        current_count,
        search_limit,
        CASE 
            WHEN search_limit = -1 THEN -1  -- Unlimited
            ELSE GREATEST(0, search_limit - current_count)
        END as queries_remaining;
END;
$$;

-- Function to increment user search count (with tier validation)
CREATE OR REPLACE FUNCTION increment_user_search_count(user_id uuid)
RETURNS TABLE (
    success boolean,
    new_count int,
    queries_remaining int,
    message text
)
LANGUAGE plpgsql
AS $$
DECLARE
    current_status record;
    new_search_count int;
BEGIN
    -- Get current search status
    SELECT * INTO current_status 
    FROM get_user_search_status(user_id);
    
    -- Check if user has remaining queries
    IF current_status.monthly_search_limit != -1 AND 
       current_status.search_count >= current_status.monthly_search_limit THEN
        
        RETURN QUERY
        SELECT 
            false as success,
            current_status.search_count as new_count,
            0 as queries_remaining,
            'Monthly search limit reached. Please upgrade your plan.' as message;
        RETURN;
    END IF;
    
    -- Increment search count
    UPDATE users 
    SET search_count = search_count + 1
    WHERE id = user_id;
    
    new_search_count := current_status.search_count + 1;
    
    RETURN QUERY
    SELECT 
        true as success,
        new_search_count,
        CASE 
            WHEN current_status.monthly_search_limit = -1 THEN -1
            ELSE current_status.monthly_search_limit - new_search_count
        END as queries_remaining,
        'Search count updated successfully.' as message;
END;
$$;

-- Create RLS policies for search access control
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Policy: All users can read chapters (access control handled in application)
DROP POLICY IF EXISTS "chapters_read_policy" ON chapters;
CREATE POLICY "chapters_read_policy" ON chapters
    FOR SELECT
    USING (true);

-- Create search history table to track user queries and results
CREATE TABLE IF NOT EXISTS user_search_history (
    id bigserial PRIMARY KEY,
    user_id uuid REFERENCES users(id) ON DELETE CASCADE,
    search_query text NOT NULL,
    search_type text NOT NULL CHECK (search_type IN ('summary', 'chapter', 'fulltext', 'hybrid')),
    results_count int NOT NULL DEFAULT 0,
    plan_type text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    search_metadata jsonb DEFAULT '{}'::jsonb
);

-- Add indexes for search history
CREATE INDEX IF NOT EXISTS user_search_history_user_id_idx ON user_search_history(user_id);
CREATE INDEX IF NOT EXISTS user_search_history_created_at_idx ON user_search_history(created_at);
CREATE INDEX IF NOT EXISTS user_search_history_plan_type_idx ON user_search_history(plan_type);

-- Enable RLS on search history
ALTER TABLE user_search_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own search history
DROP POLICY IF EXISTS "user_search_history_policy" ON user_search_history;
CREATE POLICY "user_search_history_policy" ON user_search_history
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Function to log search activity
CREATE OR REPLACE FUNCTION log_search_activity(
    user_id uuid,
    search_query text,
    search_type text,
    results_count int,
    plan_type text,
    metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO user_search_history (
        user_id,
        search_query,
        search_type,
        results_count,
        plan_type,
        search_metadata
    ) VALUES (
        user_id,
        search_query,
        search_type,
        results_count,
        plan_type,
        metadata
    );
END;
$$;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION search_summary_embeddings TO authenticated, anon;
GRANT EXECUTE ON FUNCTION search_chapter_embeddings TO authenticated, anon;
GRANT EXECUTE ON FUNCTION search_fulltext TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_search_status TO authenticated, anon;
GRANT EXECUTE ON FUNCTION increment_user_search_count TO authenticated, anon;
GRANT EXECUTE ON FUNCTION log_search_activity TO authenticated, anon;

-- Grant table permissions
GRANT SELECT ON chapters TO authenticated, anon;
GRANT SELECT ON books TO authenticated, anon;
GRANT ALL ON user_search_history TO authenticated;

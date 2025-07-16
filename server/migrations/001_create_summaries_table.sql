-- Create summaries table for storing generated summaries
CREATE TABLE IF NOT EXISTS summaries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    topic VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    key_insights JSONB DEFAULT '[]',
    quotes JSONB DEFAULT '[]',
    books_data JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_summaries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_summaries_user_id ON summaries(user_id);
CREATE INDEX IF NOT EXISTS idx_summaries_created_at ON summaries(created_at);
CREATE INDEX IF NOT EXISTS idx_summaries_topic ON summaries(topic);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_summaries_updated_at 
    BEFORE UPDATE ON summaries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

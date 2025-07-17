-- Create chapter ratings table for user feedback
CREATE TABLE IF NOT EXISTS chapter_ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  book_id VARCHAR(255) NOT NULL,
  chapter_id VARCHAR(255) NOT NULL,
  search_topic VARCHAR(255) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chapter_ratings_user ON chapter_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_ratings_book_chapter ON chapter_ratings(book_id, chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_ratings_topic ON chapter_ratings(search_topic);

-- Create unique constraint to prevent duplicate ratings
CREATE UNIQUE INDEX IF NOT EXISTS idx_chapter_ratings_unique 
ON chapter_ratings(user_id, book_id, chapter_id, search_topic);

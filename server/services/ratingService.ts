import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

interface ChapterRating {
  id: number;
  userId: number;
  bookId: string;
  chapterId: string;
  searchTopic: string;
  rating: number;
  feedbackText?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RatingSubmission {
  userId: number;
  bookId: string;
  chapterId: string;
  searchTopic: string;
  rating: number;
  feedbackText?: string;
}

interface RatingStats {
  bookId: string;
  chapterId: string;
  averageRating: number;
  totalRatings: number;
  ratingDistribution: { [key: number]: number };
}

export class RatingService {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString:
        process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });
  }

  async submitRating(submission: RatingSubmission): Promise<ChapterRating> {
    const client = await this.pool.connect();
    try {
      // Use INSERT ... ON CONFLICT to handle updates
      const result = await client.query(
        `INSERT INTO chapter_ratings (user_id, book_id, chapter_id, search_topic, rating, feedback_text)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (user_id, book_id, chapter_id, search_topic)
         DO UPDATE SET 
           rating = EXCLUDED.rating,
           feedback_text = EXCLUDED.feedback_text,
           updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [
          submission.userId,
          submission.bookId,
          submission.chapterId,
          submission.searchTopic,
          submission.rating,
          submission.feedbackText || null,
        ],
      );

      return this.mapDatabaseRowToRating(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getRatingStats(
    bookId: string,
    chapterId: string,
  ): Promise<RatingStats> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT 
           AVG(rating)::NUMERIC(3,2) as average_rating,
           COUNT(*) as total_ratings,
           rating,
           COUNT(*) as count
         FROM chapter_ratings 
         WHERE book_id = $1 AND chapter_id = $2
         GROUP BY rating
         ORDER BY rating`,
        [bookId, chapterId],
      );

      const ratingDistribution: { [key: number]: number } = {};
      let totalRatings = 0;
      let weightedSum = 0;

      for (const row of result.rows) {
        const rating = parseInt(row.rating);
        const count = parseInt(row.count);
        ratingDistribution[rating] = count;
        totalRatings += count;
        weightedSum += rating * count;
      }

      const averageRating = totalRatings > 0 ? weightedSum / totalRatings : 0;

      return {
        bookId,
        chapterId,
        averageRating: Math.round(averageRating * 100) / 100,
        totalRatings,
        ratingDistribution,
      };
    } finally {
      client.release();
    }
  }

  async getUserRating(
    userId: number,
    bookId: string,
    chapterId: string,
    searchTopic: string,
  ): Promise<ChapterRating | null> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM chapter_ratings 
         WHERE user_id = $1 AND book_id = $2 AND chapter_id = $3 AND search_topic = $4`,
        [userId, bookId, chapterId, searchTopic],
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapDatabaseRowToRating(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getTopRatedChapters(
    searchTopic: string,
    limit: number = 10,
  ): Promise<Array<RatingStats & { searchTopic: string }>> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT 
           book_id,
           chapter_id,
           search_topic,
           AVG(rating)::NUMERIC(3,2) as average_rating,
           COUNT(*) as total_ratings
         FROM chapter_ratings 
         WHERE search_topic = $1
         GROUP BY book_id, chapter_id, search_topic
         HAVING COUNT(*) >= 3  -- At least 3 ratings
         ORDER BY average_rating DESC, total_ratings DESC
         LIMIT $2`,
        [searchTopic, limit],
      );

      return result.rows.map((row) => ({
        bookId: row.book_id,
        chapterId: row.chapter_id,
        searchTopic: row.search_topic,
        averageRating: parseFloat(row.average_rating),
        totalRatings: parseInt(row.total_ratings),
        ratingDistribution: {}, // Could be populated if needed
      }));
    } finally {
      client.release();
    }
  }

  async getRecentFeedback(limit: number = 20): Promise<ChapterRating[]> {
    const client = await this.pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM chapter_ratings 
         WHERE feedback_text IS NOT NULL 
         ORDER BY created_at DESC 
         LIMIT $1`,
        [limit],
      );

      return result.rows.map(this.mapDatabaseRowToRating);
    } finally {
      client.release();
    }
  }

  private mapDatabaseRowToRating(row: any): ChapterRating {
    return {
      id: row.id,
      userId: row.user_id,
      bookId: row.book_id,
      chapterId: row.chapter_id,
      searchTopic: row.search_topic,
      rating: row.rating,
      feedbackText: row.feedback_text,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

export const ratingService = new RatingService();

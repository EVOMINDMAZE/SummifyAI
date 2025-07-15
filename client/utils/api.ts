// Database connection configuration
const DATABASE_CONFIG = {
  projectId: "gentle-truth-17370229",
  databaseName: "neondb",
};

// API utility functions for interacting with Neon database
export class SummifyAPI {
  // User management
  static async createUser(userData: {
    email: string;
    name: string;
    referralCode?: string;
  }) {
    try {
      // Generate unique referral code if not provided
      const userReferralCode =
        userData.referralCode ||
        `${userData.name.replace(/\s+/g, "").toUpperCase().slice(0, 6)}${Math.floor(Math.random() * 1000)}`;

      const sql = `
        INSERT INTO users (email, name, referral_code) 
        VALUES ($1, $2, $3) 
        RETURNING *
      `;

      const response = await fetch("/api/neon/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...DATABASE_CONFIG,
          sql,
          params: [userData.email, userData.name, userReferralCode],
        }),
      });

      if (!response.ok) throw new Error("Failed to create user");

      const result = await response.json();
      return result.rows[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  static async getUserByEmail(email: string) {
    try {
      const sql = `SELECT * FROM users WHERE email = $1`;

      const response = await fetch("/api/neon/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...DATABASE_CONFIG,
          sql,
          params: [email],
        }),
      });

      if (!response.ok) throw new Error("Failed to get user");

      const result = await response.json();
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  }

  static async updateUser(userId: number, updates: any) {
    try {
      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(", ");

      const sql = `
        UPDATE users 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1 
        RETURNING *
      `;

      const response = await fetch("/api/neon/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...DATABASE_CONFIG,
          sql,
          params: [userId, ...Object.values(updates)],
        }),
      });

      if (!response.ok) throw new Error("Failed to update user");

      const result = await response.json();
      return result.rows[0];
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  // Summary management
  static async createSummary(summaryData: {
    userId: number;
    topic: string;
    content: string;
    keyInsights: string[];
  }) {
    try {
      const sql = `
        INSERT INTO summaries (user_id, topic, content, key_insights) 
        VALUES ($1, $2, $3, $4) 
        RETURNING *
      `;

      const response = await fetch("/api/neon/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...DATABASE_CONFIG,
          sql,
          params: [
            summaryData.userId,
            summaryData.topic,
            summaryData.content,
            summaryData.keyInsights,
          ],
        }),
      });

      if (!response.ok) throw new Error("Failed to create summary");

      const result = await response.json();
      return result.rows[0];
    } catch (error) {
      console.error("Error creating summary:", error);
      throw error;
    }
  }

  static async getUserSummaries(userId: number) {
    try {
      const sql = `
        SELECT s.*, 
               json_agg(
                 json_build_object(
                   'id', b.id,
                   'title', b.title,
                   'author', b.author,
                   'cover_url', b.cover_url,
                   'amazon_link', b.amazon_link,
                   'rating', b.rating
                 )
               ) as books
        FROM summaries s
        LEFT JOIN books b ON s.id = b.summary_id
        WHERE s.user_id = $1
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `;

      const response = await fetch("/api/neon/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...DATABASE_CONFIG,
          sql,
          params: [userId],
        }),
      });

      if (!response.ok) throw new Error("Failed to get summaries");

      const result = await response.json();
      return result.rows;
    } catch (error) {
      console.error("Error getting summaries:", error);
      throw error;
    }
  }

  // Credit management
  static async addCredits(userId: number, amount: number, reason: string) {
    try {
      // First get current balance
      const userSql = `SELECT credits FROM users WHERE id = $1`;
      const userResponse = await fetch("/api/neon/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...DATABASE_CONFIG,
          sql: userSql,
          params: [userId],
        }),
      });

      if (!userResponse.ok) throw new Error("Failed to get user credits");

      const userResult = await userResponse.json();
      const currentCredits = userResult.rows[0]?.credits || 0;
      const newBalance = currentCredits + amount;

      // Update user credits and create transaction record
      const updateSql = `UPDATE users SET credits = $1 WHERE id = $2`;
      const transactionSql = `
        INSERT INTO credit_transactions (user_id, type, amount, reason, balance_after) 
        VALUES ($1, 'earned', $2, $3, $4)
      `;

      // Execute both queries
      await Promise.all([
        fetch("/api/neon/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...DATABASE_CONFIG,
            sql: updateSql,
            params: [newBalance, userId],
          }),
        }),
        fetch("/api/neon/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...DATABASE_CONFIG,
            sql: transactionSql,
            params: [userId, amount, reason, newBalance],
          }),
        }),
      ]);

      return newBalance;
    } catch (error) {
      console.error("Error adding credits:", error);
      throw error;
    }
  }

  static async useCredits(userId: number, amount: number) {
    try {
      // First get current balance
      const userSql = `SELECT credits FROM users WHERE id = $1`;
      const userResponse = await fetch("/api/neon/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...DATABASE_CONFIG,
          sql: userSql,
          params: [userId],
        }),
      });

      if (!userResponse.ok) throw new Error("Failed to get user credits");

      const userResult = await userResponse.json();
      const currentCredits = userResult.rows[0]?.credits || 0;

      if (currentCredits < amount) {
        return false; // Insufficient credits
      }

      const newBalance = currentCredits - amount;

      // Update user credits and create transaction record
      const updateSql = `UPDATE users SET credits = $1 WHERE id = $2`;
      const transactionSql = `
        INSERT INTO credit_transactions (user_id, type, amount, reason, balance_after) 
        VALUES ($1, 'spent', $2, 'Used for additional search', $3)
      `;

      await Promise.all([
        fetch("/api/neon/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...DATABASE_CONFIG,
            sql: updateSql,
            params: [newBalance, userId],
          }),
        }),
        fetch("/api/neon/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...DATABASE_CONFIG,
            sql: transactionSql,
            params: [userId, amount, newBalance],
          }),
        }),
      ]);

      return true;
    } catch (error) {
      console.error("Error using credits:", error);
      throw error;
    }
  }

  // Share tracking
  static async recordShare(
    userId: number,
    summaryId: number,
    shareType: string,
  ) {
    try {
      const sql = `
        INSERT INTO shares (user_id, summary_id, share_type) 
        VALUES ($1, $2, $3)
      `;

      const response = await fetch("/api/neon/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...DATABASE_CONFIG,
          sql,
          params: [userId, summaryId, shareType],
        }),
      });

      if (!response.ok) throw new Error("Failed to record share");

      // Award credit for sharing
      await this.addCredits(userId, 1, "Shared a summary");

      return true;
    } catch (error) {
      console.error("Error recording share:", error);
      throw error;
    }
  }
}

// Fallback mock data for development/demo
export const MOCK_DATA = {
  demoUser: {
    id: 1,
    email: "demo@summifyai.com",
    name: "Demo User",
    tier: "free",
    queries_used: 2,
    query_limit: 3,
    credits: 5,
    referral_code: "DEMO123",
    referrals_count: 1,
    created_at: new Date().toISOString(),
  },

  demoSummaries: [
    {
      id: 1,
      topic: "Leadership",
      content:
        "Leadership is fundamentally about serving others and creating environments where people can thrive...",
      key_insights: [
        "Great leaders prioritize the success of their team over personal recognition",
        "Consistent principles and values create trust and predictability",
        "Leadership is a practice that requires continuous learning and adaptation",
      ],
      books: [
        {
          title: "Good to Great",
          author: "Jim Collins",
          cover_url: "https://covers.openlibrary.org/b/id/8739161-M.jpg",
          amazon_link: "https://amazon.com/dp/0066620996?tag=summifyai-20",
          rating: 4.5,
        },
      ],
    },
  ],
};

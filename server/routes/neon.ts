import { Request, Response } from "express";
import { Pool } from "pg";

// Neon database connection
const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_pxOZnmV3yI0k@ep-raspy-mode-afhkywlf-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

// Execute SQL with parameters
export async function handleNeonExecute(req: Request, res: Response) {
  try {
    const { sql, params = [] } = req.body;

    if (!sql) {
      return res.status(400).json({ error: "SQL query is required" });
    }

    const client = await pool.connect();

    try {
      const result = await client.query(sql, params);
      res.json({
        rows: result.rows,
        rowCount: result.rowCount,
        command: result.command,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Database operation failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// User authentication
export async function handleUserSignIn(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const client = await pool.connect();

    try {
      // Get user by email
      const userResult = await client.query(
        "SELECT * FROM users WHERE email = $1",
        [email],
      );

      if (userResult.rows.length === 0) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const user = userResult.rows[0];

      // In a real app, you'd verify the password hash here
      // For demo purposes, we'll accept any password

      // Generate a simple token (in production, use JWT)
      const token = `token_${user.id}_${Date.now()}`;

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          tier: user.tier,
          queriesUsed: user.queries_used,
          queryLimit: user.query_limit,
          credits: user.credits,
          referralCode: user.referral_code,
          referralsCount: user.referrals_count,
          createdAt: user.created_at,
        },
        token,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Sign in error:", error);
    res.status(500).json({
      error: "Sign in failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// User registration
export async function handleUserSignUp(req: Request, res: Response) {
  try {
    const { email, name, password, referralCode } = req.body;

    if (!email || !name || !password) {
      return res
        .status(400)
        .json({ error: "Email, name, and password are required" });
    }

    const client = await pool.connect();

    try {
      // Check if user already exists
      const existingUser = await client.query(
        "SELECT id FROM users WHERE email = $1",
        [email],
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: "User already exists" });
      }

      // Generate unique referral code
      const userReferralCode = `${name.replace(/\s+/g, "").toUpperCase().slice(0, 6)}${Math.floor(Math.random() * 1000)}`;

      // Create new user
      const userResult = await client.query(
        `INSERT INTO users (email, name, referral_code) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
        [email, name, userReferralCode],
      );

      const user = userResult.rows[0];

      // If signed up with referral code, award credits to referrer
      if (referralCode) {
        const referrerResult = await client.query(
          "SELECT id FROM users WHERE referral_code = $1",
          [referralCode],
        );

        if (referrerResult.rows.length > 0) {
          const referrerId = referrerResult.rows[0].id;

          // Award 3 credits to referrer
          await client.query(
            "UPDATE users SET credits = credits + 3, referrals_count = referrals_count + 1 WHERE id = $1",
            [referrerId],
          );

          // Record transaction
          await client.query(
            `INSERT INTO credit_transactions (user_id, type, amount, reason, balance_after) 
             VALUES ($1, 'earned', 3, 'Referral bonus', (SELECT credits FROM users WHERE id = $1))`,
            [referrerId],
          );

          // Award 3 bonus credits to new user too
          await client.query(
            "UPDATE users SET credits = credits + 3 WHERE id = $1",
            [user.id],
          );

          await client.query(
            `INSERT INTO credit_transactions (user_id, type, amount, reason, balance_after) 
             VALUES ($1, 'earned', 3, 'Referral signup bonus', (SELECT credits FROM users WHERE id = $1))`,
            [user.id],
          );
        }
      }

      // Get updated user data
      const updatedUserResult = await client.query(
        "SELECT * FROM users WHERE id = $1",
        [user.id],
      );

      const updatedUser = updatedUserResult.rows[0];

      // Generate token
      const token = `token_${updatedUser.id}_${Date.now()}`;

      res.json({
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          tier: updatedUser.tier,
          queriesUsed: updatedUser.queries_used,
          queryLimit: updatedUser.query_limit,
          credits: updatedUser.credits,
          referralCode: updatedUser.referral_code,
          referralsCount: updatedUser.referrals_count,
          createdAt: updatedUser.created_at,
        },
        token,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Sign up error:", error);
    res.status(500).json({
      error: "Sign up failed",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Get user summaries with books
export async function handleGetUserSummaries(req: Request, res: Response) {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT s.*, 
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
         ORDER BY s.created_at DESC`,
        [userId],
      );

      res.json({ summaries: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get summaries error:", error);
    res.status(500).json({
      error: "Failed to get summaries",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Update user credits
export async function handleUpdateCredits(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { amount, type, reason } = req.body;

    if (!userId || !amount || !type) {
      return res
        .status(400)
        .json({ error: "User ID, amount, and type are required" });
    }

    const client = await pool.connect();

    try {
      // Get current credits
      const userResult = await client.query(
        "SELECT credits FROM users WHERE id = $1",
        [userId],
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const currentCredits = userResult.rows[0].credits;
      const newBalance =
        type === "earned" ? currentCredits + amount : currentCredits - amount;

      // Check if user has enough credits for spending
      if (type === "spent" && currentCredits < amount) {
        return res.status(400).json({ error: "Insufficient credits" });
      }

      // Update user credits
      await client.query("UPDATE users SET credits = $1 WHERE id = $2", [
        newBalance,
        userId,
      ]);

      // Record transaction
      await client.query(
        `INSERT INTO credit_transactions (user_id, type, amount, reason, balance_after) 
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, type, amount, reason || `Credits ${type}`, newBalance],
      );

      res.json({
        success: true,
        newBalance,
        transaction: {
          type,
          amount,
          reason,
          balance_after: newBalance,
        },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Update credits error:", error);
    res.status(500).json({
      error: "Failed to update credits",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Record a share and award credits
export async function handleRecordShare(req: Request, res: Response) {
  try {
    const { userId, summaryId, shareType } = req.body;

    if (!userId || !summaryId || !shareType) {
      return res
        .status(400)
        .json({ error: "User ID, summary ID, and share type are required" });
    }

    const client = await pool.connect();

    try {
      // Record the share
      await client.query(
        `INSERT INTO shares (user_id, summary_id, share_type) 
         VALUES ($1, $2, $3)`,
        [userId, summaryId, shareType],
      );

      // Award 1 credit for sharing
      const userResult = await client.query(
        "SELECT credits FROM users WHERE id = $1",
        [userId],
      );

      const currentCredits = userResult.rows[0].credits;
      const newBalance = currentCredits + 1;

      await client.query("UPDATE users SET credits = $1 WHERE id = $2", [
        newBalance,
        userId,
      ]);

      await client.query(
        `INSERT INTO credit_transactions (user_id, type, amount, reason, balance_after) 
         VALUES ($1, 'earned', 1, 'Shared a summary', $2)`,
        [userId, newBalance],
      );

      res.json({
        success: true,
        creditsAwarded: 1,
        newBalance,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Record share error:", error);
    res.status(500).json({
      error: "Failed to record share",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// Update user settings/profile
export async function handleUpdateUserSettings(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    const { settings } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!settings) {
      return res.status(400).json({ error: "Settings data is required" });
    }

    const client = await pool.connect();

    try {
      // First, try to ensure the settings column exists
      await client.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb
      `);

      // Also ensure updated_at column exists
      await client.query(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      `);

      // Update user settings
      const result = await client.query(
        `UPDATE users
         SET settings = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING *`,
        [JSON.stringify(settings), userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        success: true,
        user: result.rows[0],
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Update user settings error:", error);
    res.status(500).json({
      error: "Failed to update user settings",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

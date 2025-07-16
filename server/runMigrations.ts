import { Pool } from "pg";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log("Running database migrations...");

    // Read and execute the migration file
    const migrationPath = path.join(
      __dirname,
      "migrations",
      "001_create_summaries_table.sql",
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    await client.query(migrationSQL);

    console.log("✅ Migration completed successfully");
  } catch (error) {
    console.error("❌ Migration failed:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();

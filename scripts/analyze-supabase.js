import { Client } from "pg";

const DATABASE_URL = "postgresql://postgres:yahya3793@db.voosuqmkazvjzheipbrl.supabase.co:5432/postgres";

async function analyzeSupabaseDatabase() {
  console.log("🔍 Analyzing Supabase database structure...");

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Connected to Supabase database successfully");

    // Get all tables
    const tables = await client.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables 
      WHERE table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
      ORDER BY table_schema, table_name;
    `);

    console.log("\n📋 Available Tables:");
    console.log("==================");
    tables.rows.forEach(row => {
      console.log(`${row.table_schema}.${row.table_name}`);
    });

    // Check for books table
    const booksCheck = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'books' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    if (booksCheck.rows.length > 0) {
      console.log("\n📚 Books Table Structure:");
      console.log("========================");
      booksCheck.rows.forEach(col => {
        console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });

      // Sample books data
      const sampleBooks = await client.query("SELECT * FROM books LIMIT 3;");
      console.log("\n📖 Sample Books:");
      console.log("================");
      sampleBooks.rows.forEach((book, i) => {
        console.log(`${i + 1}. ${book.title} by ${book.author_name || book.author || 'Unknown'}`);
      });
    }

    // Check for chapters table
    const chaptersCheck = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'chapters' AND table_schema = 'public'
      ORDER BY ordinal_position;
    `);

    if (chaptersCheck.rows.length > 0) {
      console.log("\n📄 Chapters Table Structure:");
      console.log("============================");
      chaptersCheck.rows.forEach(col => {
        console.log(`${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });

      // Count chapters
      const chapterCount = await client.query("SELECT COUNT(*) as count FROM chapters;");
      console.log(`\n📊 Total Chapters: ${chapterCount.rows[0].count}`);

      // Check for vector embeddings
      const vectorCount = await client.query("SELECT COUNT(*) as count FROM chapters WHERE vector_embedding IS NOT NULL;");
      console.log(`🔢 Chapters with Embeddings: ${vectorCount.rows[0].count}`);
    }

    // Check for any functions
    const functions = await client.query(`
      SELECT routine_name, routine_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      ORDER BY routine_name;
    `);

    if (functions.rows.length > 0) {
      console.log("\n🔧 Database Functions:");
      console.log("=====================");
      functions.rows.forEach(func => {
        console.log(`${func.routine_name} (${func.routine_type})`);
      });
    }

    // Check for extensions
    const extensions = await client.query(`
      SELECT extname, extversion
      FROM pg_extension
      WHERE extname NOT IN ('plpgsql')
      ORDER BY extname;
    `);

    console.log("\n🧩 Installed Extensions:");
    console.log("========================");
    extensions.rows.forEach(ext => {
      console.log(`${ext.extname} v${ext.extversion}`);
    });

    await client.end();
    return true;
  } catch (error) {
    console.error("❌ Database analysis failed:", error.message);
    return false;
  }
}

// Run analysis
analyzeSupabaseDatabase()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error("❌ Analysis error:", error);
    process.exit(1);
  });

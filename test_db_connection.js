// Simple test script to verify database connection and API functionality
import { Client } from "pg";
import fetch from "node-fetch";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_pxOZnmV3yI0k@ep-raspy-mode-afhkywlf-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require";

async function testDatabaseConnection() {
  console.log("🔍 Testing database connection...");

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("✅ Database connected successfully");

    // Check available tables
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log(
      "📋 Available tables:",
      tables.rows.map((r) => r.table_name),
    );

    // Check if we have books
    try {
      const bookCount = await client.query("SELECT COUNT(*) FROM books;");
      console.log("📚 Books in database:", bookCount.rows[0].count);

      const chapterCount = await client.query("SELECT COUNT(*) FROM chapters;");
      console.log("📖 Chapters in database:", chapterCount.rows[0].count);

      // Sample data
      const sampleBook = await client.query(
        "SELECT id, title, author_name FROM books LIMIT 1;",
      );
      if (sampleBook.rows.length > 0) {
        console.log("📘 Sample book:", sampleBook.rows[0]);
      }

      const sampleChapter = await client.query(
        "SELECT id, chapter_title, book_id FROM chapters LIMIT 1;",
      );
      if (sampleChapter.rows.length > 0) {
        console.log("📄 Sample chapter:", sampleChapter.rows[0]);
      }
    } catch (error) {
      console.log(
        "⚠️  No books/chapters table found, will be created on first search",
      );
    }

    await client.end();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
}

async function testAPIHealthCheck() {
  console.log("\n🔍 Testing API health check...");

  try {
    const response = await fetch("http://localhost:8080/api/health");
    if (response.ok) {
      const health = await response.json();
      console.log("✅ API health check passed:", health);
      return true;
    } else {
      console.error("❌ API health check failed:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ API health check error:", error.message);
    return false;
  }
}

async function testQueryAnalysis() {
  console.log("\n🔍 Testing query analysis...");

  try {
    const response = await fetch("http://localhost:8080/api/topic/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "leadership" }),
    });

    if (response.ok) {
      const analysis = await response.json();
      console.log("✅ Query analysis working:", {
        isBroad: analysis.analysis.isBroad,
        broadnessScore: analysis.analysis.broadnessScore,
        refinements: analysis.refinements.length,
      });
      return true;
    } else {
      console.error("❌ Query analysis failed:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Query analysis error:", error.message);
    return false;
  }
}

async function testDatabaseSearch() {
  console.log("\n🔍 Testing database search...");

  try {
    const response = await fetch(
      "http://localhost:8080/api/database?q=leadership",
    );

    if (response.ok) {
      const results = await response.json();
      console.log("✅ Database search working:", {
        totalBooks: results.totalBooks,
        totalChapters: results.totalChapters,
        searchType: results.searchType,
        processingTime: results.processingTime + "ms",
      });
      return true;
    } else {
      console.error("❌ Database search failed:", response.status);
      return false;
    }
  } catch (error) {
    console.error("❌ Database search error:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 Starting comprehensive system test...\n");

  const tests = [
    { name: "Database Connection", fn: testDatabaseConnection },
    { name: "API Health Check", fn: testAPIHealthCheck },
    { name: "Query Analysis", fn: testQueryAnalysis },
    { name: "Database Search", fn: testDatabaseSearch },
  ];

  const results = [];

  for (const test of tests) {
    try {
      const result = await test.fn();
      results.push({ name: test.name, passed: result });
    } catch (error) {
      console.error(`❌ ${test.name} test threw error:`, error.message);
      results.push({ name: test.name, passed: false });
    }
  }

  console.log("\n📊 Test Results Summary:");
  console.log("========================");

  results.forEach((result) => {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} - ${result.name}`);
  });

  const allPassed = results.every((r) => r.passed);

  if (allPassed) {
    console.log("\n🎉 All tests passed! System is working correctly.");
  } else {
    console.log("\n⚠️  Some tests failed. Check the logs above for details.");
  }

  return allPassed;
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Test runner error:", error);
      process.exit(1);
    });
}

export { runAllTests };

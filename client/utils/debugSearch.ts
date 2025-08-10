import { supabase } from "@/lib/supabase";

export async function debugSearchIssue(query: string) {
  console.log("🔍 DEBUG: Starting comprehensive search debug for:", query);

  const debugInfo = {
    timestamp: new Date().toISOString(),
    query,
    steps: [],
    errors: [],
    results: null,
  };

  try {
    // Step 1: Test basic Supabase connection
    debugInfo.steps.push("Testing Supabase connection...");
    const { data: connectionTest, error: connectionError } = await supabase
      .from("books")
      .select("id")
      .limit(1);

    if (connectionError) {
      debugInfo.errors.push(`Connection failed: ${connectionError.message}`);
      throw connectionError;
    }
    debugInfo.steps.push("✅ Supabase connection successful");

    // Step 2: Test books table access
    debugInfo.steps.push("Testing books table access...");
    const { data: booksTest, error: booksError } = await supabase
      .from("books")
      .select("id, title, author_name")
      .limit(1);

    if (booksError) {
      debugInfo.errors.push(`Books table error: ${booksError.message}`);
      throw booksError;
    }
    debugInfo.steps.push(
      `✅ Books table accessible (sample: ${booksTest[0]?.title})`,
    );

    // Step 3: Test chapters table access
    debugInfo.steps.push("Testing chapters table access...");
    const { data: chaptersTest, error: chaptersError } = await supabase
      .from("chapters")
      .select("id, chapter_title, book_id")
      .limit(1);

    if (chaptersError) {
      debugInfo.errors.push(`Chapters table error: ${chaptersError.message}`);
      throw chaptersError;
    }
    debugInfo.steps.push(
      `✅ Chapters table accessible (sample: ${chaptersTest[0]?.chapter_title})`,
    );

    // Step 4: Test join query (critical for search)
    debugInfo.steps.push("Testing book-chapter join query...");
    const { data: joinTest, error: joinError } = await supabase
      .from("chapters")
      .select(
        `
        id,
        chapter_title,
        book_id,
        books!inner (
          title,
          author_name,
          cover_url
        )
      `,
      )
      .limit(1);

    if (joinError) {
      debugInfo.errors.push(`Join query error: ${joinError.message}`);
      throw joinError;
    }
    debugInfo.steps.push("✅ Book-chapter join working");

    // Step 5: Test actual search query
    debugInfo.steps.push(`Testing search query for "${query}"...`);
    const { data: searchResults, error: searchError } = await supabase
      .from("chapters")
      .select(
        `
        id,
        chapter_title,
        chapter_text,
        book_id,
        books!inner (
          id,
          title,
          author_name,
          author,
          cover_url,
          isbn_13
        )
      `,
      )
      .or(
        `chapter_title.ilike.%${query}%,chapter_text.ilike.%${query}%,books.title.ilike.%${query}%`,
      )
      .not("chapter_text", "is", null)
      .limit(5);

    if (searchError) {
      debugInfo.errors.push(`Search query error: ${searchError.message}`);
      throw searchError;
    }

    debugInfo.steps.push(
      `✅ Search query successful: ${searchResults?.length || 0} results`,
    );
    debugInfo.results = {
      totalFound: searchResults?.length || 0,
      sampleResults: searchResults?.slice(0, 2).map((r) => ({
        chapter: r.chapter_title,
        book: r.books.title,
        author: r.books.author_name || r.books.author,
      })),
    };

    console.log("✅ DEBUG: Search debug completed successfully", debugInfo);
    return debugInfo;
  } catch (error) {
    debugInfo.errors.push(`Final error: ${error.message}`);
    console.error("❌ DEBUG: Search debug failed", debugInfo);
    return debugInfo;
  }
}

export async function quickSearchTest() {
  console.log("🚀 Quick Search Test Starting...");

  const testQueries = ["leadership", "management", "strategy"];
  const results = {};

  for (const query of testQueries) {
    try {
      const debugResult = await debugSearchIssue(query);
      results[query] = {
        success: debugResult.errors.length === 0,
        resultCount: debugResult.results?.totalFound || 0,
        errors: debugResult.errors,
      };
    } catch (error) {
      results[query] = {
        success: false,
        resultCount: 0,
        errors: [error.message],
      };
    }
  }

  console.log("📊 Quick Search Test Results:", results);
  return results;
}

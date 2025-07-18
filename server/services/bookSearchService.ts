import fetch from "node-fetch";
import dotenv from "dotenv";
import { ChapterDiscoveryService } from "./chapterDatabase";

// Ensure environment variables are loaded
dotenv.config();

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    averageRating?: number;
    ratingsCount?: number;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
  };
}

export interface ChapterMatch {
  chapter: string;
  title: string;
  pages: string;
  relevance: string;
  relevanceScore: number;
  keyTopics: string[];
  why: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  amazonLink: string;
  rating?: number;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  isbn?: string;
  relevantChapters?: ChapterMatch[];
  chapterRelevanceScore?: number; // Total relevance score for this book's chapters
}

export class BookSearchService {
  private apiKey: string;
  private baseUrl = "https://www.googleapis.com/books/v1/volumes";
  private amazonTag: string;

  constructor() {
    this.apiKey = process.env.GOOGLE_BOOKS_API_KEY || "";
    this.amazonTag = process.env.AMAZON_ASSOCIATE_TAG || "summifyai-20";

    console.log(
      "Google Books API Key status:",
      this.apiKey ? `Found (${this.apiKey.substring(0, 10)}...)` : "Missing",
    );

    if (
      !this.apiKey ||
      this.apiKey === "demo-key-replace-with-real-key" ||
      this.apiKey === ""
    ) {
      console.warn(
        "Google Books API key not configured. Book search will use fallback data.",
      );
    }
  }

  async searchBooks(topic: string, maxResults: number = 10): Promise<Book[]> {
    try {
      console.log(`Starting comprehensive search for: "${topic}"`);

      // First, search our curated chapter database
      const chapterBasedResults = ChapterDiscoveryService.findRelevantChapters(
        topic,
        maxResults,
      );

      console.log(
        `Found ${chapterBasedResults.length} books with relevant chapters for "${topic}" in local database`,
      );

      // If we have good results from our database, use them
      if (chapterBasedResults.length >= 3) {
        return chapterBasedResults;
      }

      // If we need more results, search Google Books API
      let googleBooksResults: Book[] = [];
      if (this.apiKey && this.apiKey !== "demo-key-replace-with-real-key") {
        try {
          googleBooksResults = await this.searchGoogleBooks(
            topic,
            maxResults - chapterBasedResults.length,
          );
          console.log(
            `Found ${googleBooksResults.length} additional books from Google Books API`,
          );
        } catch (error) {
          console.error("Google Books API error:", error);
        }
      }

      // Combine results, prioritizing our curated content
      const combinedResults = [...chapterBasedResults];

      // Add Google Books results that don't duplicate our curated content
      for (const googleBook of googleBooksResults) {
        const isDuplicate = combinedResults.some(
          (existing) =>
            existing.title
              .toLowerCase()
              .includes(googleBook.title.toLowerCase()) ||
            googleBook.title
              .toLowerCase()
              .includes(existing.title.toLowerCase()),
        );
        if (!isDuplicate && combinedResults.length < maxResults) {
          combinedResults.push(googleBook);
        }
      }

      // If still not enough results, return fallback
      if (combinedResults.length < maxResults) {
        const fallbackBooks = this.getExpandedBookDatabase().slice(
          0,
          maxResults - combinedResults.length,
        );
        combinedResults.push(
          ...fallbackBooks.filter(
            (fallback) =>
              !combinedResults.some((existing) => existing.id === fallback.id),
          ),
        );
      }

      return combinedResults.slice(0, maxResults);

      return this.getExpandedBookDatabase().slice(0, maxResults);
    } catch (error) {
      console.error("Error searching books:", error);
      return this.getExpandedBookDatabase().slice(0, maxResults);
    }
  }

  private async searchGoogleBooks(
    topic: string,
    maxResults: number,
  ): Promise<Book[]> {
    const query = this.buildSearchQuery(topic);
    const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&maxResults=${maxResults * 2}&key=${this.apiKey}&orderBy=relevance&printType=books&langRestrict=en`;

    console.log(`Searching Google Books for: ${topic}`);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Google Books API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = (await response.json()) as { items?: GoogleBook[] };

    if (!data.items || data.items.length === 0) {
      console.log(`No Google Books found for topic: ${topic}`);
      return [];
    }

    const books = await this.processBooks(data.items, maxResults);
    return books;
  }

  private buildSearchQuery(topic: string): string {
    // Build a more targeted search query
    const searchTerms = [
      topic,
      "business",
      "self-help",
      "leadership",
      "productivity",
      "management",
    ];

    // Use different query strategies based on topic
    if (
      topic.toLowerCase().includes("leadership") ||
      topic.toLowerCase().includes("management")
    ) {
      return `${topic} leadership management business`;
    } else if (
      topic.toLowerCase().includes("productivity") ||
      topic.toLowerCase().includes("habits")
    ) {
      return `${topic} productivity self-improvement habits`;
    } else if (
      topic.toLowerCase().includes("finance") ||
      topic.toLowerCase().includes("money")
    ) {
      return `${topic} finance money investing business`;
    } else {
      return `${topic} business self-help`;
    }
  }

  private async processBooks(
    googleBooks: GoogleBook[],
    maxResults: number,
  ): Promise<Book[]> {
    const processedBooks: Book[] = [];

    for (const googleBook of googleBooks) {
      if (processedBooks.length >= maxResults) break;

      const book = await this.convertGoogleBookToBook(googleBook);
      if (book && this.isQualityBook(book)) {
        processedBooks.push(book);
      }
    }

    // If we don't have enough quality books, fill with fallback
    if (processedBooks.length < maxResults) {
      const fallbackBooks = this.getExpandedBookDatabase().slice(
        0,
        maxResults - processedBooks.length,
      );
      processedBooks.push(...fallbackBooks);
    }

    return processedBooks.slice(0, maxResults);
  }

  private async convertGoogleBookToBook(
    googleBook: GoogleBook,
  ): Promise<Book | null> {
    const volumeInfo = googleBook.volumeInfo;

    if (
      !volumeInfo.title ||
      !volumeInfo.authors ||
      volumeInfo.authors.length === 0
    ) {
      return null;
    }

    const isbn = this.extractISBN(volumeInfo.industryIdentifiers);
    const amazonLink = this.generateAmazonLink(
      volumeInfo.title,
      volumeInfo.authors[0],
      isbn,
    );

    return {
      id: googleBook.id,
      title: volumeInfo.title,
      author: volumeInfo.authors.join(", "),
      cover: this.getCoverImage(volumeInfo.imageLinks),
      description: this.cleanDescription(volumeInfo.description || ""),
      amazonLink,
      rating: volumeInfo.averageRating || 4.0,
      publishedDate: volumeInfo.publishedDate,
      pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories,
      isbn,
    };
  }

  private extractISBN(
    identifiers?: Array<{ type: string; identifier: string }>,
  ): string | undefined {
    if (!identifiers) return undefined;

    const isbn13 = identifiers.find((id) => id.type === "ISBN_13");
    const isbn10 = identifiers.find((id) => id.type === "ISBN_10");

    return isbn13?.identifier || isbn10?.identifier;
  }

  private generateAmazonLink(
    title: string,
    author: string,
    isbn?: string,
  ): string {
    const baseUrl = "https://www.amazon.com/s";
    const searchTerm = isbn || `${title} ${author}`;
    return `${baseUrl}?k=${encodeURIComponent(searchTerm)}&tag=${this.amazonTag}`;
  }

  private getCoverImage(imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  }): string {
    if (imageLinks?.thumbnail) {
      // Use higher resolution by replacing zoom=1 with zoom=0 if present
      return imageLinks.thumbnail
        .replace("http:", "https:")
        .replace("zoom=1", "zoom=0");
    }
    if (imageLinks?.smallThumbnail) {
      return imageLinks.smallThumbnail
        .replace("http:", "https:")
        .replace("zoom=1", "zoom=0");
    }
    return "https://via.placeholder.com/200x300.png?text=No+Cover";
  }

  private cleanDescription(description: string): string {
    // Remove HTML tags and limit length
    return (
      description
        .replace(/<[^>]*>/g, "")
        .replace(/&[^;]+;/g, "")
        .slice(0, 300) + (description.length > 300 ? "..." : "")
    );
  }

  private isQualityBook(book: Book): boolean {
    // Filter out low-quality books
    return (
      book.title.length > 5 &&
      book.author.length > 2 &&
      book.description.length > 50 &&
      !book.title.toLowerCase().includes("test") &&
      !book.title.toLowerCase().includes("sample")
    );
  }

  private getExpandedBookDatabase(): Book[] {
    // Import and return books from the main chapter database
    return ChapterDiscoveryService.getAllBooks();
  }
}

export const bookSearchService = new BookSearchService();

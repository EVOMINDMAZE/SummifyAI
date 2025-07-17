import fetch from "node-fetch";
import dotenv from "dotenv";

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

interface Book {
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
  relevantChapters?: Array<{
    chapter: string;
    title: string;
    pages: string;
    relevance: string;
  }>;
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

  async searchBooks(topic: string, maxResults: number = 5): Promise<Book[]> {
    try {
      // If no API key, return curated fallback books
      if (!this.apiKey || this.apiKey === "demo-key-replace-with-real-key") {
        return this.getFallbackBooks(topic);
      }

      const query = this.buildSearchQuery(topic);
      const url = `${this.baseUrl}?q=${encodeURIComponent(query)}&maxResults=${maxResults * 2}&key=${this.apiKey}&orderBy=relevance&printType=books&langRestrict=en`;

      console.log(`Searching books for topic: ${topic}`);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `Google Books API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = (await response.json()) as { items?: GoogleBook[] };

      if (!data.items || data.items.length === 0) {
        console.log(`No books found for topic: ${topic}, using fallback`);
        return this.getFallbackBooks(topic);
      }

      const books = await this.processBooks(data.items, maxResults);
      console.log(`Found ${books.length} books for topic: ${topic}`);

      return books;
    } catch (error) {
      console.error("Error searching books:", error);
      return this.getFallbackBooks(topic);
    }
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
      const fallbackBooks = this.getFallbackBooks("").slice(
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
      return imageLinks.thumbnail.replace("http:", "https:");
    }
    if (imageLinks?.smallThumbnail) {
      return imageLinks.smallThumbnail.replace("http:", "https:");
    }
    return "https://via.placeholder.com/128x192.png?text=No+Cover";
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

  private getFallbackBooks(topic: string): Book[] {
    // High-quality curated books as fallback
    const fallbackBooks = [
      {
        id: "fallback-1",
        title: "Good to Great",
        author: "Jim Collins",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/0066620996.01.L.jpg",
        description:
          "Uncovers the factors that transform good companies into great ones through rigorous research and analysis.",
        amazonLink: `https://amazon.com/dp/0066620996?tag=${this.amazonTag}`,
        rating: 4.5,
        publishedDate: "2001",
        pageCount: 320,
        categories: ["Business", "Leadership"],
      },
      {
        id: "fallback-2",
        title: "The 7 Habits of Highly Effective People",
        author: "Stephen R. Covey",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/0743269519.01.L.jpg",
        description:
          "A holistic approach to personal and professional effectiveness based on timeless principles.",
        amazonLink: `https://amazon.com/dp/0743269519?tag=${this.amazonTag}`,
        rating: 4.7,
        publishedDate: "1989",
        pageCount: 432,
        categories: ["Self-Help", "Productivity"],
      },
      {
        id: "fallback-3",
        title: "Atomic Habits",
        author: "James Clear",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/0735211299.01.L.jpg",
        description:
          "An easy and proven way to build good habits and break bad ones through small changes.",
        amazonLink: `https://amazon.com/dp/0735211299?tag=${this.amazonTag}`,
        rating: 4.8,
        publishedDate: "2018",
        pageCount: 320,
        categories: ["Self-Help", "Psychology"],
      },
      {
        id: "fallback-4",
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/1585424331.01.L.jpg",
        description:
          "The classic guide to achieving success through positive thinking and personal development.",
        amazonLink: `https://amazon.com/dp/1585424331?tag=${this.amazonTag}`,
        rating: 4.6,
        publishedDate: "1937",
        pageCount: 320,
        categories: ["Business", "Self-Help"],
      },
      {
        id: "fallback-5",
        title: "The Lean Startup",
        author: "Eric Ries",
        cover:
          "https://images-na.ssl-images-amazon.com/images/P/0307887898.01.L.jpg",
        description:
          "How todays entrepreneurs use continuous innovation to create radically successful businesses.",
        amazonLink: `https://amazon.com/dp/0307887898?tag=${this.amazonTag}`,
        rating: 4.4,
        publishedDate: "2011",
        pageCount: 336,
        categories: ["Business", "Entrepreneurship"],
      },
    ];

    return fallbackBooks;
  }
}

export const bookSearchService = new BookSearchService();

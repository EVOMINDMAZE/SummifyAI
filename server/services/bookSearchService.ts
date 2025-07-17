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
      {
        id: "fallback-1",
        title: "Good to Great",
        author: "Jim Collins",
        cover:
          "https://m.media-amazon.com/images/I/51-vOqJOVXL._SX334_BO1,204,203,200_.jpg",
        description:
          "Uncovers the factors that transform good companies into great ones through rigorous research and analysis.",
        amazonLink: `https://amazon.com/dp/0066620996?tag=${this.amazonTag}`,
        rating: 4.5,
        publishedDate: "2001",
        pageCount: 320,
        categories: ["Business", "Leadership"],
        relevantChapters: [
                    {
            chapter: "Chapter 3",
            title: "First Who... Then What",
            pages: "41-64",
            relevance:
              "Core principles of building effective teams and leadership structures",
            relevanceScore: 85,
            keyTopics: ["leadership", "team building", "management"],
            why: "Essential framework for building effective teams and leadership structures",
          },
                    {
            chapter: "Chapter 5",
            title: "The Hedgehog Concept",
            pages: "90-119",
            relevance:
              "Framework for strategic focus and competitive advantage",
            relevanceScore: 88,
            keyTopics: ["strategy", "focus", "competitive advantage"],
            why: "Framework for strategic clarity and focused execution",
          },
                    {
            chapter: "Chapter 7",
            title: "Technology Accelerators",
            pages: "152-178",
            relevance:
              "How technology supports but doesn't drive transformation",
            relevanceScore: 75,
            keyTopics: ["technology", "transformation", "innovation"],
            why: "Understanding how technology supports but doesn't drive transformation",
          },
        ],
      },
      {
        id: "fallback-2",
        title: "The 7 Habits of Highly Effective People",
        author: "Stephen R. Covey",
        cover:
          "https://m.media-amazon.com/images/I/51S35F9CROL._SX327_BO1,204,203,200_.jpg",
        description:
          "A holistic approach to personal and professional effectiveness based on timeless principles.",
        amazonLink: `https://amazon.com/dp/0743269519?tag=${this.amazonTag}`,
        rating: 4.7,
        publishedDate: "1989",
        pageCount: 432,
        categories: ["Self-Help", "Productivity"],
        relevantChapters: [
          {
            chapter: "Habit 2",
            title: "Begin with the End in Mind",
            pages: "95-144",
            relevance: "Strategic planning and vision-setting principles",
          },
          {
            chapter: "Habit 4",
            title: "Think Win-Win",
            pages: "204-234",
            relevance: "Collaborative mindset and relationship building",
          },
          {
            chapter: "Habit 5",
            title: "Seek First to Understand",
            pages: "235-260",
            relevance: "Communication skills and empathetic listening",
          },
        ],
      },
      {
        id: "fallback-3",
        title: "Atomic Habits",
        author: "James Clear",
        cover:
          "https://m.media-amazon.com/images/I/51B7kuFwWeL._SX329_BO1,204,203,200_.jpg",
        description:
          "An easy and proven way to build good habits and break bad ones through small changes.",
        amazonLink: `https://amazon.com/dp/0735211299?tag=${this.amazonTag}`,
        rating: 4.8,
        publishedDate: "2018",
        pageCount: 320,
        categories: ["Self-Help", "Psychology"],
        relevantChapters: [
          {
            chapter: "Chapter 2",
            title: "How Your Habits Shape Your Identity",
            pages: "29-43",
            relevance: "Identity-based habit formation and mindset shifts",
          },
          {
            chapter: "Chapter 12",
            title: "The Law of Least Effort",
            pages: "149-162",
            relevance: "Environment design and reducing friction",
          },
          {
            chapter: "Chapter 16",
            title: "How to Stick with Good Habits",
            pages: "193-208",
            relevance: "Consistency strategies and habit stacking",
          },
        ],
      },
      {
        id: "fallback-4",
        title: "Think and Grow Rich",
        author: "Napoleon Hill",
        cover:
          "https://m.media-amazon.com/images/I/41x4tVNrXCL._SX331_BO1,204,203,200_.jpg",
        description:
          "The classic guide to achieving success through positive thinking and personal development.",
        amazonLink: `https://amazon.com/dp/1585424331?tag=${this.amazonTag}`,
        rating: 4.6,
        publishedDate: "1937",
        pageCount: 320,
        categories: ["Business", "Self-Help"],
        relevantChapters: [
          {
            chapter: "Chapter 1",
            title: "Thoughts Are Things",
            pages: "25-38",
            relevance: "Foundation of thought power and mental transformation",
          },
          {
            chapter: "Chapter 6",
            title: "Organized Planning",
            pages: "109-140",
            relevance: "Strategic planning and leadership principles",
          },
          {
            chapter: "Chapter 11",
            title: "The Mystery of Sex Transmutation",
            pages: "187-202",
            relevance: "Energy channeling and creative force dynamics",
          },
        ],
      },
      {
        id: "fallback-5",
        title: "The Lean Startup",
        author: "Eric Ries",
        cover:
          "https://m.media-amazon.com/images/I/51T-sMqSMiL._SX329_BO1,204,203,200_.jpg",
        description:
          "How todays entrepreneurs use continuous innovation to create radically successful businesses.",
        amazonLink: `https://amazon.com/dp/0307887898?tag=${this.amazonTag}`,
        rating: 4.4,
        publishedDate: "2011",
        pageCount: 336,
        categories: ["Business", "Entrepreneurship"],
        relevantChapters: [
          {
            chapter: "Chapter 4",
            title: "Experiment",
            pages: "78-104",
            relevance: "Building and testing minimum viable products",
          },
          {
            chapter: "Chapter 7",
            title: "Measure",
            pages: "117-143",
            relevance:
              "Innovation accounting and metric-driven decision making",
          },
          {
            chapter: "Chapter 8",
            title: "Pivot (or Persevere)",
            pages: "149-172",
            relevance: "Strategic direction changes and adaptation strategies",
          },
        ],
      },
    ];

    return expandedDatabase;
  }
}

export const bookSearchService = new BookSearchService();
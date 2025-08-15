import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  ChevronRight,
  Lightbulb,
  Crown,
  Lock,
  ArrowUpCircle,
  Sparkles,
} from "lucide-react";
import AIRelevanceScore from "@/components/AIRelevanceScore";
import type {
  TieredSearchResponse,
  SearchResult,
} from "@/services/tieredSearchService";

interface TieredSearchResultsProps {
  searchResponse: TieredSearchResponse;
  query: string;
  userPlan: string;
  onUpgrade: () => void;
}

// Mock chapters for free plan teasing
const MOCK_CHAPTERS = [
  {
    id: "mock-1",
    chapterTitle: "Advanced Strategies and Implementation",
    relevanceScore: 0.92,
    whyRelevant:
      "This chapter covers advanced techniques and real-world applications that build upon the foundational concepts.",
    keyTopics: ["Strategy", "Implementation", "Leadership"],
  },
  {
    id: "mock-2",
    chapterTitle: "Case Studies and Practical Examples",
    relevanceScore: 0.89,
    whyRelevant:
      "Real-world case studies that demonstrate successful application of these principles in various industries.",
    keyTopics: ["Case Studies", "Examples", "Best Practices"],
  },
  {
    id: "mock-3",
    chapterTitle: "Expert Insights and Future Trends",
    relevanceScore: 0.87,
    whyRelevant:
      "Forward-thinking analysis and expert perspectives on emerging trends and future developments.",
    keyTopics: ["Trends", "Innovation", "Future"],
  },
];

// Mock books for free plan teasing
const MOCK_BOOKS = [
  {
    title: "Leadership in the Digital Age",
    author: "Dr. Sarah Johnson",
    chapters: [
      {
        id: "mock-book-1-1",
        chapterTitle: "Transforming Traditional Leadership",
        relevanceScore: 0.91,
        whyRelevant:
          "Explores how digital transformation requires new leadership approaches.",
        keyTopics: [
          "Digital Leadership",
          "Transformation",
          "Change Management",
        ],
      },
      {
        id: "mock-book-1-2",
        chapterTitle: "Building Remote Teams",
        relevanceScore: 0.88,
        whyRelevant:
          "Provides frameworks for leading distributed teams effectively.",
        keyTopics: ["Remote Work", "Team Building", "Communication"],
      },
    ],
  },
  {
    title: "Strategic Thinking for Entrepreneurs",
    author: "Michael Chen",
    chapters: [
      {
        id: "mock-book-2-1",
        chapterTitle: "Vision to Execution Framework",
        relevanceScore: 0.85,
        whyRelevant:
          "Demonstrates how to translate strategic vision into actionable plans.",
        keyTopics: ["Strategy", "Execution", "Planning"],
      },
    ],
  },
];

export default function TieredSearchResults({
  searchResponse,
  query,
  userPlan,
  onUpgrade,
}: TieredSearchResultsProps) {
  const navigate = useNavigate();
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());

  const isFree = userPlan === "free";

  // Group search results into books with chapters
  const groupedResults = groupResultsByBook(searchResponse.results);

  // For free users, show first 3 books normally, then grayed out books
  const allBookEntries = Object.entries(groupedResults);
  const normalBooks = isFree ? allBookEntries.slice(0, 3) : allBookEntries;
  const grayedOutBooks = isFree ? allBookEntries.slice(3) : [];

  const mockBooksToShow = isFree ? MOCK_BOOKS : [];

  const handleChapterClick = (result: SearchResult) => {
    navigate(`/chapter/${result.bookTitle.replace(/\s+/g, "-")}/${result.id}`, {
      state: {
        query,
        selectedChapter: result,
      },
    });
  };

  const toggleBookExpansion = (bookTitle: string) => {
    const newExpanded = new Set(expandedBooks);
    if (newExpanded.has(bookTitle)) {
      newExpanded.delete(bookTitle);
    } else {
      newExpanded.add(bookTitle);
    }
    setExpandedBooks(newExpanded);
  };

  if (searchResponse.results.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No results found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Try different keywords or check your spelling
          </p>
          {isFree && (
            <Button
              onClick={onUpgrade}
              variant="outline"
              className="border-[#FFFD63] text-[#FFFD63] hover:bg-[#FFFD63] hover:text-[#0A0B1E]"
            >
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Upgrade for Better Search
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Results for "{query}"
          </h2>
          <div className="flex gap-3 text-sm">
            <Badge variant="outline">
              {Object.keys(groupedResults).length} books
            </Badge>
            <Badge variant="outline">
              {searchResponse.results.length} chapters
            </Badge>
          </div>
        </div>

        <Badge className={`${getPlanBadgeColor(userPlan)} font-semibold`}>
          {searchResponse.searchTier.name} Plan
        </Badge>
      </div>

      {/* Book Results */}
      <div className="grid gap-4">
        {/* Normal Books (First 3 for free users, all for paid users) */}
        {normalBooks.map(([bookTitle, chapters], bookIndex) => {
          const firstChapter = chapters[0];
          const isExpanded = expandedBooks.has(bookTitle);

          // For normal books, show all chapters (no restrictions for first 3 books)
          const displayChapters = chapters;
          const mockChaptersToShow: any[] = []; // No mock chapters for normal books anymore

          return (
            <Card
              key={bookTitle}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm hover:shadow-md transition-all"
            >
              <CardContent className="p-6">
                <div className="flex gap-6">
                  {/* Book Cover */}
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="w-24 h-36 relative overflow-hidden rounded-xl shadow-lg">
                        <img
                          src={generateBookCover(bookTitle)}
                          alt={bookTitle}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.src = `https://via.placeholder.com/200x300/FFFD63/0A0B1E?text=${encodeURIComponent(bookTitle.split(" ").slice(0, 2).join(" "))}`;
                          }}
                        />
                      </div>
                      {/* Rank Badge */}
                      <div className="absolute -top-2 -left-2 w-6 h-6 bg-[#0A0B1E] text-[#FFFD63] rounded-full flex items-center justify-center text-xs font-bold">
                        {bookIndex + 1}
                      </div>
                    </div>
                  </div>

                  {/* Book Info & Chapters */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {bookTitle}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            Author Name
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {chapters.length +
                              (isFree ? mockChaptersToShow.length : 0)}{" "}
                            chapters
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-4">
                        <AIRelevanceScore
                          score={
                            Math.round(chapters[0]?.relevanceScore * 100) || 85
                          }
                          size="lg"
                          showBar={true}
                          query={query}
                        />
                      </div>
                    </div>

                    {/* Real Chapters */}
                    <div className="grid gap-3">
                      {displayChapters
                        .slice(0, isExpanded ? displayChapters.length : 3)
                        .map((chapter, index) => (
                          <ChapterCard
                            key={chapter.id}
                            chapter={chapter}
                            index={index}
                            query={query}
                            onClick={() => handleChapterClick(chapter)}
                            isAccessible={true}
                          />
                        ))}

                    </div>

                    {/* View More Button */}
                    {chapters.length > 3 && !isExpanded && (
                      <div className="mt-4 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleBookExpansion(bookTitle)}
                          className="border-[#FFFD63]/50 text-[#0A0B1E] dark:text-[#FFFD63] hover:bg-[#FFFD63]/10"
                        >
                          View all {chapters.length} chapters
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Mock Books for Free Users */}
        {isFree &&
          mockBooksToShow.map((mockBook, mockIndex) => (
            <MockBookCard
              key={`mock-book-${mockIndex}`}
              book={mockBook}
              bookIndex={displayBooks.length + mockIndex}
              query={query}
              onUpgrade={onUpgrade}
            />
          ))}
      </div>

      {/* Marketing CTA for more results */}
      {searchResponse.results.length > 0 && userPlan !== "institution" && (
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 text-[#FFFD63] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {userPlan === "free"
                ? "Want to Unlock More Chapters?"
                : "Want More Powerful Search?"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {userPlan === "free"
                ? "Unlock all books and chapters, get AI-powered insights, and access 500 searches per month!"
                : userPlan === "scholar"
                  ? "Upgrade to Professional for word-by-word precision search and 4x more queries!"
                  : "Upgrade to Institution for unlimited searches and team collaboration!"}
            </p>
            <Button
              onClick={onUpgrade}
              className="bg-[#FFFD63] hover:bg-[#FFFD63]/90 text-[#0A0B1E] font-semibold"
            >
              <Crown className="w-4 h-4 mr-2" />
              {userPlan === "free" ? "Unlock All Results" : "See All Plans"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface ChapterCardProps {
  chapter: SearchResult | (typeof MOCK_CHAPTERS)[0];
  index: number;
  query: string;
  onClick: () => void;
  isAccessible: boolean;
  isMock?: boolean;
}

// Type guard to check if it's a SearchResult
function isSearchResult(
  chapter: SearchResult | (typeof MOCK_CHAPTERS)[0],
): chapter is SearchResult {
  return "bookTitle" in chapter;
}

function ChapterCard({
  chapter,
  index,
  query,
  onClick,
  isAccessible,
  isMock,
}: ChapterCardProps) {
  return (
    <div
      onClick={isAccessible ? onClick : undefined}
      className={`group rounded-xl p-4 transition-all border ${
        isAccessible
          ? "cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-[#FFFD63]/10 dark:hover:bg-[#FFFD63]/5 border-transparent hover:border-[#FFFD63]/30"
          : "bg-gray-100/50 dark:bg-gray-800/50 opacity-60 border-gray-200 dark:border-gray-600"
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
              isAccessible
                ? "bg-[#0A0B1E] text-[#FFFD63]"
                : "bg-gray-300 dark:bg-gray-600 text-gray-500"
            }`}
          >
            {isAccessible ? index + 1 : <Lock className="w-4 h-4" />}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h4
              className={`font-semibold text-sm line-clamp-2 ${
                isAccessible
                  ? "text-[#0A0B1E] dark:text-white group-hover:text-[#0A0B1E]/80 dark:group-hover:text-white/80"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {isSearchResult(chapter)
                ? chapter.chapterTitle
                : chapter.chapterTitle}
            </h4>
            <div className={`${!isAccessible ? "opacity-50" : ""}`}>
              <AIRelevanceScore
                score={Math.round(chapter.relevanceScore * 100)}
                size="sm"
                showBar={true}
                query={query}
              />
            </div>
          </div>

          {/* Why Relevant */}
          <div
            className={`rounded-lg p-3 mb-3 ${
              isAccessible
                ? "bg-[#FFFD63]/10 dark:bg-[#FFFD63]/5"
                : "bg-gray-100/50 dark:bg-gray-700/30"
            }`}
          >
            <div className="flex items-start gap-2">
              <Lightbulb
                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isAccessible
                    ? "text-[#0A0B1E] dark:text-[#FFFD63]"
                    : "text-gray-400"
                }`}
              />
              <div>
                <p
                  className={`text-xs font-medium mb-1 ${
                    isAccessible
                      ? "text-[#0A0B1E] dark:text-white"
                      : "text-gray-500"
                  }`}
                >
                  Why this chapter matches:
                </p>
                <p
                  className={`text-xs line-clamp-2 ${
                    isAccessible
                      ? "text-[#0A0B1E]/80 dark:text-gray-300"
                      : "text-gray-400"
                  }`}
                >
                  {chapter.whyRelevant ||
                    `This chapter provides direct insights into ${query} with practical applications.`}
                </p>
              </div>
            </div>
          </div>

          {/* Key Topics */}
          {chapter.keyTopics && chapter.keyTopics.length > 0 && (
            <div className="flex gap-1 flex-wrap mb-2">
              {chapter.keyTopics.slice(0, 3).map((topic, topicIndex) => (
                <span
                  key={topicIndex}
                  className={`text-xs px-2 py-1 rounded-full ${
                    isAccessible
                      ? "bg-[#FFFD63]/20 dark:bg-[#FFFD63]/10 text-[#0A0B1E] dark:text-[#FFFD63]"
                      : "bg-gray-200 dark:bg-gray-600 text-gray-500"
                  }`}
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          {!isAccessible && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Crown className="w-3 h-3" />
              <span>Upgrade to read this chapter</span>
            </div>
          )}
        </div>

        {isAccessible && (
          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#0A0B1E] dark:group-hover:text-[#FFFD63] transition-colors flex-shrink-0" />
        )}
      </div>
    </div>
  );
}

// Helper functions
function groupResultsByBook(results: SearchResult[]) {
  return results.reduce(
    (groups, result) => {
      const bookTitle = result.bookTitle;
      if (!groups[bookTitle]) {
        groups[bookTitle] = [];
      }
      groups[bookTitle].push(result);
      return groups;
    },
    {} as Record<string, SearchResult[]>,
  );
}

function generateBookCover(title: string): string {
  // Generate a consistent placeholder based on book title
  const colors = ["4F46E5", "059669", "DC2626", "D97706", "7C3AED", "DB2777"];
  const colorIndex = title.length % colors.length;
  const encodedTitle = encodeURIComponent(
    title.split(" ").slice(0, 3).join(" "),
  );
  return `https://via.placeholder.com/200x300/${colors[colorIndex]}/FFFFFF?text=${encodedTitle}`;
}

function MockBookCard({
  book,
  bookIndex,
  query,
  onUpgrade,
}: {
  book: (typeof MOCK_BOOKS)[0];
  bookIndex: number;
  query: string;
  onUpgrade: () => void;
}) {
  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm opacity-60 relative overflow-hidden">
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-8 h-8 text-[#FFFD63] mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Unlock this book
          </p>
          <Button
            onClick={onUpgrade}
            size="sm"
            className="bg-[#FFFD63] hover:bg-[#FFFD63]/90 text-[#0A0B1E] font-semibold"
          >
            Upgrade Now
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-36 relative overflow-hidden rounded-xl shadow-lg">
                <img
                  src={generateBookCover(book.title)}
                  alt={book.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
              {/* Rank Badge */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {bookIndex + 1}
              </div>
            </div>
          </div>

          {/* Book Info & Chapters */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1 line-clamp-2">
                  {book.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {book.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {book.chapters.length} chapters
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 ml-4 opacity-50">
                <AIRelevanceScore
                  score={
                    Math.round(book.chapters[0]?.relevanceScore * 100) || 85
                  }
                  size="lg"
                  showBar={true}
                  query={query}
                />
              </div>
            </div>

            {/* Mock Chapters */}
            <div className="grid gap-3">
              {book.chapters.map((chapter, index) => (
                <ChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  index={index}
                  query={query}
                  onClick={onUpgrade}
                  isAccessible={false}
                  isMock={true}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function getPlanBadgeColor(plan: string) {
  switch (plan) {
    case "free":
      return "bg-gray-100 text-gray-800";
    case "scholar":
      return "bg-amber-100 text-amber-800";
    case "professional":
      return "bg-green-100 text-green-800";
    case "institution":
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

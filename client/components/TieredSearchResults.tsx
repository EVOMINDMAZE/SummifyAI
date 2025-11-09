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

// Keep the mock chapters for individual chapter mocking
// (now used in grayed out books with generated mock details)

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

  // For free users, show first 1 book normally, then grayed out books
  const allBookEntries = Object.entries(groupedResults);
  const normalBooks = isFree ? allBookEntries.slice(0, 1) : allBookEntries;
  const grayedOutBooks = isFree ? allBookEntries.slice(1) : [];

  // Calculate actual locked books based on total found (not limited results)
  // This shows the user the real power of the app
  const actualLockedBooksCount = isFree
    ? Math.max(0, searchResponse.totalBooksFound - 1)
    : 0;

  const actualLockedChaptersCount = isFree
    ? Math.max(0, searchResponse.totalChaptersFound - normalBooks.reduce((sum, [_, chapters]) => sum + chapters.length, 0))
    : 0;

  // No longer need mock books - using grayed out real books instead

  const handleChapterClick = (result: SearchResult) => {
    // Store the current search results page for back navigation
    sessionStorage.setItem("lastSearchResults", JSON.stringify({
      query,
      results: searchResponse.results,
      totalBooksFound: searchResponse.totalBooksFound,
      totalChaptersFound: searchResponse.totalChaptersFound,
      searchTier: searchResponse.searchTier,
      queriesUsed: searchResponse.queriesUsed,
      queriesRemaining: searchResponse.queriesRemaining,
      upgradeRequired: searchResponse.upgradeRequired,
      userPlan,
    }));

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
      {/* Results Header - Enhanced */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div className="flex-1">
            <p className="text-sm font-medium text-[#667eea] dark:text-[#FFFD63] mb-2">
              Search Results
            </p>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
              Results for "{query}"
            </h1>

            {/* Prominent Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#667eea] to-[#FFFD63] rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white dark:bg-gray-800 px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-3xl lg:text-4xl font-black text-[#667eea] dark:text-[#FFFD63]">
                    {searchResponse.totalBooksFound}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Book{searchResponse.totalBooksFound !== 1 ? 's' : ''} Found
                  </div>
                </div>
              </div>

              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFFD63] to-[#667eea] rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white dark:bg-gray-800 px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="text-3xl lg:text-4xl font-black text-[#FFFD63] dark:text-[#667eea]">
                    {searchResponse.totalChaptersFound}
                  </div>
                  <div className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Chapter{searchResponse.totalChaptersFound !== 1 ? 's' : ''} Available
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <Badge className={`${getPlanBadgeColor(userPlan)} font-semibold px-4 py-2 text-base`}>
              {searchResponse.searchTier.name} Plan
            </Badge>
          </div>
        </div>
      </div>

      {/* Book Results */}
      <div className="grid gap-6">
        {/* Normal Books (First 1 for free users, all for paid users) */}
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
                            target.src = `https://dummyimage.com/200x300/FFFD63/0A0B1E&text=${encodeURIComponent(bookTitle.split(" ").slice(0, 2).join(" "))}`;
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

        {/* Combined Locked Books Display for Free Users */}
        {actualLockedBooksCount > 0 && (
          <GrayedOutBooksPreview
            totalLockedBooks={actualLockedBooksCount}
            totalLockedChapters={actualLockedChaptersCount}
            allGrayedOutBooks={grayedOutBooks}
            query={query}
            onUpgrade={onUpgrade}
          />
        )}
      </div>

      {/* Marketing CTA for more results */}
      {searchResponse.results.length > 0 && userPlan !== "institution" && (
        <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
          <CardContent className="p-6 text-center">
            <Sparkles className="w-12 h-12 text-[#FFFD63] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {userPlan === "free"
                ? "Want to Unlock All Books?"
                : "Want More Powerful Search?"}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {userPlan === "free"
                ? `You've seen ${normalBooks.length} book. Unlock ${grayedOutBooks.length}+ more books and get AI-powered insights with 500 searches per month!`
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
    title.split(" ").slice(0, 2).join(" "),
  );
  // Use a more reliable placeholder service with better parameters
  return `https://dummyimage.com/200x300/${colors[colorIndex]}/ffffff&text=${encodedTitle}`;
}

function GrayedOutBooksPreview({
  totalLockedBooks,
  totalLockedChapters,
  allGrayedOutBooks,
  query,
  onUpgrade,
}: {
  totalLockedBooks: number;
  totalLockedChapters: number;
  allGrayedOutBooks: [string, SearchResult[]][];
  query: string;
  onUpgrade: () => void;
}) {
  const avgRelevance = Math.round(
    allGrayedOutBooks.reduce(
      (sum, [_, chapters]) => sum + (chapters[0]?.relevanceScore || 0.75),
      0,
    ) / allGrayedOutBooks.length * 100
  );

  return (
    <Card className="bg-gradient-to-br from-[#0A0B1E]/95 via-[#1a1f4f]/95 to-[#667eea]/5 dark:from-[#0A0B1E] dark:via-[#1a1f4f] dark:to-[#0A0B1E] border border-[#667eea]/30 dark:border-[#FFFD63]/20 rounded-3xl shadow-2xl relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#FFFD63] via-[#667eea] to-transparent rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#667eea] via-[#FFFD63] to-transparent rounded-full blur-3xl opacity-10"></div>
      </div>

      <CardContent className="p-10 relative z-10">
        <div className="flex flex-col lg:flex-row gap-10 items-center">
          {/* Left side - Books Preview */}
          <div className="flex-shrink-0">
            <div className="relative w-40 h-52">
              {/* Stacked book covers effect */}
              {allGrayedOutBooks.slice(0, 3).map(([bookTitle], idx) => (
                <div
                  key={bookTitle}
                  className="absolute rounded-xl shadow-lg overflow-hidden"
                  style={{
                    width: "120px",
                    height: "180px",
                    transform: `rotate(${-8 + idx * 4}deg) translate(${idx * 20}px, ${idx * 15}px)`,
                    zIndex: idx,
                  }}
                >
                  <img
                    src={generateBookCover(bookTitle)}
                    alt={bookTitle}
                    className="w-full h-full object-cover filter grayscale opacity-80"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = `https://dummyimage.com/200x300/999999/FFFFFF`;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
              ))}

              {/* Lock badge */}
              <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-gradient-to-br from-[#FFFD63] to-[#FFD700] rounded-full flex items-center justify-center shadow-lg border-4 border-[#0A0B1E]">
                <Lock className="w-8 h-8 text-[#0A0B1E]" />
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex-1">
            <p className="text-[#FFFD63] text-sm font-bold mb-2 uppercase tracking-wider">
              🔒 Locked Premium Content
            </p>

            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4 leading-tight">
              See {totalLockedBooks} More Books
            </h2>

            <p className="text-gray-300 mb-6 text-base leading-relaxed">
              You've unlocked content from one book. Upgrade your plan to access all {totalLockedBooks} books with {totalLockedChapters}+ highly relevant chapters for "{query}".
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-[#FFFD63]/20">
                <div className="text-3xl font-black text-[#FFFD63]">
                  {totalLockedBooks}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Book{totalLockedBooks !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-[#667eea]/20">
                <div className="text-3xl font-black text-[#667eea]">
                  {totalLockedChapters}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Chapter{totalLockedChapters !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-green-400/20">
                <div className="text-3xl font-black text-green-400">
                  {avgRelevance}%
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Avg Relevance
                </div>
              </div>
            </div>

            {/* CTA Button - Large and prominent */}
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-[#FFFD63] via-[#FFD700] to-[#FFFD63] hover:from-[#FFD700] hover:via-[#FFFD63] hover:to-[#FFD700] text-[#0A0B1E] font-black py-4 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 text-lg"
            >
              <Crown className="w-6 h-6 mr-3" />
              Unlock All {totalLockedBooks} Books Now
            </Button>

            <p className="text-center text-gray-400 text-xs mt-4">
              Get 500 searches/month and access to all chapters with Scholar Plan
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GrayedOutBookCard({
  bookTitle,
  chapters,
  bookIndex,
  query,
  onUpgrade,
}: {
  bookTitle: string;
  chapters: SearchResult[];
  bookIndex: number;
  query: string;
  onUpgrade: () => void;
}) {
  // Count relevant chapters from this locked book
  const relevantChapterCount = chapters.length;

  return (
    <Card className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200/70 dark:border-gray-700/70 rounded-2xl shadow-sm relative overflow-hidden group hover:shadow-md transition-all duration-300">
      {/* Premium locked indicator - subtle background pattern */}
      <div className="absolute inset-0 opacity-40 dark:opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"></div>
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#FFFD63]/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <CardContent className="p-8 relative z-10">
        <div className="flex gap-6 items-center">
          {/* Book Cover - Teaser */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-24 h-36 relative overflow-hidden rounded-xl shadow-lg opacity-60 group-hover:opacity-75 transition-opacity duration-300">
                <img
                  src={generateBookCover(bookTitle)}
                  alt={bookTitle}
                  className="absolute inset-0 w-full h-full object-cover filter grayscale"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.src = `https://dummyimage.com/200x300/999999/FFFFFF&text=${encodeURIComponent(bookTitle.split(" ").slice(0, 2).join(" "))}`;
                  }}
                />
              </div>
              {/* Rank Badge */}
              <div className="absolute -top-2 -left-2 w-6 h-6 bg-gray-400 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {bookIndex + 1}
              </div>
              {/* Lock icon - prominent */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Area - Teaser Info */}
          <div className="flex-1 min-w-0">
            {/* Hidden titles - visual attraction only */}
            <div className="mb-6">
              <h3 className="text-gray-400 dark:text-gray-500 text-sm font-medium mb-2">
                Premium Content
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded-full mb-3 w-3/4"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2 w-full"></div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full w-4/5"></div>
                </div>
              </div>
            </div>

            {/* Stats about what's unlocked */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#FFFD63] mb-1">
                  {relevantChapterCount}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Chapters
                </div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-[#667eea] mb-1">
                  {Math.round(chapters[0]?.relevanceScore * 100) || 78}%
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Relevance
                </div>
              </div>
              <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
                <Crown className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Premium
                </div>
              </div>
            </div>

            {/* Teaser text - no chapter titles */}
            <div className="bg-gradient-to-r from-[#FFFD63]/10 via-[#667eea]/10 to-[#FFFD63]/10 dark:from-[#FFFD63]/5 dark:via-[#667eea]/5 dark:to-[#FFFD63]/5 rounded-lg p-4 mb-4 border border-[#FFFD63]/20 dark:border-[#FFFD63]/10">
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <span className="font-semibold text-[#0A0B1E] dark:text-[#FFFD63]">
                  {relevantChapterCount}+ chapters
                </span>{" "}
                highly relevant to &quot;{query}&quot; await you in this premium content.
              </p>
            </div>

            {/* Main CTA Button */}
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-[#FFFD63] via-[#FFD700] to-[#FFFD63] hover:from-[#FFD700] hover:via-[#FFFD63] hover:to-[#FFD700] text-[#0A0B1E] font-bold py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Crown className="w-5 h-5 mr-2" />
              Unlock Premium Access
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// MockBookCard component removed - now using GrayedOutBookCard for real books

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

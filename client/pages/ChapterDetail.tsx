import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AIRelevanceScore from "@/components/AIRelevanceScore";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Clock,
  Star,
  ExternalLink,
  Share2,
  Lightbulb,
  Target,
  TrendingUp,
  CheckCircle,
} from "lucide-react";

interface ChapterDetail {
  id: number;
  title: string;
  snippet: string;
  fullText?: string;
  relevanceScore: number;
  whyRelevant: string;
  keyTopics: string[];
  coreLeadershipPrinciples?: string[];
  practicalApplications?: string[];
  aiSummary?: string;
  recommendations?: string[];
}

interface BookDetail {
  id: string;
  title: string;
  author: string;
  cover: string;
  isbn: string;
  publishedDate?: string;
  pageCount?: number;
  rating?: number;
  description?: string;
  amazonLink?: string;
}

interface LocationState {
  query: string;
  bookGroup: {
    id: string;
    title: string;
    author: string;
    cover: string;
    isbn: string;
    topChapters: ChapterDetail[];
  };
}

export default function ChapterDetail() {
  const { bookId, chapterId } = useParams<{
    bookId: string;
    chapterId: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [chapterDetail, setChapterDetail] = useState<ChapterDetail | null>(
    null,
  );
  const [bookDetail, setBookDetail] = useState<BookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [query, setQuery] = useState<string>("");

  // Extract data from navigation state
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.bookGroup && state?.query) {
      setQuery(state.query);

      // Find the specific chapter
      const chapter = state.bookGroup.topChapters.find(
        (ch) => ch.id.toString() === chapterId,
      );

      if (chapter) {
        setChapterDetail(chapter);
        setBookDetail({
          id: state.bookGroup.id,
          title: state.bookGroup.title,
          author: state.bookGroup.author,
          cover: state.bookGroup.cover,
          isbn: state.bookGroup.isbn,
          amazonLink: `https://amazon.com/s?k=${encodeURIComponent(state.bookGroup.title + " " + state.bookGroup.author)}&tag=summifyai-20`,
        });
        setIsLoading(false);

        // Enrich the chapter with additional AI content if needed
        if (
          !chapter.coreLeadershipPrinciples ||
          chapter.coreLeadershipPrinciples.length === 0
        ) {
          enrichChapterContent(chapter, state.query);
        }
      } else {
        console.error("Chapter not found in navigation state");
        setIsLoading(false);
      }
    } else {
      // Fallback: fetch chapter data directly
      fetchChapterDetail();
    }
  }, [bookId, chapterId, location.state]);

  const fetchChapterDetail = async () => {
    if (!bookId || !chapterId) return;

    try {
      setIsLoading(true);

      // This would be a real API call to fetch chapter details
      // For now, we'll show an error since we need the navigation state
      console.error("No navigation state found - chapter details unavailable");
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching chapter detail:", error);
      setIsLoading(false);
    }
  };

  const enrichChapterContent = async (
    chapter: ChapterDetail,
    userQuery: string,
  ) => {
    if (!chapter || !userQuery) return;

    setIsEnriching(true);
    try {
      const response = await fetch("/api/enrich", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chapterId: chapter.id,
          userQuery: userQuery,
          chapterText: chapter.snippet,
          chapterTitle: chapter.title,
          bookTitle: bookDetail?.title,
          bookAuthor: bookDetail?.author,
        }),
      });

      if (response.ok) {
        const enrichmentData = await response.json();

        setChapterDetail((prev) => ({
          ...prev!,
          coreLeadershipPrinciples:
            enrichmentData.coreLeadershipPrinciples || [],
          practicalApplications: enrichmentData.practicalApplications || [],
          aiSummary: enrichmentData.aiSummary,
          recommendations: enrichmentData.recommendations || [],
        }));

        console.log("✅ Chapter enrichment completed");
      }
    } catch (error) {
      console.error("Chapter enrichment failed:", error);
    } finally {
      setIsEnriching(false);
    }
  };

  const handleBackToResults = () => {
    const hasSearchResults = sessionStorage.getItem("lastSearchResults");
    if (hasSearchResults) {
      navigate("/generate");
    } else {
      navigate(-1);
    }
  };

  const handleShare = () => {
    if (!chapterDetail || !bookDetail) return;

    const shareText = `Check out "${chapterDetail.title}" from "${bookDetail.title}" by ${bookDetail.author} - ${chapterDetail.relevanceScore}% match for "${query}"`;

    if (navigator.share) {
      navigator.share({
        title: `${chapterDetail.title} - Chapter Discovery`,
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      // You could show a toast notification here
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#667eea] mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading chapter details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chapterDetail || !bookDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Chapter Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We couldn't find the chapter you're looking for.
            </p>
            <Button
              onClick={() => navigate("/generate")}
              className="bg-[#667eea] hover:bg-[#5a67d8]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            onClick={handleBackToResults}
            variant="outline"
            className="flex items-center space-x-2 border-2 border-[#667eea] text-[#667eea] hover:bg-[#667eea] hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Results</span>
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Information Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur-md rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                {/* Book Cover */}
                <div className="text-center mb-6">
                  <div className="relative group">
                    {/* Book cover container with proper aspect ratio */}
                    <div className="aspect-[2/3] w-full relative overflow-hidden rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-500 border-4 border-white/50 dark:border-gray-700/50">
                      <img
                        src={bookDetail.cover}
                        alt={bookDetail.title}
                        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.src = `https://via.placeholder.com/300x450/667eea/FFFFFF?text=${encodeURIComponent(bookDetail.title.split(" ").slice(0, 3).join(" "))}`;
                        }}
                      />
                      {/* Subtle overlay for visual enhancement */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    {/* Glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] rounded-2xl blur opacity-20 group-hover:opacity-40 transition-opacity duration-500 -z-10"></div>
                  </div>
                </div>

                {/* Book Details */}
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    {bookDetail.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 flex items-center justify-center">
                    <Users className="w-4 h-4 mr-2" />
                    {bookDetail.author}
                  </p>
                  {bookDetail.publishedDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center justify-center mt-2">
                      <Clock className="w-4 h-4 mr-2" />
                      {bookDetail.publishedDate}
                    </p>
                  )}
                  {bookDetail.rating && (
                    <div className="flex items-center justify-center mt-2">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="text-sm font-semibold">
                        {bookDetail.rating}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <a
                    href={bookDetail.amazonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF6347] hover:from-[#FFA500] hover:via-[#FF6347] hover:to-[#FFD700] text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-center block transform hover:scale-105"
                  >
                    <ExternalLink className="w-4 h-4 mr-2 inline" />
                    Get This Book
                  </a>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full rounded-xl border-2 border-[#667eea] text-[#667eea] hover:bg-[#667eea] hover:text-white transition-all duration-300"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Chapter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chapter Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Chapter Header */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur-md rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center space-x-3">
                      <AIRelevanceScore
                        score={chapterDetail.relevanceScore}
                        size="lg"
                        showBar={true}
                        query={query}
                      />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        AI-Analyzed Match
                      </div>
                    </div>
                    {query && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-xs"
                      >
                        for "{query}"
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                    {chapterDetail.title}
                  </h1>
                </div>

                <Separator className="my-6" />

                {/* Why Relevant */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                    <Target className="w-5 h-5 mr-2 text-blue-500" />
                    Why This Chapter Matters
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    {chapterDetail.whyRelevant}
                  </p>
                </div>

                {/* Key Topics */}
                {chapterDetail.keyTopics &&
                  chapterDetail.keyTopics.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                        Key Topics
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {chapterDetail.keyTopics.map((topic, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </CardContent>
            </Card>

            {/* Chapter Content */}
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-900/50 backdrop-blur-md rounded-3xl overflow-hidden">
              <CardContent className="p-8">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-green-500" />
                  Chapter Overview
                </h3>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {chapterDetail.fullText || chapterDetail.snippet}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Generated Content */}
            {isEnriching ? (
              <Card className="shadow-2xl border-0 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-3xl overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    Generating AI insights for this chapter...
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Core Principles */}
                {chapterDetail.coreLeadershipPrinciples &&
                  chapterDetail.coreLeadershipPrinciples.length > 0 && (
                    <Card className="shadow-2xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-3xl overflow-hidden">
                      <CardContent className="p-8">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                          Core Principles
                        </h3>
                        <div className="space-y-3">
                          {chapterDetail.coreLeadershipPrinciples.map(
                            (principle, index) => (
                              <div
                                key={index}
                                className="flex items-start space-x-3 p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl"
                              >
                                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700 dark:text-gray-300">
                                  {principle}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Practical Applications */}
                {chapterDetail.practicalApplications &&
                  chapterDetail.practicalApplications.length > 0 && (
                    <Card className="shadow-2xl border-0 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl overflow-hidden">
                      <CardContent className="p-8">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-orange-500" />
                          Practical Applications
                        </h3>
                        <div className="space-y-3">
                          {chapterDetail.practicalApplications.map(
                            (application, index) => (
                              <div
                                key={index}
                                className="flex items-start space-x-3 p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl"
                              >
                                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                  {index + 1}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                  {application}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* AI Summary */}
                {chapterDetail.aiSummary && (
                  <Card className="shadow-2xl border-0 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-3xl overflow-hidden">
                    <CardContent className="p-8">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-purple-500" />
                        AI Summary
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {chapterDetail.aiSummary}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Recommendations */}
                {chapterDetail.recommendations &&
                  chapterDetail.recommendations.length > 0 && (
                    <Card className="shadow-2xl border-0 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-3xl overflow-hidden">
                      <CardContent className="p-8">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <Star className="w-5 h-5 mr-2 text-blue-500" />
                          Next Steps
                        </h3>
                        <div className="space-y-3">
                          {chapterDetail.recommendations.map(
                            (recommendation, index) => (
                              <div
                                key={index}
                                className="flex items-start space-x-3 p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl"
                              >
                                <Star className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700 dark:text-gray-300">
                                  {recommendation}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

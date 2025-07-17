import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Clock,
  Users,
  Star,
  ExternalLink,
  Share2,
  Lightbulb,
  Target,
} from "lucide-react";
import ChapterRating from "@/components/ChapterRating";
import ResultsShareButton from "@/components/ResultsShareButton";

interface ChapterMatch {
  chapter: string;
  title: string;
  pages: string;
  relevance: string;
  relevanceScore: number;
  keyTopics: string[];
  why: string;
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
  relevantChapters?: ChapterMatch[];
  chapterRelevanceScore?: number;
}

interface GeneratedSummary {
  id: string;
  topic: string;
  books: Book[];
  summary: string;
  keyInsights: string[];
  quotes: string[];
  generatedAt: string;
  userId: number;
}

interface TopicAnalysis {
  isBroad: boolean;
  broadnessScore: number;
  suggestedRefinements: string[];
  explanation: string;
}

interface TopicRefinement {
  label: string;
  value: string;
  description: string;
}

export default function Generate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] =
    useState<GeneratedSummary | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Topic refinement states
  const [showRefinements, setShowRefinements] = useState(false);
  const [topicAnalysis, setTopicAnalysis] = useState<TopicAnalysis | null>(
    null,
  );
  const [topicRefinements, setTopicRefinements] = useState<TopicRefinement[]>(
    [],
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please sign in to access the chapter discovery feature.
          </p>
          <Link
            to="/signin"
            className="bg-gradient-to-r from-[#FFFD63] to-[#FFE066] hover:from-[#FFE066] hover:to-[#FFFD63] text-[#0A0B1E] px-8 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  const analyzeTopic = async (topicToAnalyze: string) => {
    if (!topicToAnalyze.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/topic/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topic: topicToAnalyze.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze topic");
      }

      const data = await response.json();
      setTopicAnalysis(data.analysis);
      setTopicRefinements(data.refinements);

      if (data.analysis.isBroad) {
        setShowRefinements(true);
      } else {
        // Topic is specific enough, proceed with generation
        startGeneration(topicToAnalyze);
      }
    } catch (error) {
      console.error("Topic analysis error:", error);
      // If analysis fails, proceed with generation anyway
      startGeneration(topicToAnalyze);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    // First analyze the topic
    await analyzeTopic(topic.trim());
  };

  const startGeneration = async (finalTopic: string) => {
    setIsGenerating(true);
    setProgress(0);
    setCurrentOperation("Initializing...");
    setShowRefinements(false);

    try {
      const response = await fetch("/api/generate/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: finalTopic,
          userId: user.id,
          maxBooks: 10,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start generation");
      }

      const data = await response.json();
      setSessionId(data.sessionId);

      // Start polling for progress
      pollProgress(data.sessionId);
    } catch (error) {
      console.error("Generation error:", error);
      setIsGenerating(false);
    }
  };

  const pollProgress = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/generate/progress/${sessionId}`);
      const data = await response.json();

      setProgress(data.progress);
      setCurrentOperation(data.currentOperation || "Processing...");

      if (data.progress >= 100 && data.result) {
        setGeneratedSummary(data.result);
        setIsGenerating(false);
      } else if (data.status === "error") {
        throw new Error(data.error || "Generation failed");
      } else {
        setTimeout(() => pollProgress(sessionId), 1000);
      }
    } catch (error) {
      console.error("Progress polling error:", error);
      setIsGenerating(false);
    }
  };

  const handleRefinementSelect = (refinedTopic: string) => {
    setTopic(refinedTopic);
    startGeneration(refinedTopic);
  };

  const proceedWithOriginalTopic = () => {
    startGeneration(topic);
  };

  const handleShare = (chapter: ChapterMatch, book: Book) => {
    const shareText = `Check out "${chapter.title}" from "${book.title}" by ${book.author} - ${chapter.relevanceScore}% match for "${topic}"`;

    if (navigator.share) {
      navigator.share({
        title: `${chapter.title} - Chapter Discovery`,
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                📚 Chapter Discovery
              </h1>
              <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
                Find the exact chapters and pages you need across multiple
                books. Discover relevant content even in books not primarily
                about your topic.
              </p>
            </div>
          </div>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <Card className="p-8 shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardContent className="p-0">
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    What topic would you like to explore?
                  </label>
                  <Input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Team building, Leadership, Productivity, Negotiation..."
                    className="text-lg py-4 px-6 rounded-xl border-2 border-gray-200 dark:border-gray-600 focus:border-[#4361EE] dark:focus:border-[#4361EE] transition-colors"
                    onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                    disabled={isGenerating || isAnalyzing}
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!topic.trim() || isGenerating || isAnalyzing}
                  className="w-full py-4 text-lg font-semibold bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] hover:from-[#3B4DE8] hover:to-[#6B1DAF] text-white rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:opacity-50"
                >
                  {isAnalyzing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Analyzing Topic...
                    </div>
                  ) : isGenerating ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Discovering Chapters...
                    </div>
                  ) : (
                    <>
                      <BookOpen className="w-6 h-6 mr-2" />
                      Discover Relevant Chapters
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {currentOperation}
                      </span>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Topic Refinement Modal */}
        {showRefinements && topicAnalysis && (
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="shadow-2xl border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 flex items-center justify-center">
                    <Target className="w-8 h-8 mr-3 text-blue-600" />
                    Let's Make Your Search More Specific
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                    {topicAnalysis.explanation}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose a more specific focus below, or continue with your
                    original topic.
                  </p>
                </div>

                <div className="grid gap-4 mb-6">
                  {topicRefinements.map((refinement, index) => (
                    <button
                      key={index}
                      onClick={() => handleRefinementSelect(refinement.value)}
                      className="text-left p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all hover:shadow-lg group"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                          <span className="text-blue-600 dark:text-blue-400 font-bold text-sm">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {refinement.label}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {refinement.description}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            Search: "{refinement.value}"
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={proceedWithOriginalTopic}
                    variant="outline"
                    className="px-6 py-2 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-xl"
                  >
                    Continue with "{topic}"
                  </Button>
                  <Button
                    onClick={() => setShowRefinements(false)}
                    variant="ghost"
                    className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    Let me rephrase
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results */}
        {generatedSummary && (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                📖 Chapter Discovery Results for "{generatedSummary.topic}"
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                Found{" "}
                {
                  generatedSummary.books.flatMap(
                    (book) => book.relevantChapters || [],
                  ).length
                }{" "}
                relevant chapters across {generatedSummary.books.length} books
              </p>

              {/* Share Results Button */}
              <div className="flex justify-center">
                <ResultsShareButton
                  topic={generatedSummary.topic}
                  books={generatedSummary.books}
                  totalChapters={
                    generatedSummary.books.flatMap(
                      (book) => book.relevantChapters || [],
                    ).length
                  }
                />
              </div>
            </div>

            {/* Chapter Results */}
            <div className="space-y-8">
              {generatedSummary.books.flatMap((book, bookIndex) =>
                (book.relevantChapters || []).map((chapter, chapterIndex) => (
                  <Card
                    key={`${book.id}-${chapterIndex}`}
                    className="overflow-hidden shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:shadow-2xl transition-all duration-300"
                  >
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Book Cover - Large and Prominent */}
                        <div className="lg:w-80 flex-shrink-0 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
                          <div className="relative group">
                            <img
                              src={book.cover}
                              alt={book.title}
                              className="w-full h-80 object-cover rounded-2xl shadow-lg group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-105"
                              onError={(e) => {
                                const target = e.currentTarget;
                                // Try alternative Amazon image URL first
                                if (!target.dataset.retried) {
                                  target.dataset.retried = "true";
                                  target.src = book.cover.replace(
                                    "m.media-amazon.com",
                                    "images-na.ssl-images-amazon.com",
                                  );
                                } else {
                                  // Fallback to placeholder
                                  target.src = `https://via.placeholder.com/300x400/4361EE/FFFFFF?text=${encodeURIComponent(book.title.split(" ").slice(0, 3).join(" "))}`;
                                }
                              }}
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Book Rating Badge */}
                            {book.rating && (
                              <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center">
                                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                                <span className="text-sm font-semibold">
                                  {book.rating}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Book Actions */}
                          <div className="mt-4 space-y-3">
                            <a
                              href={book.amazonLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-gradient-to-r from-[#FFFD63] to-[#FFE066] hover:from-[#FFE066] hover:to-[#FFFD63] text-[#0A0B1E] px-4 py-2 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl text-center block"
                            >
                              <ExternalLink className="w-4 h-4 inline mr-2" />
                              Get Book
                            </a>
                            <Button
                              onClick={() => handleShare(chapter, book)}
                              variant="outline"
                              size="sm"
                              className="w-full rounded-xl border-2"
                            >
                              <Share2 className="w-4 h-4 mr-2" />
                              Share Chapter
                            </Button>
                          </div>
                        </div>

                        {/* Chapter Details */}
                        <div className="flex-1 p-8">
                          {/* Chapter Header */}
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                              <Badge
                                variant="secondary"
                                className="bg-[#4361EE] text-white px-3 py-1 rounded-full text-sm font-semibold"
                              >
                                {chapter.chapter}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-green-500 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-semibold"
                              >
                                {Math.round(chapter.relevanceScore || 95)}%
                                match
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-blue-500 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full text-xs"
                              >
                                Pages {chapter.pages}
                              </Badge>
                            </div>
                          </div>

                          {/* Chapter Title */}
                          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            {chapter.title}
                          </h3>

                          {/* Book Info */}
                          <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                              From: {book.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 flex items-center">
                              <Users className="w-4 h-4 mr-2" />
                              by {book.author}
                              {book.publishedDate && (
                                <>
                                  <Clock className="w-4 h-4 ml-4 mr-2" />
                                  {book.publishedDate}
                                </>
                              )}
                              {book.pageCount && (
                                <>
                                  <BookOpen className="w-4 h-4 ml-4 mr-2" />
                                  {book.pageCount} pages
                                </>
                              )}
                            </p>
                          </div>

                          <Separator className="my-6" />

                          {/* Why This Chapter is Relevant */}
                          <div className="mb-6">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                              Why this chapter is relevant to "
                              {generatedSummary.topic}":
                            </h5>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700 p-4 rounded-xl">
                              {chapter.why}
                            </p>
                          </div>

                          {/* Key Topics */}
                          <div className="mb-6">
                            <h5 className="font-semibold text-gray-900 dark:text-white mb-3">
                              Key Topics Covered:
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {chapter.keyTopics.map((topic, index) => (
                                <Badge
                                  key={index}
                                  variant="secondary"
                                  className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm"
                                >
                                  {topic}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Quick Tip */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start">
                              <Lightbulb className="w-4 h-4 mr-2 mt-0.5 text-blue-500" />
                              <span>
                                <strong>Quick tip:</strong> Focus on this
                                chapter to understand{" "}
                                {chapter.relevance.toLowerCase()}
                              </span>
                            </p>
                          </div>

                          {/* Book Categories */}
                          {book.categories && book.categories.length > 0 && (
                            <div className="mt-6">
                              <h5 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">
                                Book Categories:
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {book.categories.map((category, index) => (
                                  <Badge
                                    key={index}
                                    variant="outline"
                                    className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full text-xs"
                                  >
                                    {category}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Chapter Rating */}
                          <div className="mt-6">
                            <ChapterRating
                              bookId={book.id}
                              chapterId={chapter.chapter}
                              searchTopic={generatedSummary.topic}
                              bookTitle={book.title}
                              chapterTitle={chapter.title}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )),
              )}
            </div>

            {/* AI Summary Section */}
            {generatedSummary.summary && (
              <Card className="shadow-xl border-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <BookOpen className="w-6 h-6 mr-3 text-indigo-600" />
                    AI-Generated Summary
                  </h3>
                  <div className="ai-summary-content text-gray-700 dark:text-gray-300">
                    {generatedSummary.summary.split("\n").map((line, index) => {
                      // Handle markdown headings
                      if (line.startsWith("## ")) {
                        return (
                          <h4
                            key={index}
                            className="text-lg font-bold text-gray-900 dark:text-white mb-3 mt-6 first:mt-0"
                          >
                            {line.replace("## ", "")}
                          </h4>
                        );
                      }
                      // Handle bullet points
                      if (line.startsWith("• ")) {
                        const content = line.replace("• ", "");
                        const [boldPart, ...rest] = content.split(": ");
                        return (
                          <div
                            key={index}
                            className="flex items-start mb-2 ml-4"
                          >
                            <span className="text-indigo-600 dark:text-indigo-400 mr-2 mt-1">
                              •
                            </span>
                            <span>
                              {rest.length > 0 ? (
                                <>
                                  <strong className="text-gray-900 dark:text-white">
                                    {boldPart}:
                                  </strong>
                                  <span className="ml-1">
                                    {rest.join(": ")}
                                  </span>
                                </>
                              ) : (
                                content
                              )}
                            </span>
                          </div>
                        );
                      }
                      // Handle regular paragraphs
                      if (line.trim()) {
                        return (
                          <p key={index} className="mb-4 leading-relaxed">
                            {line}
                          </p>
                        );
                      }
                      return null;
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Insights */}
            {generatedSummary.keyInsights &&
              generatedSummary.keyInsights.length > 0 && (
                <Card className="shadow-xl border-0 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                      <Lightbulb className="w-6 h-6 mr-3 text-green-600" />
                      Key Insights
                    </h3>
                    <div className="grid gap-4">
                      {generatedSummary.keyInsights.map((insight, index) => (
                        <div
                          key={index}
                          className="flex items-start p-4 bg-white/70 dark:bg-gray-800/70 rounded-xl border border-green-200 dark:border-green-800"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
                            <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                              {index + 1}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {insight}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

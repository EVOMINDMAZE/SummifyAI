import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  ArrowLeft,
  ExternalLink,
  Share2,
  Star,
  Lightbulb,
  Target,
  Clock,
  Users,
} from "lucide-react";

interface ChapterDetail {
  id: number;
  title: string;
  content: string;
  relevanceScore: number;
  whyRelevant: string;
  keyTopics: string[];
  coreLeadershipPrinciples?: string[];
  practicalApplications?: string[];
  aiSummary?: string;
  recommendations?: string[];
  book: {
    id: string;
    title: string;
    author: string;
    cover: string;
    amazonLink: string;
    isbn: string;
  };
}

export default function ChapterDetail() {
  const { bookId, chapterId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [chapter, setChapter] = useState<ChapterDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnriching, setIsEnriching] = useState(false);
  const [query, setQuery] = useState("");

  // Extract query from state or URL
  useEffect(() => {
    const searchQuery =
      location.state?.query ||
      new URLSearchParams(location.search).get("q") ||
      "";
    setQuery(searchQuery);
  }, [location]);

  // Mock chapter data for demonstration
  useEffect(() => {
    const fetchChapterDetail = async () => {
      setIsLoading(true);

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get chapter data and enrich with AI
      const mockChapter: ChapterDetail = {
        id: parseInt(chapterId || "1"),
        title: "The Foundations of Effective Leadership",
        content: `Leadership is the art of mobilizing others to want to struggle for shared aspirations. This chapter explores the fundamental principles that separate great leaders from merely good managers.

## Core Leadership Principles

**Vision and Direction**
Effective leaders possess the ability to see beyond the present circumstances and articulate a compelling vision of the future. They understand that leadership is not about commanding others, but about inspiring them to join in pursuit of a common goal.

**Emotional Intelligence**
The best leaders are those who understand themselves and others deeply. They can manage their emotions effectively and help others do the same. This involves empathy, self-awareness, and the ability to read social situations accurately.

**Decision Making Under Pressure**
Leadership often requires making difficult decisions with incomplete information. Great leaders develop frameworks for decision-making that account for both rational analysis and intuitive insights.

**Building Trust and Credibility**
Trust is the foundation of all effective leadership. Leaders build trust through consistency between their words and actions, transparency in their decision-making processes, and genuine care for the wellbeing of their team members.

## Practical Applications

This chapter provides actionable strategies for developing these leadership capabilities, including exercises for self-reflection, frameworks for difficult conversations, and methods for creating psychological safety within teams.

The concepts presented here have been tested in various organizational contexts and have proven effective for leaders at all levels, from team leads to C-suite executives.`,
        relevanceScore: 92,
        whyRelevant: `This chapter directly addresses the core principles of ${query || "leadership"}, providing both theoretical frameworks and practical strategies that can be immediately applied in real-world leadership situations.`,
        keyTopics: [
          "Leadership",
          "Vision",
          "Emotional Intelligence",
          "Decision Making",
          "Trust Building",
        ],
        coreLeadershipPrinciples: [],
        practicalApplications: [],
        aiSummary: "",
        recommendations: [],
        book: {
          id: bookId || "1",
          title:
            "The Leadership Challenge: How to Make Extraordinary Things Happen",
          author: "James M. Kouzes, Barry Z. Posner",
          cover:
            "https://via.placeholder.com/300x400/667eea/FFFFFF?text=Leadership+Challenge",
          amazonLink: `https://www.amazon.com/s?k=Leadership+Challenge+Kouzes&tag=summifyio-20`,
          isbn: "9781119278962",
        },
      };

      setChapter(mockChapter);
      setIsLoading(false);

      // Enrich with AI if we have a query
      if (query) {
        enrichChapterWithAI(mockChapter, query);
      }
    };

    fetchChapterDetail();
  }, [bookId, chapterId, query]);

  const handleShare = () => {
    if (chapter) {
      const shareText = `Check out "${chapter.title}" from "${chapter.book.title}" - ${chapter.relevanceScore}% relevant to "${query}"`;

      if (navigator.share) {
        navigator.share({
          title: `${chapter.title} - SummifyIO`,
          text: shareText,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(shareText);
        alert("Link copied to clipboard!");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Chapter Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The requested chapter could not be found.
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Results
          </Button>

          {query && (
            <div className="mb-4">
              <Badge
                variant="outline"
                className="bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/20 dark:border-blue-700 dark:text-blue-400"
              >
                Search: "{query}"
              </Badge>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Book Info Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <img
                    src={chapter.book.cover}
                    alt={chapter.book.title}
                    className="w-full max-w-[200px] mx-auto h-64 object-cover rounded-xl shadow-lg mb-4"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.src = `https://via.placeholder.com/300x400/667eea/FFFFFF?text=${encodeURIComponent(chapter.book.title.split(" ").slice(0, 3).join(" "))}`;
                    }}
                  />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-3">
                    {chapter.book.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    by {chapter.book.author}
                  </p>

                  {/* Relevance Score */}
                  <div className="mb-4">
                    <Badge className="bg-emerald-500 text-white text-lg px-4 py-2">
                      {chapter.relevanceScore}% Match
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <a
                    href={chapter.book.amazonLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FF6347] hover:from-[#FFA500] hover:via-[#FF6347] hover:to-[#FFD700] text-white px-4 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl text-center block"
                  >
                    <ExternalLink className="w-4 h-4 inline mr-2" />
                    Get This Book
                  </a>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full rounded-xl border-2 border-[#667eea] text-[#667eea] hover:bg-[#667eea] hover:text-white"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Chapter
                  </Button>
                </div>

                {/* Key Topics */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Key Topics
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {chapter.keyTopics.map((topic, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs"
                      >
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chapter Content */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl">
              <CardContent className="p-8">
                {/* Chapter Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {chapter.title}
                  </h1>

                  {/* Why Relevant */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800 mb-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2 text-blue-500" />
                      Why This Chapter is Relevant
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {chapter.whyRelevant}
                    </p>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Chapter Content */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {chapter.content.split("\n\n").map((paragraph, index) => {
                    if (paragraph.startsWith("## ")) {
                      return (
                        <h2
                          key={index}
                          className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 first:mt-0"
                        >
                          {paragraph.replace("## ", "")}
                        </h2>
                      );
                    }
                    if (
                      paragraph.startsWith("**") &&
                      paragraph.endsWith("**")
                    ) {
                      return (
                        <h3
                          key={index}
                          className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3"
                        >
                          {paragraph.replace(/\*\*/g, "")}
                        </h3>
                      );
                    }
                    if (paragraph.trim()) {
                      return (
                        <p
                          key={index}
                          className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4"
                        >
                          {paragraph}
                        </p>
                      );
                    }
                    return null;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

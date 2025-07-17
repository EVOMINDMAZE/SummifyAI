import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ChapterRatingProps {
  bookId: string;
  chapterId: string;
  searchTopic: string;
  bookTitle: string;
  chapterTitle: string;
}

interface RatingStats {
  averageRating: number;
  totalRatings: number;
  ratingDistribution: { [key: number]: number };
}

interface UserRating {
  rating: number;
  feedbackText?: string;
}

export default function ChapterRating({
  bookId,
  chapterId,
  searchTopic,
  bookTitle,
  chapterTitle,
}: ChapterRatingProps) {
  const { user } = useAuth();
  const [userRating, setUserRating] = useState<UserRating | null>(null);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserRating();
    }
    loadRatingStats();
  }, [user, bookId, chapterId, searchTopic]);

  const loadUserRating = async () => {
    if (!user) return;

    try {
      const response = await fetch(
        `/api/ratings/user/${user.id}/${bookId}/${chapterId}?searchTopic=${encodeURIComponent(searchTopic)}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setUserRating({
            rating: data.rating,
            feedbackText: data.feedbackText || "",
          });
          setFeedbackText(data.feedbackText || "");
        }
      }
    } catch (error) {
      console.error("Error loading user rating:", error);
    }
  };

  const loadRatingStats = async () => {
    try {
      const response = await fetch(`/api/ratings/${bookId}/${chapterId}`);
      if (response.ok) {
        const data = await response.json();
        setRatingStats(data);
      }
    } catch (error) {
      console.error("Error loading rating stats:", error);
    }
  };

  const submitRating = async (rating: number) => {
    if (!user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          bookId,
          chapterId,
          searchTopic,
          rating,
          feedbackText: feedbackText.trim() || undefined,
        }),
      });

      if (response.ok) {
        setUserRating({ rating, feedbackText });
        await loadRatingStats(); // Refresh stats
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            disabled={!interactive || isSubmitting}
            onClick={() => interactive && submitRating(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`${
              interactive
                ? "hover:scale-110 transition-transform cursor-pointer"
                : "cursor-default"
            } disabled:cursor-not-allowed`}
          >
            <Star
              className={`w-5 h-5 ${
                star <=
                (interactive ? hoverRating || currentRating : currentRating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300 dark:text-gray-600"
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!user) {
    return null; // Don't show rating for unauthenticated users
  }

  return (
    <Card className="bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Rating Section */}
          <div>
            <h5 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
              <Star className="w-4 h-4 mr-2 text-yellow-500" />
              Rate this chapter's relevance
            </h5>

            <div className="flex items-center justify-between mb-3">
              <div>
                {userRating ? (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {renderStars(userRating.rating, true)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Your rating
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {renderStars(hoverRating, true)}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Click to rate
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Average Rating Display */}
              {ratingStats && ratingStats.totalRatings > 0 && (
                <div className="text-right">
                  <div className="flex items-center space-x-1">
                    {renderStars(Math.round(ratingStats.averageRating))}
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {ratingStats.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({ratingStats.totalRatings} rating
                    {ratingStats.totalRatings !== 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Feedback Section */}
          {userRating && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFeedback(!showFeedback)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {userRating.feedbackText ? "Edit feedback" : "Add feedback"}
              </Button>

              {showFeedback && (
                <div className="mt-3 space-y-3">
                  <Textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Share your thoughts on this chapter's relevance to the topic..."
                    className="min-h-[80px] text-sm"
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFeedback(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => submitRating(userRating.rating)}
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isSubmitting ? "Saving..." : "Save Feedback"}
                    </Button>
                  </div>
                </div>
              )}

              {userRating.feedbackText && !showFeedback && (
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {userRating.feedbackText}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

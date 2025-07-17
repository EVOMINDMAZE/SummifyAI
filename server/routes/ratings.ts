import { Request, Response } from "express";
import { ratingService } from "../services/ratingService";

export async function handleSubmitRating(req: Request, res: Response) {
  try {
    const { userId, bookId, chapterId, searchTopic, rating, feedbackText } =
      req.body;

    // Validation
    if (!userId || !bookId || !chapterId || !searchTopic || !rating) {
      return res.status(400).json({
        error:
          "Missing required fields: userId, bookId, chapterId, searchTopic, rating",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5",
      });
    }

    const submittedRating = await ratingService.submitRating({
      userId: parseInt(userId),
      bookId,
      chapterId,
      searchTopic,
      rating: parseInt(rating),
      feedbackText,
    });

    res.json({
      success: true,
      rating: submittedRating,
    });
  } catch (error) {
    console.error("Submit rating error:", error);
    res.status(500).json({
      error: "Failed to submit rating",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function handleGetRatingStats(req: Request, res: Response) {
  try {
    const { bookId, chapterId } = req.params;

    if (!bookId || !chapterId) {
      return res.status(400).json({
        error: "Missing required parameters: bookId, chapterId",
      });
    }

    const stats = await ratingService.getRatingStats(bookId, chapterId);

    res.json(stats);
  } catch (error) {
    console.error("Get rating stats error:", error);
    res.status(500).json({
      error: "Failed to get rating stats",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function handleGetUserRating(req: Request, res: Response) {
  try {
    const { userId, bookId, chapterId } = req.params;
    const { searchTopic } = req.query;

    if (!userId || !bookId || !chapterId || !searchTopic) {
      return res.status(400).json({
        error:
          "Missing required parameters: userId, bookId, chapterId, searchTopic",
      });
    }

    const userRating = await ratingService.getUserRating(
      parseInt(userId),
      bookId,
      chapterId,
      searchTopic as string,
    );

    res.json(userRating);
  } catch (error) {
    console.error("Get user rating error:", error);
    res.status(500).json({
      error: "Failed to get user rating",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

export async function handleGetTopRatedChapters(req: Request, res: Response) {
  try {
    const { searchTopic } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!searchTopic) {
      return res.status(400).json({
        error: "Missing required parameter: searchTopic",
      });
    }

    const topRated = await ratingService.getTopRatedChapters(
      searchTopic,
      limit,
    );

    res.json(topRated);
  } catch (error) {
    console.error("Get top rated chapters error:", error);
    res.status(500).json({
      error: "Failed to get top rated chapters",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

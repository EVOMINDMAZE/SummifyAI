import { Request, Response } from "express";
import { TopicAnalysisService } from "../services/topicAnalysisService";

export async function handleTopicAnalysis(req: Request, res: Response) {
  try {
    const { topic } = req.body;

    if (!topic || typeof topic !== "string") {
      return res.status(400).json({
        error: "Topic is required and must be a string",
      });
    }

    const analysis = TopicAnalysisService.analyzeTopic(topic);
    const refinements = TopicAnalysisService.getTopicRefinements(topic);

    res.json({
      analysis,
      refinements,
    });
  } catch (error) {
    console.error("Topic analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze topic",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

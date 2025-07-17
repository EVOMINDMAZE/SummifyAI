interface GenerateStartResponse {
  sessionId: string;
  message: string;
  estimatedTime: number;
}

interface GenerateProgressResponse {
  sessionId: string;
  progress: number;
  status: "starting" | "processing" | "completed" | "error";
  currentOperation: string;
  estimatedTimeLeft?: number;
  result?: GeneratedResult;
  error?: string;
}

interface GeneratedResult {
  id: string;
  topic: string;
  books: Book[];
  summary: string;
  keyInsights: string[];
  quotes: string[];
  generatedAt: string;
  userId: number;
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
}

export class GenerateAPI {
  private static baseUrl = "/api";

  static async startGeneration(
    topic: string,
    userId: number,
    maxBooks: number = 5,
  ): Promise<GenerateStartResponse> {
    const response = await fetch(`${this.baseUrl}/generate/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic,
        userId,
        maxBooks,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to start generation");
    }

    return data;
  }

  static async getProgress(
    sessionId: string,
  ): Promise<GenerateProgressResponse> {
    const response = await fetch(
      `${this.baseUrl}/generate/progress/${sessionId}`,
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to get progress");
    }

    return data;
  }

  static async getRecentSummaries(
    userId: number,
    limit: number = 10,
  ): Promise<{ summaries: GeneratedResult[] }> {
    const response = await fetch(
      `${this.baseUrl}/users/${userId}/recent-summaries?limit=${limit}`,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to get recent summaries");
    }

    return response.json();
  }

  static async pollProgress(
    sessionId: string,
    onProgress: (progress: GenerateProgressResponse) => void,
    onComplete: (result: GeneratedResult) => void,
    onError: (error: string) => void,
  ): Promise<void> {
    const maxAttempts = 120; // 2 minutes max (120 * 1 second)
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;

        if (attempts > maxAttempts) {
          onError("Generation timeout - please try again");
          return;
        }

        const progress = await this.getProgress(sessionId);
        onProgress(progress);

        if (progress.status === "completed" && progress.result) {
          onComplete(progress.result);
          return;
        }

        if (progress.status === "error") {
          onError(progress.error || "Generation failed");
          return;
        }

        // Continue polling
        setTimeout(poll, 1000);
      } catch (error) {
        console.error("Polling error:", error);
        setTimeout(poll, 2000); // Retry with longer delay
      }
    };

    poll();
  }

  static createMockProgressStages(): Array<{
    text: string;
    duration: number;
    percent: number;
  }> {
    return [
      {
        text: "🔍 Searching through millions of books...",
        duration: 1000,
        percent: 15,
      },
      {
        text: "📚 Analyzing top 5 most relevant books...",
        duration: 1200,
        percent: 35,
      },
      {
        text: "🧠 Extracting key insights and themes...",
        duration: 1000,
        percent: 60,
      },
      {
        text: "⚡ Comparing different perspectives...",
        duration: 800,
        percent: 80,
      },
      {
        text: "✨ Generating your premium summary...",
        duration: 600,
        percent: 100,
      },
    ];
  }
}

export type {
  GenerateStartResponse,
  GenerateProgressResponse,
  GeneratedResult,
  Book,
};

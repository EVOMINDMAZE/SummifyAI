import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { GenerateAPI, GeneratedResult, Book } from "@/utils/generateApi";
import { showNotification } from "@/utils/actions";

// Using types from generateApi
type GeneratedSummary = GeneratedResult;

export default function Generate() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [topic, setTopic] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] =
    useState<GeneratedSummary | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [generationStage, setGenerationStage] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentOperation, setCurrentOperation] = useState("");
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState(60);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const topicParam = searchParams.get("topic");
    if (topicParam) {
      setTopic(topicParam);
    }
  }, [searchParams]);

  // Initialize progress stages from API client
  const generationStages = GenerateAPI.createMockProgressStages();

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    if (!user) {
      showNotification("Please sign in to generate summaries", "error");
      return;
    }

    // Check if user has queries remaining
    if (user?.tier === "free" && user.queriesUsed >= user.queriesLimit) {
      setShowUpgrade(true);
      return;
    }

    setIsGenerating(true);
    setGenerationStage(0);
    setProgressPercent(0);
    setCurrentOperation("Initializing...");
    setError(null);

    try {
      // Start real generation process
      const response = await GenerateAPI.startGeneration(
        topic,
        parseInt(user.id),
        5,
      );

      setSessionId(response.sessionId);
      setEstimatedTimeLeft(response.estimatedTime);
      showNotification("Generation started successfully!", "success");

      // Start polling for progress
      GenerateAPI.pollProgress(
        response.sessionId,
        (progress) => {
          // Update progress
          setProgressPercent(progress.progress);
          setCurrentOperation(progress.currentOperation || "Processing...");

          if (progress.estimatedTimeLeft !== undefined) {
            setEstimatedTimeLeft(progress.estimatedTimeLeft);
          }

          // Map progress to stages for UI consistency
          const stageIndex = Math.floor(
            (progress.progress / 100) * generationStages.length,
          );
          setGenerationStage(Math.min(stageIndex, generationStages.length - 1));
        },
        (result) => {
          // Generation completed successfully
          setGeneratedSummary(result);
          setIsGenerating(false);
          setProgressPercent(100);
          setCurrentOperation("Complete!");
          setSessionId(null);

          // Update user's query count locally
          if (user) {
            updateUser({ queriesUsed: user.queriesUsed + 1 });
          }

          showNotification("Chapter discovery complete!", "success");
        },
        (error) => {
          // Generation failed
          setError(error);
          setIsGenerating(false);
          setProgressPercent(0);
          setCurrentOperation("");
          setSessionId(null);
          showNotification(`Generation failed: ${error}`, "error");
        },
      );
    } catch (error) {
      console.error("Generation start error:", error);
      setError(
        error instanceof Error ? error.message : "Failed to start generation",
      );
      setIsGenerating(false);
      setProgressPercent(0);
      setCurrentOperation("");
      showNotification("Failed to start generation", "error");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Discover Relevant Chapters?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sign in to unlock AI-powered chapter discovery across multiple books
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-3xl p-8 text-white relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                🎯 Smart Chapter Discovery
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Find the exact chapters that address your question across
                multiple books - even in books that aren't primarily about your
                topic. Our AI analyzes chapter content and explains precisely
                why each chapter is relevant to your query.
              </p>
            </div>
          </div>
        </div>

        {/* Generation Form */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              What specific topic would you like to find chapters about?
            </h2>

            <div className="relative">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a specific question or topic (e.g., decision making under pressure)"
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-2xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#4361EE]/20 focus:border-[#4361EE] transition-all"
                    disabled={isGenerating}
                    onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <svg
                      className="w-6 h-6 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || !topic.trim()}
                  className="px-8 py-4 bg-gradient-to-r from-[#FFFD63] to-[#FFE066] hover:from-[#FFE066] hover:to-[#FFFD63] disabled:from-gray-300 disabled:to-gray-400 text-[#0A0B1E] font-bold rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-none flex items-center justify-center gap-3 min-w-[200px]"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                      Find Chapters
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Popular Topics */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                Popular topics:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Decision Making",
                  "Team Building",
                  "Innovation Strategies",
                  "Risk Management",
                  "Negotiation Skills",
                  "Strategic Planning",
                ].map((popularTopic) => (
                  <button
                    key={popularTopic}
                    onClick={() => setTopic(popularTopic)}
                    className="bg-gray-100 dark:bg-gray-700 hover:bg-[#4361EE] hover:text-white text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    {popularTopic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI Generation Process */}
        {isGenerating && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                <svg
                  className="w-12 h-12 text-white animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                AI is discovering chapters for "{topic}"
              </h3>

              {/* Real-time Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>Progress: {progressPercent}%</span>
                  <span>~{Math.ceil(estimatedTimeLeft)}s remaining</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                {currentOperation && (
                  <p className="text-sm text-[#4361EE] dark:text-[#7B2CBF] mt-2 font-medium animate-pulse">
                    → {currentOperation}
                  </p>
                )}
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Our AI is analyzing chapters across multiple books to find the
                  most relevant content for your topic. This includes finding
                  chapters in books that may not be primarily about your subject
                  but contain valuable insights.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Chapter Discovery Results */}
        {generatedSummary && !isGenerating && (
          <div className="space-y-8">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl p-8 text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">
                🎯 Chapter Discovery Complete!
              </h2>
              <p className="text-white/90">
                Found{" "}
                {generatedSummary.books.reduce(
                  (total, book) => total + (book.relevantChapters?.length || 0),
                  0,
                )}{" "}
                relevant chapters across {generatedSummary.books.length} books
                for "{generatedSummary.topic}"
              </p>
            </div>

            {/* Chapter Discovery Results */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  📖 Relevant Chapters Discovered
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  Each chapter below has been analyzed for relevance to your
                  topic and ranked by how well it addresses your query.
                </p>
              </div>

              <div className="space-y-6">
                {generatedSummary.books.flatMap((book, bookIndex) =>
                  (book.relevantChapters || []).map((chapter, chapterIndex) => (
                    <div
                      key={`${book.id}-${chapterIndex}`}
                      className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 border-l-4 border-purple-500"
                    >
                      {/* Chapter Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                              {chapter.chapter}
                            </div>
                            <div className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded text-xs font-medium">
                              Pages {chapter.pages}
                            </div>
                            <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs font-medium">
                              {Math.round(chapter.relevanceScore || 95)}% match
                            </div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {chapter.title}
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-3">
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              Why this chapter is relevant to "
                              {generatedSummary.topic}":
                            </span>
                            <br />
                            {chapter.why || chapter.relevance}
                          </p>
                          {chapter.keyTopics && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {chapter.keyTopics
                                .slice(0, 5)
                                .map((topicTag, topicIndex) => (
                                  <span
                                    key={topicIndex}
                                    className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full text-xs"
                                  >
                                    {topicTag}
                                  </span>
                                ))}
                            </div>
                          )}
                        </div>

                        {/* Book Info */}
                        <div className="ml-6 text-center">
                          <img
                            src={book.cover}
                            alt={book.title}
                            className="w-20 h-30 object-cover rounded-lg shadow-lg mb-2"
                          />
                          <p className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1">
                            {book.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                            by {book.author}
                          </p>
                          <a
                            href={book.amazonLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-[#FFFD63] hover:bg-[#FFE066] text-[#0A0B1E] text-xs px-3 py-1 rounded-lg font-bold transition-all shadow-sm hover:shadow-md transform hover:scale-105"
                          >
                            Get Book
                          </a>
                        </div>
                      </div>

                      {/* Quick Action */}
                      <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-3 mt-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          💡 <span className="font-medium">Quick tip:</span>{" "}
                          Focus on this chapter to understand{" "}
                          {chapter.keyTopics?.[0] || "the core concepts"}
                        </div>
                        <button
                          onClick={() => {
                            const shareText = `Found this relevant chapter: "${chapter.title}" (${chapter.chapter}) in "${book.title}" - ${Math.round(chapter.relevanceScore || 95)}% match for "${generatedSummary.topic}"`;
                            navigator.clipboard.writeText(shareText);
                            showNotification(
                              "Chapter details copied to clipboard!",
                              "success",
                            );
                          }}
                          className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Share Chapter
                        </button>
                      </div>
                    </div>
                  )),
                )}
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                🧠 Key Insights & Principles
              </h2>
              <div className="prose max-w-none">
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                  {generatedSummary.summary}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

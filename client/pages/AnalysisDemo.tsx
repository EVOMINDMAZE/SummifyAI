import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

interface AnalysisStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "analyzing" | "completed";
  result?: string;
  insights?: string[];
}

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  keyPerspective: string;
  mainThemes: string[];
  criticalQuote: string;
}

export default function AnalysisDemo() {
  const { user } = useAuth();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisSteps, setAnalysisSteps] = useState<AnalysisStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<{
    books: Book[];
    comparison: string;
    synthesis: string;
    contrasts: string[];
  } | null>(null);

  const demoTopics = [
    {
      name: "Leadership Styles",
      description: "Compare different approaches to effective leadership",
      icon: "👑",
    },
    {
      name: "Innovation Strategies",
      description: "Analyze various frameworks for driving innovation",
      icon: "💡",
    },
    {
      name: "Decision Making",
      description: "Explore different models for better decision processes",
      icon: "🎯",
    },
    {
      name: "Habit Formation",
      description: "Compare scientific approaches to building lasting habits",
      icon: "🔄",
    },
  ];

  const analysisStepsTemplate: AnalysisStep[] = [
    {
      id: "extract",
      title: "Extracting Core Concepts",
      description:
        "Identifying key themes, arguments, and frameworks from each book",
      status: "pending",
    },
    {
      id: "categorize",
      title: "Categorizing Perspectives",
      description:
        "Grouping similar viewpoints and identifying contrasting approaches",
      status: "pending",
    },
    {
      id: "compare",
      title: "Cross-Referencing Ideas",
      description:
        "Finding connections, contradictions, and complementary insights",
      status: "pending",
    },
    {
      id: "synthesize",
      title: "Synthesizing Insights",
      description: "Creating unified understanding from diverse perspectives",
      status: "pending",
    },
    {
      id: "validate",
      title: "Validating Analysis",
      description: "Ensuring accuracy and completeness of comparative insights",
      status: "pending",
    },
  ];

  const mockAnalysisResults = {
    "Leadership Styles": {
      books: [
        {
          id: "1",
          title: "Good to Great",
          author: "Jim Collins",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0066620996.01.L.jpg",
          keyPerspective: "Humble + Determined (Level 5)",
          mainThemes: [
            "Personal Humility",
            "Professional Will",
            "Window & Mirror",
          ],
          criticalQuote:
            "Level 5 leaders channel their ego needs away from themselves and into the larger goal of building a great company.",
        },
        {
          id: "2",
          title: "The 7 Habits",
          author: "Stephen Covey",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0743269519.01.L.jpg",
          keyPerspective: "Principle-Centered Leadership",
          mainThemes: [
            "Character Ethics",
            "Inside-Out Approach",
            "Personal Mission",
          ],
          criticalQuote:
            "Management is efficiency in climbing the ladder of success; leadership determines whether the ladder is leaning against the right wall.",
        },
        {
          id: "3",
          title: "Leaders Eat Last",
          author: "Simon Sinek",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1591845327.01.L.jpg",
          keyPerspective: "Servant Leadership Biology",
          mainThemes: [
            "Circle of Safety",
            "Chemical Incentives",
            "Tribal Leadership",
          ],
          criticalQuote:
            "Leadership is not about being in charge. Leadership is about taking care of those in your charge.",
        },
        {
          id: "4",
          title: "Dare to Lead",
          author: "Brené Brown",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0399592520.01.L.jpg",
          keyPerspective: "Vulnerability-Based Leadership",
          mainThemes: [
            "Courage Building",
            "Shame Resilience",
            "Heart-Centered",
          ],
          criticalQuote:
            "Vulnerability is not winning or losing; it's having the courage to show up and be seen when we have no control over the outcome.",
        },
      ],
      comparison: `**Comparative Analysis: Leadership Styles**

Our analysis reveals four distinct yet complementary leadership paradigms:

**Collins' Level 5 Model** emphasizes the paradox of personal humility combined with fierce professional will. Leaders focus outward on the institution rather than inward on personal gain.

**Covey's Principle-Centered Approach** prioritizes character development and moral authority. Leadership flows from being before doing, establishing credibility through consistency.

**Sinek's Biological Framework** grounds leadership in evolutionary psychology, where leaders create safety for their tribe. Trust and cooperation emerge from leaders who sacrifice their own comfort for others.

**Brown's Vulnerability Model** challenges traditional power-based leadership by positioning courage, compassion, and connection as core competencies for the modern leader.`,
      synthesis: `**Unified Leadership Framework:**

Exceptional leadership emerges at the intersection of character (Covey), service (Sinek), humility (Collins), and courage (Brown). The most effective leaders combine personal integrity with vulnerability, creating environments where others feel safe to contribute their best work while maintaining unwavering commitment to shared principles and vision.`,
      contrasts: [
        "Collins emphasizes humility while Brown advocates for bold vulnerability",
        "Covey focuses on principle-based decisions while Sinek emphasizes biological/emotional responses",
        "Traditional command vs. modern collaborative leadership approaches",
        "Individual character development vs. systemic trust-building methodologies",
      ],
    },
  };

  const startAnalysis = (topic: string) => {
    setSelectedTopic(topic);
    setIsAnalyzing(true);
    setCurrentStep(0);
    setAnalysisSteps(
      analysisStepsTemplate.map((step) => ({ ...step, status: "pending" })),
    );
    setAnalysisResults(null);

    // Simulate progressive analysis
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1;

        // Update current step to analyzing
        setAnalysisSteps((steps) =>
          steps.map((step, index) => ({
            ...step,
            status:
              index === prev
                ? "analyzing"
                : index < prev
                  ? "completed"
                  : "pending",
          })),
        );

        // Complete current step after a delay
        setTimeout(() => {
          setAnalysisSteps((steps) =>
            steps.map((step, index) => ({
              ...step,
              status: index <= prev ? "completed" : "pending",
            })),
          );
        }, 800);

        if (nextStep >= analysisStepsTemplate.length) {
          clearInterval(stepInterval);
          setTimeout(() => {
            setAnalysisResults(
              mockAnalysisResults[topic as keyof typeof mockAnalysisResults] ||
                mockAnalysisResults["Leadership Styles"],
            );
            setIsAnalyzing(false);
          }, 1200);
          return prev;
        }
        return nextStep;
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-green-900">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FFFD63] to-[#FFE066] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                  <span className="text-[#0A0B1E] font-bold text-xl">S</span>
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-[#0A0B1E] to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  SummifyAI
                </span>
              </Link>
              <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
                <Link
                  to="/"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/analysis-demo"
                  className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
                >
                  Analysis Demo
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] text-white px-6 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-[#FFFD63] to-[#FFE066] text-[#0A0B1E] px-6 py-2 rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-green-600 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                🧠 Deep Analysis Engine
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto mb-6">
                Watch our AI perform deep comparative analysis across multiple
                books. See how we extract themes, identify contrasts, and
                synthesize insights from different perspectives.
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 max-w-2xl mx-auto">
                <p className="text-white/80 text-sm mb-2">
                  ✨ <strong>Analysis Features:</strong>
                </p>
                <div className="flex flex-wrap justify-center gap-3 text-sm">
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Theme extraction
                  </span>
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Perspective comparison
                  </span>
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Insight synthesis
                  </span>
                  <span className="bg-white/30 px-3 py-1 rounded-lg">
                    Real-time processing
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Topic Selection */}
        {!isAnalyzing && !analysisResults && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              Choose a Topic for Deep Analysis
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {demoTopics.map((topic) => (
                <button
                  key={topic.name}
                  onClick={() => startAnalysis(topic.name)}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600 hover:from-green-50 hover:to-teal-50 dark:hover:from-green-900/20 dark:hover:to-teal-900/20 border-2 border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600 rounded-2xl p-6 text-left transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-3xl">{topic.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        {topic.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                        {topic.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Analysis Process */}
        {isAnalyzing && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center mb-8 border border-gray-200 dark:border-gray-700">
            <div className="max-w-3xl mx-auto">
              <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
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

              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Analyzing "{selectedTopic}"
              </h3>

              <div className="space-y-4 mb-8">
                {analysisSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center p-6 rounded-2xl transition-all duration-700 ${
                      step.status === "completed"
                        ? "bg-gradient-to-r from-green-100 to-teal-100 dark:from-green-900/30 dark:to-teal-900/30 text-green-800 dark:text-green-200"
                        : step.status === "analyzing"
                          ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    <div className="flex-shrink-0 mr-4">
                      {step.status === "completed" ? (
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      ) : step.status === "analyzing" ? (
                        <svg
                          className="w-6 h-6 text-blue-600 animate-spin"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-400"></div>
                      )}
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-lg mb-1">{step.title}</h4>
                      <p className="text-sm opacity-80">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-2xl p-6">
                <p className="text-green-800 dark:text-green-200 text-sm">
                  Our AI is performing deep content analysis, extracting key
                  themes, identifying different perspectives, and synthesizing
                  insights from multiple books. This comprehensive process
                  ensures you get the most valuable comparative analysis.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysisResults && !isAnalyzing && (
          <div className="space-y-8">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-3xl p-8 text-white text-center">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">🎯 Analysis Complete!</h2>
              <p className="text-white/90">
                Deep comparative analysis of {analysisResults.books.length}{" "}
                books on "{selectedTopic}" has been completed
              </p>
            </div>

            {/* Book Perspectives */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                📚 Unique Perspectives Analyzed
              </h2>

              <div className="grid md:grid-cols-2 gap-6">
                {analysisResults.books.map((book, index) => (
                  <div
                    key={book.id}
                    className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative flex-shrink-0">
                        <img
                          src={book.cover}
                          alt={book.title}
                          className="w-20 h-28 object-cover rounded-xl shadow-md"
                        />
                        <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                          {book.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          by {book.author}
                        </p>

                        <div className="mb-4">
                          <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                            Key Perspective:
                          </h4>
                          <p className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                            {book.keyPerspective}
                          </p>
                        </div>

                        <div className="mb-4">
                          <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 text-sm">
                            Main Themes:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {book.mainThemes.map((theme, i) => (
                              <span
                                key={i}
                                className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-lg text-xs"
                              >
                                {theme}
                              </span>
                            ))}
                          </div>
                        </div>

                        <blockquote className="border-l-4 border-green-400 pl-3 italic text-gray-600 dark:text-gray-400 text-sm">
                          "{book.criticalQuote}"
                        </blockquote>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparative Analysis */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                🔍 Comparative Analysis
              </h2>

              <div className="prose max-w-none">
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                  {analysisResults.comparison}
                </div>
              </div>
            </div>

            {/* Key Contrasts */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                ⚖️ Key Contrasts & Tensions
              </h2>

              <div className="grid md:grid-cols-2 gap-4">
                {analysisResults.contrasts.map((contrast, index) => (
                  <div
                    key={index}
                    className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-400 rounded-2xl p-6"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-orange-700 dark:text-orange-300 font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-orange-800 dark:text-orange-200 leading-relaxed">
                        {contrast}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Synthesis */}
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl p-8 border-2 border-purple-200 dark:border-purple-800">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                  ✨ Synthesized Insights
                </h2>
              </div>

              <div className="text-purple-800 dark:text-purple-200 leading-relaxed text-lg bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6">
                {analysisResults.synthesis}
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-[#FFFD63] via-yellow-400 to-orange-400 rounded-3xl p-8 text-center">
              <h3 className="text-2xl font-bold text-[#0A0B1E] mb-4">
                Ready to Create Your Own Analysis?
              </h3>
              <p className="text-[#0A0B1E]/80 mb-6 text-lg">
                Now that you've seen our deep analysis capabilities, create your
                own comparative summaries on any topic that interests you!
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                {user ? (
                  <Link
                    to="/generate"
                    className="bg-[#0A0B1E] hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Generate Your Summary
                  </Link>
                ) : (
                  <Link
                    to="/signup"
                    className="bg-[#0A0B1E] hover:bg-gray-800 text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Sign Up to Start Analyzing
                  </Link>
                )}
                <button
                  onClick={() => {
                    setSelectedTopic("");
                    setAnalysisResults(null);
                  }}
                  className="bg-white/20 hover:bg-white/30 text-[#0A0B1E] px-8 py-4 rounded-2xl font-medium transition-all border border-[#0A0B1E]/20"
                >
                  Try Another Topic
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

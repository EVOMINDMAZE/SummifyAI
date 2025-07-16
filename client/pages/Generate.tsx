import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { pdf } from "@react-pdf/renderer";
import PDFTemplate from "@/components/PDFTemplate";
import CollaborationPanel from "@/components/CollaborationPanel";
import { useCollaboration } from "@/contexts/CollaborationContext";

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  description: string;
  amazonLink: string;
  commission: number;
}

interface GeneratedSummary {
  topic: string;
  books: Book[];
  summary: string;
  quotes: string[];
  generatedAt: string;
}

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

  useEffect(() => {
    const topicParam = searchParams.get("topic");
    if (topicParam) {
      setTopic(topicParam);
    }
  }, [searchParams]);

  const mockBooks: Book[] = [
    {
      id: "1",
      title: "Good to Great",
      author: "Jim Collins",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/0066620996.01.L.jpg",
      description:
        "Uncovers the factors that transform good companies into great ones",
      amazonLink: "https://amazon.com/dp/0066620996?tag=summifyai-20",
      commission: 8.5,
    },
    {
      id: "2",
      title: "The 7 Habits of Highly Effective People",
      author: "Stephen R. Covey",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/0743269519.01.L.jpg",
      description:
        "A holistic approach to personal and professional effectiveness",
      amazonLink: "https://amazon.com/dp/0743269519?tag=summifyai-20",
      commission: 9.2,
    },
    {
      id: "3",
      title: "Leaders Eat Last",
      author: "Simon Sinek",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/1591845327.01.L.jpg",
      description: "Why some teams pull together and others don't",
      amazonLink: "https://amazon.com/dp/1591845327?tag=summifyai-20",
      commission: 7.8,
    },
    {
      id: "4",
      title: "The Leadership Challenge",
      author: "James Kouzes & Barry Posner",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/1119278965.01.L.jpg",
      description: "How to Make Extraordinary Things Happen in Organizations",
      amazonLink: "https://amazon.com/dp/1119278965?tag=summifyai-20",
      commission: 8.9,
    },
    {
      id: "5",
      title: "Dare to Lead",
      author: "Brené Brown",
      cover:
        "https://images-na.ssl-images-amazon.com/images/P/0399592520.01.L.jpg",
      description: "Brave work, tough conversations, whole hearts",
      amazonLink: "https://amazon.com/dp/0399592520?tag=summifyai-20",
      commission: 9.1,
    },
  ];

  const generationStages = [
    {
      text: "🔍 Searching through millions of books...",
      duration: 800,
      percent: 15,
    },
    {
      text: "📚 Analyzing top 5 most relevant books...",
      duration: 1000,
      percent: 35,
    },
    {
      text: "🧠 Extracting key insights and themes...",
      duration: 900,
      percent: 60,
    },
    {
      text: "⚡ Comparing different perspectives...",
      duration: 700,
      percent: 80,
    },
    {
      text: "✨ Generating your premium summary...",
      duration: 600,
      percent: 100,
    },
  ];

  // Simulate WebSocket connection for real-time updates
  const simulateWebSocketUpdates = (callback: (data: any) => void) => {
    const operations = [
      "Indexing book database...",
      "Applying NLP algorithms...",
      "Cross-referencing topics...",
      "Ranking relevance scores...",
      "Synthesizing insights...",
      "Formatting results...",
    ];

    let opIndex = 0;
    const interval = setInterval(() => {
      if (opIndex < operations.length) {
        callback({
          operation: operations[opIndex],
          progress: (opIndex + 1) * 16.6,
        });
        opIndex++;
      } else {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    // Check if user has queries remaining
    if (user?.tier === "free" && user.queriesUsed >= user.queriesLimit) {
      setShowUpgrade(true);
      return;
    }

    setIsGenerating(true);
    setGenerationStage(0);

    // Enhanced progressive generation with WebSocket simulation
    let currentStageIndex = 0;
    const processNextStage = () => {
      if (currentStageIndex < generationStages.length) {
        const stage = generationStages[currentStageIndex];
        setGenerationStage(currentStageIndex);
        setProgressPercent(stage.percent);
        setEstimatedTimeLeft(Math.max(5, 60 - (stage.percent / 100) * 55));

        // Simulate WebSocket updates for current stage
        const cleanup = simulateWebSocketUpdates((data) => {
          setCurrentOperation(data.operation);
        });

        setTimeout(() => {
          cleanup();
          currentStageIndex++;
          processNextStage();
        }, stage.duration);
      }
    };

    processNextStage();

    // Complete generation after all stages
    setTimeout(() => {
      const summary: GeneratedSummary = {
        topic: topic,
        books: mockBooks,
        summary: `**Comparative Analysis: ${topic}**

Effective leadership emerges from a synthesis of character-driven principles and strategic thinking. Collins' "Good to Great" research reveals that Level 5 leaders possess the paradoxical combination of personal humility and professional will—they channel their ego needs away from themselves into the larger goal of building a great company. This contrasts yet complements Covey's principle-centered approach in "The 7 Habits," which emphasizes character ethics over personality ethics, arguing that sustainable leadership comes from being rather than seeming.

Sinek's "Leaders Eat Last" introduces the biological and anthropological foundations of leadership through the "Circle of Safety" concept, where leaders create an environment of trust by prioritizing their team's well-being. This scientific approach aligns beautifully with Brown's vulnerability-based leadership model in "Dare to Lead," which demonstrates that courage, compassion, and connection form the cornerstone of 21st-century leadership effectiveness.

Kouzes and Posner's extensive research in "The Leadership Challenge" provides the practical framework through five exemplary leadership practices: modeling the way, inspiring a shared vision, challenging the process, enabling others to act, and encouraging the heart. These practices serve as the tactical implementation of the philosophical foundations laid by the other authors.

**Synthesized Insight:** Exceptional leadership isn't about commanding authority but about serving others while maintaining unwavering commitment to principles and shared vision. The most effective leaders combine humility with fierce determination, create psychological safety for innovation, demonstrate vulnerability as strength, and consistently embody the values they expect from others. Modern leadership requires both the head (strategic thinking) and the heart (emotional intelligence) working in harmony.`,
        quotes: [
          '"Level 5 leaders channel their ego needs away from themselves and into the larger goal of building a great company. It\'s not that Level 5 leaders have no ego or self-interest. Indeed, they are incredibly ambitious—but their ambition is first and foremost for the institution, not themselves." - Jim Collins',
          '"Private victories precede public victories. Paradigms are powerful because they create the lens through which we see the world." - Stephen R. Covey',
          '"Leadership is not about being in charge. Leadership is about taking care of those in your charge. Leaders are the ones who run headfirst into the unknown. They rush toward the danger. They put their own interests aside to protect us or to pull us into the future." - Simon Sinek',
          '"Vulnerability is not winning or losing; it\'s having the courage to show up and be seen when we have no control over the outcome." - Brené Brown',
          '"Leadership is everyone\'s business because everyone—at some level and at some time—is a leader." - James Kouzes & Barry Posner',
        ],
        generatedAt: new Date().toISOString(),
      };

      setGeneratedSummary(summary);

      // Update user's query count
      if (user) {
        updateUser({ queriesUsed: user.queriesUsed + 1 });
      }

      setIsGenerating(false);
      setGenerationStage(0);
      setProgressPercent(0);
      setCurrentOperation("");
      setEstimatedTimeLeft(60);
    }, 4500);
  };

  const handleExportTXT = () => {
    if (!generatedSummary) {
      alert("Please generate a summary first before exporting.");
      return;
    }

    const content = `SummifyAI Chapter Discovery Report
Topic: ${generatedSummary.topic}
Generated: ${new Date().toLocaleDateString()}
User: ${user?.email || "Guest"}
Plan: ${user?.plan === "premium" ? "Premium" : "Free"}

===============================================

📚 BOOKS ANALYZED (${generatedSummary.books.length})
${generatedSummary.books
  .map(
    (book, index) =>
      `${index + 1}. ${book.title} by ${book.author}\n   Link: ${book.amazonLink}`,
  )
  .join("\n")}

🧠 COMPARATIVE ANALYSIS
${generatedSummary.summary}

💬 KEY INSIGHTS & QUOTES
${generatedSummary.quotes
  .slice(0, user?.plan === "premium" ? generatedSummary.quotes.length : 3)
  .map((quote, index) => `${index + 1}. "${quote}"`)
  .join("\n")}

${
  user?.plan !== "premium" && generatedSummary.quotes.length > 3
    ? `\n💎 Upgrade to Premium to see all ${generatedSummary.quotes.length} insights and quotes`
    : ""
}

===============================================
Generated by SummifyAI - Discover exactly what chapters to read, not entire books
www.summifyai.com
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SummifyAI_${generatedSummary.topic.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert("✅ TXT file exported successfully! Check your downloads folder.");
  };

  const handleExportDOCX = () => {
    if (!generatedSummary) {
      alert("Please generate a summary first before exporting.");
      return;
    }

    // For now, we'll export as RTF which can be opened by Word
    const content = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}
{\\colortbl;\\red0\\green0\\blue0;\\red70\\green97\\blue238;}
\\f0\\fs24
{\\b\\fs32\\cf2 SummifyAI Chapter Discovery Report}\\par
\\par
{\\b Topic:} ${generatedSummary.topic}\\par
{\\b Generated:} ${new Date().toLocaleDateString()}\\par
{\\b User:} ${user?.email || "Guest"}\\par
{\\b Plan:} ${user?.plan === "premium" ? "Premium" : "Free"}\\par
\\par
{\\b\\fs28\\cf2 📚 BOOKS ANALYZED (${generatedSummary.books.length})}\\par
${generatedSummary.books
  .map(
    (book, index) => `${index + 1}. {\\b ${book.title}} by ${book.author}\\par`,
  )
  .join("")}
\\par
{\\b\\fs28\\cf2 🧠 COMPARATIVE ANALYSIS}\\par
${generatedSummary.summary.replace(/\n/g, "\\par ")}\\par
\\par
{\\b\\fs28\\cf2 💬 KEY INSIGHTS & QUOTES}\\par
${generatedSummary.quotes
  .slice(0, user?.plan === "premium" ? generatedSummary.quotes.length : 3)
  .map((quote, index) => `${index + 1}. \\i "${quote}"\\i0\\par`)
  .join("")}
\\par
{\\i Generated by SummifyAI - www.summifyai.com}\\par
}`;

    const blob = new Blob([content], { type: "application/rtf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `SummifyAI_${generatedSummary.topic.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.rtf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(
      "✅ DOCX-compatible file exported successfully! Check your downloads folder.",
    );
  };

  const handleExportPDF = async () => {
    if (!generatedSummary) {
      alert("Please generate a summary first before exporting to PDF.");
      return;
    }

    // Check if user has premium for full export
    const isPremium = user?.plan === "premium";

    if (!isPremium) {
      const confirmed = window.confirm(
        "PDF Export ($2.99)\n\n📄 Professional PDF format\n🎨 Beautiful SummifyAI branding\n📊 Complete analysis and quotes\n🔗 Clickable Amazon links\n\nNote: Free users get limited quotes. Upgrade for full export!\n\nProceed with export?",
      );

      if (!confirmed) return;

      // Simulate payment for demo
      alert("💳 Payment processed! Generating your PDF...");
    }

    try {
      // Create PDF document with our template
      const doc = (
        <PDFTemplate
          summary={{
            topic: generatedSummary.topic,
            books: generatedSummary.books,
            summary: generatedSummary.summary,
            quotes: generatedSummary.quotes,
            generatedAt: new Date().toISOString(),
          }}
          userEmail={user?.email || "guest@summifyai.com"}
          isPremium={isPremium}
        />
      );

      // Generate PDF blob
      const asPdf = pdf();
      asPdf.updateContainer(doc);
      const blob = await asPdf.toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `SummifyAI_${generatedSummary.topic.replace(/[^a-zA-Z0-9]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);

      alert("✅ PDF exported successfully! Check your downloads folder.");
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("❌ Failed to export PDF. Please try again.");
    }
  };

  const handlePriorityGeneration = async () => {
    if (!topic.trim()) return;

    const confirmed = window.confirm(
      "Priority Generation ($1.99)\n\n⚡ Get your summary in 10 seconds with premium processing\n🚀 Skip the queue and get instant results\n🎆 Enhanced AI analysis with GPT-4\n\nProceed with payment?",
    );

    if (!confirmed) return;

    setIsGenerating(true);
    setGenerationStage(0);
    setProgressPercent(0);
    setCurrentOperation("Initializing priority queue...");

    // Simulate priority processing (faster)
    const priorityStages = [
      { text: "⚡ Priority queue activated...", duration: 200, percent: 20 },
      { text: "🚀 Advanced AI processing...", duration: 300, percent: 50 },
      { text: "🎆 Premium analysis complete...", duration: 200, percent: 80 },
      { text: "✨ Delivering results...", duration: 100, percent: 100 },
    ];

    let currentStageIndex = 0;
    const processPriorityStage = () => {
      if (currentStageIndex < priorityStages.length) {
        const stage = priorityStages[currentStageIndex];
        setGenerationStage(currentStageIndex);
        setProgressPercent(stage.percent);
        setEstimatedTimeLeft(Math.max(1, 10 - (stage.percent / 100) * 9));
        setCurrentOperation(`Priority processing: ${stage.text}`);

        setTimeout(() => {
          currentStageIndex++;
          processPriorityStage();
        }, stage.duration);
      }
    };

    processPriorityStage();

    // Complete priority generation quickly
    setTimeout(() => {
      const summary: GeneratedSummary = {
        topic: topic,
        books: mockBooks,
        summary: `**Priority Analysis: ${topic}** 🚀

[Enhanced with GPT-4 Priority Processing]

This premium analysis leverages advanced AI models for deeper insights. The synthesis below represents accelerated processing of millions of data points from authoritative sources.

Effective leadership emerges from a synthesis of character-driven principles and strategic thinking. Collins' "Good to Great" research reveals that Level 5 leaders possess the paradoxical combination of personal humility and professional will—they channel their ego needs away from themselves into the larger goal of building a great company. This contrasts yet complements Covey's principle-centered approach in "The 7 Habits," which emphasizes character ethics over personality ethics, arguing that sustainable leadership comes from being rather than seeming.

Sinek's "Leaders Eat Last" introduces the biological and anthropological foundations of leadership through the "Circle of Safety" concept, where leaders create an environment of trust by prioritizing their team's well-being. This scientific approach aligns beautifully with Brown's vulnerability-based leadership model in "Dare to Lead," which demonstrates that courage, compassion, and connection form the cornerstone of 21st-century leadership effectiveness.

**Premium Insight:** The convergence analysis reveals that modern leadership requires balancing four critical dimensions: Authenticity (being genuine), Adaptability (responding to change), Accountability (taking responsibility), and Advocacy (championing others). Leaders who master this "4A Framework" consistently outperform peers by 340% in team engagement and 280% in organizational outcomes.

**Exclusive Finding:** Cross-referencing with 50+ additional sources reveals that the most successful leaders spend 60% of their time developing others rather than directing tasks—a pattern consistent across all five analyzed books but emphasized most strongly in the latest research.`,
        quotes: [
          '"Level 5 leaders channel their ego needs away from themselves and into the larger goal of building a great company. It\'s not that Level 5 leaders have no ego or self-interest. Indeed, they are incredibly ambitious—but their ambition is first and foremost for the institution, not themselves." - Jim Collins',
          '"Private victories precede public victories. Paradigms are powerful because they create the lens through which we see the world." - Stephen R. Covey',
          '"Leadership is not about being in charge. Leadership is about taking care of those in your charge. Leaders are the ones who run headfirst into the unknown." - Simon Sinek',
          '"Vulnerability is not winning or losing; it\'s having the courage to show up and be seen when we have no control over the outcome." - Brené Brown',
          '"Leadership is everyone\'s business because everyone—at some level and at some time—is a leader." - James Kouzes & Barry Posner',
          '"[Premium Insight] The future belongs to leaders who can hold paradox: being both confident and humble, decisive and collaborative, innovative and grounded." - SummifyAI Priority Analysis',
        ],
        generatedAt: new Date().toISOString(),
      };

      setGeneratedSummary(summary);

      // Simulate payment processing
      alert(
        "💳 Payment successful! $1.99 charged for Priority Generation\n✨ Premium features unlocked for this summary",
      );

      // Update user's query count
      if (user) {
        updateUser({ queriesUsed: user.queriesUsed + 1 });
      }

      setIsGenerating(false);
      setGenerationStage(0);
      setProgressPercent(0);
      setCurrentOperation("");
      setEstimatedTimeLeft(60);
    }, 1000);
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
            Ready to Generate Amazing Summaries?
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Sign in to unlock the power of AI-driven book analysis
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
      {/* Navigation */}
      <nav className="bg-[#FFFD63] dark:bg-gray-900 relative z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0A0B1E] dark:bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <span className="text-[#FFFD63] dark:text-[#0A0B1E] font-bold text-lg">
                  S
                </span>
              </div>
              <span className="text-xl font-bold text-[#0A0B1E] dark:text-white">
                SummifyAI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/results"
                className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
              >
                Library
              </Link>
              <Link
                to="/support"
                className="text-[#0A0B1E] dark:text-white hover:text-[#0A0B1E]/80 dark:hover:text-white/80 font-medium"
              >
                Support
              </Link>
              <div className="hidden md:flex items-center space-x-2 bg-white/20 dark:bg-gray-700 rounded-lg px-3 py-1">
                <div
                  className={`w-2 h-2 rounded-full ${user.tier === "premium" ? "bg-green-500" : "bg-yellow-500"}`}
                ></div>
                <span className="text-sm font-medium text-[#0A0B1E] dark:text-white">
                  {user.tier === "premium"
                    ? "Unlimited"
                    : `${user.queriesUsed}/${user.queriesLimit}`}
                </span>
              </div>
              <ThemeToggle />
              <Link
                to="/dashboard"
                className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-3xl p-8 text-white relative overflow-hidden mb-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                🚀 AI-Powered Chapter Discovery
              </h1>
              <p className="text-xl text-white/90 max-w-3xl mx-auto">
                Enter any topic and watch our AI find the exact chapters and
                pages that address your question, analyze why each chapter is
                relevant, and provide targeted insights in seconds.
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
                    placeholder="Enter a specific question or topic (e.g., how to build trust in teams)"
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
                  "Leadership",
                  "Productivity",
                  "Innovation",
                  "Personal Finance",
                  "Mindfulness",
                  "Entrepreneurship",
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

            {/* Usage Stats */}
            {user.tier === "free" && (
              <div className="mt-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-yellow-800 dark:text-yellow-200 mb-1">
                      Free Plan: {user.queriesUsed}/{user.queriesLimit}{" "}
                      summaries used
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {user.queriesUsed >= user.queriesLimit
                        ? "You've reached your monthly limit. Upgrade for unlimited access!"
                        : `${user.queriesLimit - user.queriesUsed} summaries remaining this month`}
                    </p>
                  </div>
                  {user.queriesUsed >= user.queriesLimit && (
                    <Link
                      to="/pricing"
                      className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-orange-600 hover:to-yellow-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Upgrade Now
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Premium Features for Premium Users */}
            {user.tier === "premium" && !isGenerating && (
              <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-blue-800 dark:text-blue-200 mb-1">
                      ⚡ Premium Member - Unlimited Access
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Want instant results? Get priority generation in 10
                      seconds for just $1.99
                    </p>
                  </div>
                  <button
                    onClick={handlePriorityGeneration}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Priority ($1.99)
                  </button>
                </div>
              </div>
            )}
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
                AI is analyzing "{topic}"
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

              <div className="space-y-4 mb-8">
                {generationStages.map((stage, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-center p-4 rounded-2xl transition-all duration-500 relative ${
                      index < generationStage
                        ? "bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 text-green-800 dark:text-green-200"
                        : index === generationStage
                          ? "bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-800 dark:text-blue-200 animate-pulse"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {index < generationStage ? (
                      <svg
                        className="w-5 h-5 mr-3 text-green-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : index === generationStage ? (
                      <div className="w-5 h-5 mr-3">
                        <div className="w-full h-full border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : (
                      <div className="w-5 h-5 mr-3 rounded-full border-2 border-gray-400"></div>
                    )}
                    <span className="font-medium">{stage.text}</span>
                    {index < generationStage && (
                      <div className="absolute right-4 text-green-600 font-bold">
                        {stage.percent}%
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl p-6">
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Our AI is processing millions of book pages to find the most
                  relevant insights for your topic. This usually takes 30-60
                  seconds for the best quality results.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Generated Summary */}
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
                ✨ Summary Generated Successfully!
              </h2>
              <p className="text-white/90">
                We analyzed {generatedSummary.books.length} top books on "
                {generatedSummary.topic}" and created your comparative analysis
              </p>
            </div>

            {/* Books Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                📚 Top Books Analyzed
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {generatedSummary.books.map((book, index) => (
                  <div key={book.id} className="text-center group relative">
                    <div className="relative mb-4">
                      <img
                        src={book.cover}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-2xl shadow-lg group-hover:shadow-2xl transition-all transform group-hover:scale-105"
                      />
                      {book.commission >= 8.5 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                          🔥 Bestseller
                        </div>
                      )}
                      <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                      by {book.author}
                    </p>
                    <a
                      href={book.amazonLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-gradient-to-r from-[#FFFD63] to-[#FFE066] hover:from-[#FFE066] hover:to-[#FFFD63] text-[#0A0B1E] text-xs px-4 py-2 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 w-full"
                    >
                      Buy on Amazon
                    </a>
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">
                      💰 {book.commission}% commission
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                  🧠 Comparative Analysis
                </h2>
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportPDF}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    PDF {user?.plan === "premium" ? "" : "($2.99)"}
                  </button>
                  <button
                    onClick={handleExportTXT}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    TXT
                  </button>
                  <button
                    onClick={handleExportDOCX}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 text-sm"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    DOCX
                  </button>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2">
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
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    Share & Earn
                  </button>
                </div>
              </div>

              <div className="prose max-w-none">
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line bg-gray-50 dark:bg-gray-700 rounded-2xl p-6">
                  {generatedSummary.summary}
                </div>
              </div>
            </div>

            {/* Key Quotes Section */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
                💬 Key Insights & Quotes
              </h2>
              <div className="space-y-6">
                {generatedSummary.quotes.map((quote, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-l-4 border-gradient-to-b from-[#4361EE] to-[#7B2CBF] rounded-2xl p-6 relative"
                  >
                    <div className="absolute top-4 left-4 w-8 h-8 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <blockquote className="ml-12">
                      <p className="text-gray-800 dark:text-gray-200 italic text-lg leading-relaxed">
                        {quote}
                      </p>
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>

            {/* Viral Loop */}
            <div className="bg-gradient-to-r from-[#FFFD63] via-yellow-400 to-orange-400 rounded-3xl p-8 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-[#0A0B1E] mb-4">
                  🚀 Love this summary? Share it and earn!
                </h3>
                <p className="text-[#0A0B1E]/80 mb-6 text-lg">
                  When friends sign up through your link, you both get +1 free
                  summary and you earn commissions on their book purchases!
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button className="bg-white hover:bg-gray-100 text-[#0A0B1E] px-8 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                    </svg>
                    Share on Twitter
                  </button>
                  <button className="bg-white hover:bg-gray-100 text-[#0A0B1E] px-8 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
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
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upgrade Modal */}
        {showUpgrade && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-3xl max-w-md w-full p-8 relative">
              <button
                onClick={() => setShowUpgrade(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-full flex items-center justify-center mx-auto mb-6">
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

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Unlock Unlimited Summaries
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                  You've used all your free summaries this month. Upgrade to
                  Premium for unlimited access, priority generation, and
                  exclusive features.
                </p>

                <div className="space-y-4">
                  <Link
                    to="/pricing"
                    className="block bg-gradient-to-r from-[#FFFD63] to-[#FFE066] hover:from-[#FFE066] hover:to-[#FFFD63] text-[#0A0B1E] px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 text-center"
                  >
                    🚀 Upgrade to Premium
                  </Link>
                  <button
                    onClick={() => setShowUpgrade(false)}
                    className="block w-full bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-8 py-4 rounded-2xl font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

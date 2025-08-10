import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Target,
  Lightbulb,
  MessageCircle,
  HelpCircle,
  Zap,
} from "lucide-react";
import { analyzeTopicWithAI } from "@/services/supabaseApiService";

interface SmartSearchProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  user: any;
}

interface TopicSuggestion {
  label: string;
  value: string;
  description: string;
  category: string;
}

export default function SmartSearchInterface({
  onSearch,
  isLoading,
  user,
}: SmartSearchProps) {
  const [query, setQuery] = useState("");
  const [currentStep, setCurrentStep] = useState<
    "welcome" | "input" | "refine" | "suggestions"
  >("welcome");
  const [topicAnalysis, setTopicAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showQuickTopics, setShowQuickTopics] = useState(false);

  const welcomeMessages = [
    {
      icon: <MessageCircle className="h-5 w-5 text-[#FFFD63]" />,
      title: "Hi there! What would you like to learn about today?",
      subtitle:
        "I'll help you find the exact chapters that answer your question.",
    },
    {
      icon: <HelpCircle className="h-5 w-5 text-[#FFFD63]" />,
      title: "Tell me more about what you're looking for",
      subtitle:
        "The more specific you are, the better results I can find for you.",
    },
  ];

  const quickTopics = [
    {
      label: "Leadership Skills",
      value: "leadership development",
      category: "Management",
      description: "Building effective leadership capabilities",
    },
    {
      label: "Team Communication",
      value: "team communication strategies",
      category: "Communication",
      description: "Improving workplace collaboration",
    },
    {
      label: "Negotiation Tactics",
      value: "negotiation techniques",
      category: "Business",
      description: "Mastering deal-making skills",
    },
    {
      label: "Innovation Process",
      value: "innovation methodologies",
      category: "Strategy",
      description: "Creating breakthrough ideas",
    },
    {
      label: "Productivity Hacks",
      value: "productivity improvement",
      category: "Personal Development",
      description: "Optimizing your workflow",
    },
    {
      label: "Financial Strategy",
      value: "financial planning strategies",
      category: "Finance",
      description: "Smart money management",
    },
    {
      label: "Digital Marketing",
      value: "digital marketing tactics",
      category: "Marketing",
      description: "Online growth strategies",
    },
    {
      label: "Customer Service",
      value: "customer service excellence",
      category: "Service",
      description: "Delivering exceptional experiences",
    },
  ];

  const handleInitialSearch = async () => {
    if (!query.trim()) return;

    setIsAnalyzing(true);
    setCurrentStep("refine");

    try {
      const analysis = await analyzeTopicWithAI(query);
      setTopicAnalysis(analysis);

      if (analysis.isBroad && analysis.refinements?.length > 0) {
        setCurrentStep("suggestions");
      } else {
        // Topic is specific enough, proceed with search
        onSearch(query);
      }
    } catch (error) {
      console.error("Topic analysis failed:", error);
      // Proceed with search anyway
      onSearch(query);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRefinedSearch = (refinedQuery: string) => {
    setQuery(refinedQuery);
    onSearch(refinedQuery);
  };

  const handleQuickTopicSelect = (topic: TopicSuggestion) => {
    setQuery(topic.value);
    onSearch(topic.value);
  };

  // Welcome Step
  if (currentStep === "welcome") {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Conversational Welcome */}
        <div className="text-center mb-12">
          <div className="bg-[#FFFD63] dark:bg-gray-800 rounded-3xl p-8 mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#0A0B1E] dark:bg-[#FFFD63] rounded-full flex items-center justify-center">
                <Search className="h-8 w-8 text-[#FFFD63] dark:text-[#0A0B1E]" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#0A0B1E] dark:text-white mb-4">
              Hi {user?.firstName || "there"}! 👋
            </h1>
            <p className="text-lg text-[#0A0B1E]/80 dark:text-gray-300 mb-6">
              What would you like to learn about today? I'll help you find the
              exact chapters that answer your question from our library of
              business books.
            </p>
            <div className="flex justify-center">
              <Button
                onClick={() => setCurrentStep("input")}
                className="bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] px-8 py-3 rounded-xl font-medium"
              >
                Let's Start Searching
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Topics Preview */}
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Or explore these popular topics:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickTopics.slice(0, 8).map((topic, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => handleQuickTopicSelect(topic)}
                className="h-auto p-3 text-left flex flex-col items-start hover:border-[#FFFD63] hover:bg-[#FFFD63]/5"
              >
                <span className="font-medium text-sm">{topic.label}</span>
                <span className="text-xs text-gray-500 mt-1">
                  {topic.category}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Input Step
  if (currentStep === "input") {
    return (
      <div className="max-w-3xl mx-auto">
        <Card className="border-[#FFFD63]/20 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Lightbulb className="h-12 w-12 text-[#FFFD63]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                What specific topic interests you?
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Be as specific as possible - I'll find the most relevant
                chapters for you.
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., 'effective delegation strategies for managers' or 'building team trust'"
                  className="h-14 pl-12 pr-4 text-lg border-[#FFFD63]/30 focus:border-[#FFFD63]"
                  onKeyPress={(e) => e.key === "Enter" && handleInitialSearch()}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleInitialSearch}
                  disabled={!query.trim() || isAnalyzing}
                  className="flex-1 bg-[#0A0B1E] hover:bg-[#0A0B1E]/90 text-[#FFFD63] h-12"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="animate-spin mr-2 h-4 w-4" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Find Chapters
                      <Search className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowQuickTopics(!showQuickTopics)}
                  className="h-12 border-[#FFFD63]/30 hover:bg-[#FFFD63]/5"
                >
                  <Target className="mr-2 h-4 w-4" />
                  Browse Topics
                </Button>
              </div>

              {showQuickTopics && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                  {quickTopics.map((topic, index) => (
                    <Card
                      key={index}
                      className="cursor-pointer hover:border-[#FFFD63]/50 transition-colors"
                      onClick={() => handleQuickTopicSelect(topic)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-sm">
                              {topic.label}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {topic.description}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {topic.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Suggestions Step
  if (currentStep === "suggestions" && topicAnalysis) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="border-[#FFFD63]/20 shadow-lg">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <TrendingUp className="h-12 w-12 text-[#FFFD63]" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Let's make your search more specific
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {topicAnalysis.explanation}
              </p>
              <Badge
                variant="outline"
                className="bg-[#FFFD63]/10 text-[#0A0B1E] border-[#FFFD63]/30"
              >
                Your search: "{query}"
              </Badge>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-[#FFFD63]" />
                  Here are some focused alternatives:
                </h3>
                <div className="grid gap-4">
                  {topicAnalysis.refinements?.map(
                    (refinement: any, index: number) => (
                      <Card
                        key={index}
                        className="cursor-pointer hover:border-[#FFFD63]/50 transition-colors"
                        onClick={() => handleRefinedSearch(refinement.value)}
                      >
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                {refinement.label}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {refinement.description}
                              </p>
                            </div>
                            <ArrowRight className="h-5 w-5 text-[#FFFD63] ml-4" />
                          </div>
                        </CardContent>
                      </Card>
                    ),
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => onSearch(query)}
                    variant="outline"
                    className="flex-1 border-[#FFFD63]/30 hover:bg-[#FFFD63]/5"
                  >
                    Search "{query}" anyway
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("input")}
                    variant="ghost"
                    className="flex-1"
                  >
                    Try a different topic
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading or other states
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-[#FFFD63]/20 shadow-lg">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <Sparkles className="animate-spin h-12 w-12 text-[#FFFD63]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Analyzing your search...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            I'm finding the best chapters for you!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import { Badge } from "./ui/badge";

interface AIRelevanceScoreProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showBar?: boolean;
  query?: string;
}

const AIRelevanceScore: React.FC<AIRelevanceScoreProps> = ({
  score,
  size = "md",
  showBar = true,
  query,
}) => {
  // Ensure score is between 0 and 100
  const normalizedScore = Math.min(100, Math.max(0, Math.round(score)));

  // Determine color scheme based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return "emerald"; // Excellent match
    if (score >= 80) return "blue"; // Very good match
    if (score >= 70) return "indigo"; // Good match
    if (score >= 60) return "purple"; // Fair match
    if (score >= 50) return "orange"; // Moderate match
    return "red"; // Low match
  };

  // Get score description
  const getScoreDescription = (score: number) => {
    if (score >= 95) return "Perfect Match";
    if (score >= 90) return "Excellent Match";
    if (score >= 80) return "Very Relevant";
    if (score >= 70) return "Good Match";
    if (score >= 60) return "Fair Match";
    if (score >= 50) return "Moderate";
    return "Low Relevance";
  };

  const color = getScoreColor(normalizedScore);
  const description = getScoreDescription(normalizedScore);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs px-3 py-1",
    lg: "text-sm px-4 py-1.5",
  };

  const colorClasses = {
    emerald: {
      badge:
        "bg-gradient-to-r from-emerald-500 to-green-500 border-0 text-white shadow-lg shadow-emerald-500/25",
      bar: "bg-gradient-to-r from-emerald-400 to-green-400",
      glow: "shadow-emerald-500/50",
    },
    blue: {
      badge:
        "bg-gradient-to-r from-blue-500 to-cyan-500 border-0 text-white shadow-lg shadow-blue-500/25",
      bar: "bg-gradient-to-r from-blue-400 to-cyan-400",
      glow: "shadow-blue-500/50",
    },
    indigo: {
      badge:
        "bg-gradient-to-r from-indigo-500 to-purple-500 border-0 text-white shadow-lg shadow-indigo-500/25",
      bar: "bg-gradient-to-r from-indigo-400 to-purple-400",
      glow: "shadow-indigo-500/50",
    },
    purple: {
      badge:
        "bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white shadow-lg shadow-purple-500/25",
      bar: "bg-gradient-to-r from-purple-400 to-pink-400",
      glow: "shadow-purple-500/50",
    },
    orange: {
      badge:
        "bg-gradient-to-r from-orange-500 to-amber-500 border-0 text-white shadow-lg shadow-orange-500/25",
      bar: "bg-gradient-to-r from-orange-400 to-amber-400",
      glow: "shadow-orange-500/50",
    },
    red: {
      badge:
        "bg-gradient-to-r from-red-500 to-rose-500 border-0 text-white shadow-lg shadow-red-500/25",
      bar: "bg-gradient-to-r from-red-400 to-rose-400",
      glow: "shadow-red-500/50",
    },
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      {/* AI Score Badge */}
      <div className="relative group">
        <Badge
          variant="outline"
          className={`${colorClasses[color].badge} ${sizeClasses[size]} font-bold rounded-full transition-all duration-300 hover:scale-110 ${colorClasses[color].glow} hover:shadow-xl cursor-help`}
          title={`AI-analyzed relevance: ${description} (${normalizedScore}% match${query ? ` for "${query}"` : ""})`}
        >
          <span className="flex items-center space-x-1">
            <span className="animate-pulse">🧠</span>
            <span>{normalizedScore}%</span>
          </span>
        </Badge>


      </div>

      {/* Level Bar */}
      {showBar && (
        <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
          <div
            className={`h-full ${colorClasses[color].bar} rounded-full transition-all duration-1000 ease-out relative`}
            style={{ width: `${normalizedScore}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Score Label */}
      <div className="text-[10px] font-medium text-gray-600 dark:text-gray-400 text-center leading-tight">
        {size === "lg" && <div>{description}</div>}
        <div className="text-gray-500">AI Match</div>
      </div>
    </div>
  );
};

export default AIRelevanceScore;

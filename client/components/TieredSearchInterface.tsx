import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "react-router-dom";
import {
  tieredSearchService,
  SEARCH_TIERS,
  type TieredSearchResponse,
  type SearchResult,
} from "@/services/tieredSearchService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  ArrowUpCircle,
  Zap,
  Search,
  Sparkles,
  Crown,
  Lock,
} from "lucide-react";
import TieredSearchResults from "@/components/TieredSearchResults";

interface TieredSearchInterfaceProps {
  onUpgrade?: () => void;
}

export default function TieredSearchInterface({
  onUpgrade,
}: TieredSearchInterfaceProps) {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [searchResponse, setSearchResponse] =
    useState<TieredSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeBanner, setShowUpgradeBanner] = useState(false);

  const userPlan = user?.planType || "free";
  const userSearchCount = user?.searchCount || 0;
  const currentTier = SEARCH_TIERS[userPlan];

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await tieredSearchService.performSearch(
        query,
        userPlan,
        userSearchCount,
      );
      setSearchResponse(response);

      if (response.upgradeRequired) {
        setShowUpgradeBanner(true);
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSearchIcon = (searchType: string) => {
    switch (searchType) {
      case "summary":
        return <Search className="w-4 h-4 text-blue-500" />;
      case "chapter":
        return <Sparkles className="w-4 h-4 text-purple-500" />;
      case "fulltext":
        return <Crown className="w-4 h-4 text-gold-500" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case "free":
        return "bg-gray-100 text-gray-800";
      case "scholar":
        return "bg-amber-100 text-amber-800";
      case "professional":
        return "bg-green-100 text-green-800";
      case "institution":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getUsageProgress = () => {
    if (currentTier.maxQueries === -1) return 100; // Unlimited
    return (userSearchCount / currentTier.maxQueries) * 100;
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Search Header with Tier Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              SummifyAI Search
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Search through 120,000+ book chapters with advanced AI
            </p>
          </div>

          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <Badge className={`${getPlanBadgeColor(userPlan)} font-semibold`}>
              {currentTier.name} Plan
            </Badge>

            {currentTier.maxQueries !== -1 && (
              <div className="text-right">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {searchResponse?.queriesRemaining ||
                    currentTier.maxQueries - userSearchCount}{" "}
                  searches left
                </p>
                <Progress value={getUsageProgress()} className="w-24 h-2" />
              </div>
            )}
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for concepts, topics, or specific information..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-[#FFFD63] hover:bg-[#FFFD63]/90 text-[#0A0B1E] font-semibold px-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#0A0B1E] border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </Button>
          </div>

          {/* Feature Indicators */}
          <div className="flex flex-wrap gap-2">
            {currentTier.features.map((feature) => (
              <Badge key={feature.id} variant="outline" className="text-xs">
                {feature.enabled ? (
                  <span className="text-green-600">✓ {feature.name}</span>
                ) : (
                  <span className="text-gray-400">
                    <Lock className="w-3 h-3 inline mr-1" />
                    {feature.name}
                  </span>
                )}
              </Badge>
            ))}
          </div>
        </form>
      </div>

      {/* Upgrade Banner */}
      {showUpgradeBanner && searchResponse?.upgradeRequired && (
        <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
          <ArrowUpCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            <div className="flex items-center justify-between">
              <span>{searchResponse.upgradeMessage}</span>
              <Button
                onClick={onUpgrade}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white ml-4"
              >
                Upgrade Now
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Rich Search Results */}
      {searchResponse && !searchResponse.upgradeRequired && (
        <TieredSearchResults
          searchResponse={searchResponse}
          query={query}
          userPlan={userPlan}
          onUpgrade={onUpgrade}
        />
      )}
    </div>
  );
}

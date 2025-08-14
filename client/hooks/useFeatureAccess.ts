import { useAuth } from "@/contexts/AuthContext";

export interface FeatureLimits {
  monthlySearches: number;
  exportToPDF: boolean;
  priorityProcessing: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  customModels: boolean;
  teamCollaboration: boolean;
  whiteLabel: boolean;
  dedicatedSupport: boolean;
}

export interface PlanFeatures {
  [key: string]: FeatureLimits;
}

const PLAN_FEATURES: PlanFeatures = {
  free: {
    monthlySearches: 10,
    exportToPDF: false,
    priorityProcessing: false,
    advancedAnalytics: false,
    apiAccess: false,
    customModels: false,
    teamCollaboration: false,
    whiteLabel: false,
    dedicatedSupport: false,
  },
  scholar: {
    monthlySearches: 500,
    exportToPDF: true,
    priorityProcessing: true,
    advancedAnalytics: true,
    apiAccess: false,
    customModels: false,
    teamCollaboration: false,
    whiteLabel: false,
    dedicatedSupport: false,
  },
  professional: {
    monthlySearches: 2000,
    exportToPDF: true,
    priorityProcessing: true,
    advancedAnalytics: true,
    apiAccess: true,
    customModels: true,
    teamCollaboration: false,
    whiteLabel: false,
    dedicatedSupport: true,
  },
  institution: {
    monthlySearches: -1, // Unlimited
    exportToPDF: true,
    priorityProcessing: true,
    advancedAnalytics: true,
    apiAccess: true,
    customModels: true,
    teamCollaboration: true,
    whiteLabel: true,
    dedicatedSupport: true,
  },
};

export function useFeatureAccess() {
  const { user } = useAuth();

  const planType = user?.planType || "free";
  const currentFeatures = PLAN_FEATURES[planType] || PLAN_FEATURES.free;

  // Check if user has exceeded their monthly search limit
  const hasSearchesRemaining = () => {
    if (currentFeatures.monthlySearches === -1) return true; // Unlimited
    return (user?.searchCount || 0) < currentFeatures.monthlySearches;
  };

  // Check if specific feature is available for current plan
  const hasFeature = (feature: keyof FeatureLimits) => {
    return currentFeatures[feature];
  };

  // Get remaining searches for current month
  const getRemainingSearches = () => {
    if (currentFeatures.monthlySearches === -1) return "unlimited";
    return Math.max(
      0,
      currentFeatures.monthlySearches - (user?.searchCount || 0),
    );
  };

  // Get search usage percentage
  const getUsagePercentage = () => {
    if (currentFeatures.monthlySearches === -1) return 0;
    return Math.min(
      100,
      ((user?.searchCount || 0) / currentFeatures.monthlySearches) * 100,
    );
  };

  // Check if user can perform a search
  const canSearch = () => {
    return hasSearchesRemaining();
  };

  // Check if user can export to PDF
  const canExportPDF = () => {
    return hasFeature("exportToPDF");
  };

  // Check if user gets priority processing
  const hasPriorityProcessing = () => {
    return hasFeature("priorityProcessing");
  };

  // Check if user has access to advanced analytics
  const hasAdvancedAnalytics = () => {
    return hasFeature("advancedAnalytics");
  };

  // Check if user has API access
  const hasAPIAccess = () => {
    return hasFeature("apiAccess");
  };

  // Check if user can use custom models
  const canUseCustomModels = () => {
    return hasFeature("customModels");
  };

  // Check if user has team collaboration features
  const hasTeamCollaboration = () => {
    return hasFeature("teamCollaboration");
  };

  // Check if user has white-label options
  const hasWhiteLabel = () => {
    return hasFeature("whiteLabel");
  };

  // Check if user has dedicated support
  const hasDedicatedSupport = () => {
    return hasFeature("dedicatedSupport");
  };

  // Get upgrade message for blocked features
  const getUpgradeMessage = (feature: keyof FeatureLimits) => {
    const messages = {
      exportToPDF:
        "Upgrade to Scholar or higher to export search results to PDF",
      priorityProcessing:
        "Upgrade to Scholar or higher for priority search processing",
      advancedAnalytics:
        "Upgrade to Scholar or higher for advanced analytics and insights",
      apiAccess: "Upgrade to Professional or higher for API access",
      customModels: "Upgrade to Professional or higher for custom AI models",
      teamCollaboration:
        "Upgrade to Institution for team collaboration features",
      whiteLabel: "Upgrade to Institution for white-label options",
      dedicatedSupport:
        "Upgrade to Professional or higher for dedicated support",
      monthlySearches:
        "You've reached your monthly search limit. Upgrade for more searches.",
    };

    return messages[feature] || "Upgrade your plan to access this feature";
  };

  // Get the next tier that includes a specific feature
  const getRequiredTier = (feature: keyof FeatureLimits): string => {
    for (const [tier, features] of Object.entries(PLAN_FEATURES)) {
      if (features[feature] && tier !== "free") {
        return tier;
      }
    }
    return "scholar";
  };

  return {
    planType,
    currentFeatures,
    user,

    // Feature checks
    hasFeature,
    canSearch,
    canExportPDF,
    hasPriorityProcessing,
    hasAdvancedAnalytics,
    hasAPIAccess,
    canUseCustomModels,
    hasTeamCollaboration,
    hasWhiteLabel,
    hasDedicatedSupport,

    // Usage information
    hasSearchesRemaining,
    getRemainingSearches,
    getUsagePercentage,

    // Upgrade helpers
    getUpgradeMessage,
    getRequiredTier,
  };
}

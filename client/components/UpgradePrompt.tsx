import React from "react";
import { Link } from "react-router-dom";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

interface UpgradePromptProps {
  feature: keyof import("@/hooks/useFeatureAccess").FeatureLimits;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
  showInline?: boolean;
}

export default function UpgradePrompt({
  feature,
  children,
  fallback,
  className = "",
  showInline = false,
}: UpgradePromptProps) {
  const { hasFeature, getUpgradeMessage, getRequiredTier, planType } =
    useFeatureAccess();

  const hasAccess = hasFeature(feature);
  const requiredTier = getRequiredTier(feature);
  const upgradeMessage = getUpgradeMessage(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showInline) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          {upgradeMessage}
        </span>
        <Link
          to="/pricing"
          className="text-[#FFFD63] hover:text-[#FFFD63]/80 text-sm font-medium underline"
        >
          Upgrade
        </Link>
      </div>
    );
  }

  return (
    <div
      className={`bg-gradient-to-r from-[#FFFD63]/10 to-amber-100/50 dark:from-[#FFFD63]/20 dark:to-amber-900/20 rounded-xl p-6 border border-[#FFFD63]/20 ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-[#FFFD63] rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[#0A0B1E]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {planType === "free" ? "🔒 Premium Feature" : "🚀 Upgrade Required"}
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            {upgradeMessage}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-4 py-2 bg-[#FFFD63] hover:bg-[#FFFD63]/90 text-[#0A0B1E] rounded-lg font-medium transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
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
              Upgrade to{" "}
              {requiredTier.charAt(0).toUpperCase() + requiredTier.slice(1)}
            </Link>

            <Link
              to="/pricing"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Compare All Plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for wrapping buttons/actions that require upgrades
export function UpgradeWrapper({
  feature,
  children,
  className = "",
}: {
  feature: keyof import("@/hooks/useFeatureAccess").FeatureLimits;
  children: React.ReactNode;
  className?: string;
}) {
  const { hasFeature, getUpgradeMessage } = useFeatureAccess();

  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  return (
    <div className={`relative ${className}`}>
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Link
          to="/pricing"
          className="bg-[#FFFD63] hover:bg-[#FFFD63]/90 text-[#0A0B1E] px-3 py-1 rounded-lg text-sm font-medium transition-colors shadow-lg"
          title={getUpgradeMessage(feature)}
        >
          🔒 Upgrade
        </Link>
      </div>
    </div>
  );
}

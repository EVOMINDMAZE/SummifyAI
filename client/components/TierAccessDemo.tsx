import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFeatureAccess } from "@/hooks/useFeatureAccess";
import { UpgradeWrapper } from "./UpgradePrompt";

export default function TierAccessDemo() {
  const { user, refreshUser } = useAuth();
  const {
    planType,
    canExportPDF,
    hasPriorityProcessing,
    hasAdvancedAnalytics,
    hasAPIAccess,
    canUseCustomModels,
    hasTeamCollaboration,
    getRemainingSearches,
    getUsagePercentage,
    enforceFeatureAccess,
  } = useFeatureAccess();

  const handleFeatureTest = (feature: string) => {
    console.log(`Testing feature: ${feature}`);

    switch (feature) {
      case "exportToPDF":
        if (enforceFeatureAccess("exportToPDF")) {
          alert("✅ PDF Export feature accessed!");
        } else {
          alert("❌ PDF Export requires upgrade");
        }
        break;
      case "apiAccess":
        if (enforceFeatureAccess("apiAccess")) {
          alert("✅ API Access feature accessed!");
        } else {
          alert("❌ API Access requires upgrade");
        }
        break;
      case "teamCollaboration":
        if (enforceFeatureAccess("teamCollaboration")) {
          alert("✅ Team Collaboration feature accessed!");
        } else {
          alert("❌ Team Collaboration requires upgrade");
        }
        break;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🔐 Tier Access Control Demo
        </h2>
        <button
          onClick={refreshUser}
          className="px-4 py-2 bg-[#FFFD63] text-[#0A0B1E] rounded-lg font-medium hover:bg-yellow-300 transition-colors"
        >
          🔄 Refresh User Data
        </button>
      </div>

      {/* User Info */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Current User Info
          </h3>
          <div className="space-y-1 text-sm">
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Plan Type:</strong>{" "}
              <span className="capitalize">{planType}</span>
            </p>
            <p>
              <strong>Search Count:</strong> {user?.searchCount || 0}
            </p>
            <p>
              <strong>Monthly Limit:</strong>{" "}
              {user?.monthlySearchLimit === 999999
                ? "Unlimited"
                : user?.monthlySearchLimit}
            </p>
            <p>
              <strong>Remaining:</strong>{" "}
              {getRemainingSearches() === "unlimited"
                ? "Unlimited"
                : getRemainingSearches()}
            </p>
            <p>
              <strong>Usage:</strong> {getUsagePercentage().toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
            Feature Access
          </h3>
          <div className="space-y-1 text-sm">
            <p>📄 PDF Export: {canExportPDF() ? "✅" : "❌"}</p>
            <p>
              ⚡ Priority Processing: {hasPriorityProcessing() ? "✅" : "❌"}
            </p>
            <p>📊 Advanced Analytics: {hasAdvancedAnalytics() ? "✅" : "❌"}</p>
            <p>🔌 API Access: {hasAPIAccess() ? "✅" : "❌"}</p>
            <p>🤖 Custom Models: {canUseCustomModels() ? "✅" : "❌"}</p>
            <p>👥 Team Collaboration: {hasTeamCollaboration() ? "✅" : "❌"}</p>
          </div>
        </div>
      </div>

      {/* Feature Test Buttons */}
      <div className="grid md:grid-cols-3 gap-4">
        <UpgradeWrapper feature="exportToPDF">
          <button
            onClick={() => handleFeatureTest("exportToPDF")}
            className="w-full p-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            📄 Test PDF Export
          </button>
        </UpgradeWrapper>

        <UpgradeWrapper feature="apiAccess">
          <button
            onClick={() => handleFeatureTest("apiAccess")}
            className="w-full p-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
          >
            🔌 Test API Access
          </button>
        </UpgradeWrapper>

        <UpgradeWrapper feature="teamCollaboration">
          <button
            onClick={() => handleFeatureTest("teamCollaboration")}
            className="w-full p-4 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-colors"
          >
            👥 Test Team Features
          </button>
        </UpgradeWrapper>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          💡 How to Test:
        </h4>
        <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>Go to Settings → Billing to change your subscription tier</li>
          <li>Click "Refresh User Data" to reload your current plan</li>
          <li>Try the feature test buttons to see tier-based access control</li>
          <li>Features will be disabled/grayed out if you don't have access</li>
          <li>Check the browser console for detailed access control logs</li>
        </ul>
      </div>
    </div>
  );
}

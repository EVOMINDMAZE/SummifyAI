import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ThemeSelector } from "../components/ThemeToggle";

export default function Settings() {
  const { user, updateUserSettings } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "general" | "notifications" | "privacy" | "advanced"
  >("general");

  // Local settings state
  const [settings, setSettings] = useState({
    language: "en",
    timezone: "UTC-8",
    defaultSummaryLength: "medium",
    autoSave: true,
    notifications: {
      emailWeeklyReport: true,
      emailCreditUpdates: true,
      emailFeatureUpdates: false,
      emailMarketing: false,
      browserSummaryComplete: true,
    },
    privacy: {
      allowAnalytics: true,
      saveSearchHistory: true,
    },
    advanced: {
      developerMode: false,
      betaFeatures: false,
    },
  });

  // Load user settings on mount
  useEffect(() => {
    if (user?.settings) {
      setSettings((prev) => ({
        ...prev,
        ...user.settings,
        notifications: {
          ...prev.notifications,
          ...user.settings.notifications,
        },
        privacy: { ...prev.privacy, ...user.settings.privacy },
        advanced: { ...prev.advanced, ...user.settings.advanced },
      }));
    }
  }, [user]);

  // Handle settings updates
  const handleSettingChange = async (path: string, value: any) => {
    const keys = path.split(".");
    let newSettings = { ...settings };

    if (keys.length === 1) {
      newSettings = { ...newSettings, [keys[0]]: value };
    } else if (keys.length === 2) {
      newSettings = {
        ...newSettings,
        [keys[0]]: {
          ...newSettings[keys[0] as keyof typeof settings],
          [keys[1]]: value,
        },
      };
    }

    setSettings(newSettings);

    // Save to backend
    try {
      await updateUserSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6">
          <div className="w-16 h-16 bg-[#FFFD63] rounded-lg flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-[#0A0B1E]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Required
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access your settings.
          </p>
          <Link
            to="/signin"
            className="inline-block bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <span className="text-[#0A0B1E] font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                SummifyAI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/generate"
                className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Generate
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
              <svg
                className="w-8 h-8 text-gray-600 dark:text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Settings
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your account preferences and application settings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "general", name: "General", icon: "⚙️" },
              { id: "notifications", name: "Notifications", icon: "🔔" },
              { id: "privacy", name: "Privacy", icon: "🔒" },
              { id: "advanced", name: "Advanced", icon: "🔧" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-[#FFFD63] text-gray-900 dark:text-white"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="pb-12">
          {activeTab === "general" && (
            <div className="space-y-8">
              {/* Theme Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Appearance
                </h2>
                <ThemeSelector />
              </div>

              {/* Language & Region */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Language & Region
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Language
                    </label>
                    <select
                      value={settings.language}
                      onChange={(e) =>
                        handleSettingChange("language", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Timezone
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent">
                      <option value="UTC-8">Pacific Time (UTC-8)</option>
                      <option value="UTC-5">Eastern Time (UTC-5)</option>
                      <option value="UTC+0">GMT (UTC+0)</option>
                      <option value="UTC+1">
                        Central European Time (UTC+1)
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Default Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Default Preferences
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Summary Length
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent">
                      <option value="short">Short (150-200 words)</option>
                      <option value="medium" selected>
                        Medium (250-300 words)
                      </option>
                      <option value="long">Long (400-500 words)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Auto-save searches
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically save your search results to your library
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-8">
              {/* Email Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Email Notifications
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      title: "Weekly Summary Report",
                      description:
                        "Get a weekly digest of your activity and new features",
                      defaultChecked: true,
                    },
                    {
                      title: "Credit Updates",
                      description: "Notifications when you earn or use credits",
                      defaultChecked: true,
                    },
                    {
                      title: "New Feature Announcements",
                      description:
                        "Be the first to know about new SummifyAI features",
                      defaultChecked: false,
                    },
                    {
                      title: "Marketing Emails",
                      description: "Tips, insights, and special offers",
                      defaultChecked: false,
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {item.title}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.description}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        defaultChecked={item.defaultChecked}
                        className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 dark:border-gray-600 rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Browser Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Browser Notifications
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Summary Generation Complete
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when your AI summary is ready
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-8">
              {/* Data Privacy */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Data Privacy
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Analytics & Usage Data
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Help us improve SummifyAI by sharing anonymous usage
                        data
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Search History
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Save your search history for quick access and
                        recommendations
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Data Export */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Data Export & Deletion
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Export Your Data
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Download all your summaries, searches, and account data
                      </p>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                      Export Data
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <div>
                      <h3 className="font-medium text-red-900 dark:text-red-400">
                        Delete Account
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-500">
                        Permanently delete your account and all associated data
                      </p>
                    </div>
                    <button className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "advanced" && (
            <div className="space-y-8">
              {/* API Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  API Access
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        API Key
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Access SummifyAI programmatically
                      </p>
                    </div>
                    <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                      Generate Key
                    </button>
                  </div>
                </div>
              </div>

              {/* Developer Mode */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Developer Options
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Developer Mode
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Enable advanced features and debugging options
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Beta Features
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Get early access to new features before they're released
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

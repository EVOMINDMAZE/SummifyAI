import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ThemeSelector } from "../components/ThemeToggle";
import ThemeToggle from "@/components/ThemeToggle";
import Navigation from "../components/Navigation";
import { showNotification } from "../utils/actions";
import { sessionService, type UserSession } from "../services/sessionService";
import ProfilePhotoUpload from "../components/ProfilePhotoUpload";
import SubscriptionManagement from "../components/SubscriptionManagement";

export default function Settings() {
  const { user, updateUserSettings, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "general" | "notifications" | "privacy" | "security" | "billing"
  >("general");

  const [realSessions, setRealSessions] = useState<UserSession[]>([]);

  // Initialize settings from user data or defaults
  const [settings, setSettings] = useState(() => {
    return {
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
      security: {
        twoFactorEnabled: false,
        backupCodes: [],
        lastPasswordChange: "2024-01-15",
        activeSessions: [
          {
            id: "1",
            device: "Chrome on MacBook Pro",
            location: "San Francisco, CA",
            lastActive: "2024-01-20T10:30:00Z",
            current: true,
          },
          {
            id: "2",
            device: "Safari on iPhone",
            location: "San Francisco, CA",
            lastActive: "2024-01-19T14:20:00Z",
            current: false,
          },
        ],
        loginAlerts: true,
      },
      advanced: {
        developerMode: false,
        betaFeatures: false,
      },
    };
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

  // Load real sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      try {
        const sessions = await sessionService.getAllSessions();
        setRealSessions(sessions);
      } catch (error) {
        console.error("Failed to load sessions:", error);
      }
    };

    loadSessions();
  }, []);

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

    // Save to localStorage immediately
    localStorage.setItem("userSettings", JSON.stringify(newSettings));

    // Save to backend
    try {
      await updateUserSettings(newSettings);

      // Special handling for defaultSummaryLength - save to user profile
      if (path === "defaultSummaryLength") {
        await updateUser({ defaultSummaryLength: value });
      }

      showNotification("Settings saved successfully!", "success");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showNotification(
        "Settings saved locally. Will sync when connection is restored.",
        "info",
      );
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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navigation />

      {/* Header */}
      <div className="bg-gradient-to-br from-[#FFFD63] via-yellow-300 to-orange-300 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-[#0A0B1E] mb-6">
            ⚙️ Account Settings
          </h1>
          <p className="text-xl text-[#0A0B1E]/80 max-w-3xl mx-auto mb-8 leading-relaxed">
            Customize your SummifyAI experience. Manage preferences,
            notifications, and privacy settings to make the platform work
            perfectly for you.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "general", name: "General", icon: "⚙️" },
              { id: "billing", name: "Billing", icon: "💳" },
              { id: "notifications", name: "Notifications", icon: "🔔" },
              { id: "privacy", name: "Privacy", icon: "🔒" },
              { id: "security", name: "Security", icon: "🛡️" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-4 rounded-xl font-medium text-sm flex items-center gap-2 transition-all ${
                  activeTab === tab.id
                    ? "bg-[#FFFD63] text-[#0A0B1E] shadow-lg"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
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
              {/* Profile Information */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Profile Information
                </h2>
                <div className="grid md:grid-cols-2 gap-8 items-start">
                  <div>
                    <ProfilePhotoUpload
                      currentPhotoUrl={user?.profilePhotoUrl}
                      onPhotoUpdate={async (photoUrl) => {
                        try {
                          await updateUser({ profilePhotoUrl: photoUrl });
                        } catch (error) {
                          console.error(
                            "Failed to update profile photo:",
                            error,
                          );
                          const errorMessage =
                            error instanceof Error
                              ? error.message
                              : "Failed to update profile photo";
                          alert(errorMessage);
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        type="text"
                        value={user?.firstName || ""}
                        onChange={async (e) => {
                          try {
                            await updateUser({ firstName: e.target.value });
                          } catch (error) {
                            console.error(
                              "Failed to update first name:",
                              error,
                            );
                            const errorMessage =
                              error instanceof Error
                                ? error.message
                                : "Failed to update first name";
                            alert(errorMessage);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={user?.lastName || ""}
                        onChange={async (e) => {
                          try {
                            await updateUser({ lastName: e.target.value });
                          } catch (error) {
                            console.error("Failed to update last name:", error);
                            const errorMessage =
                              error instanceof Error
                                ? error.message
                                : "Failed to update last name";
                            alert(errorMessage);
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                        placeholder="Enter your last name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Email cannot be changed. Contact support if you need to
                        update it.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

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
                    <select
                      value={settings.timezone}
                      onChange={(e) =>
                        handleSettingChange("timezone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                    >
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
                    <select
                      value={settings.defaultSummaryLength}
                      onChange={(e) =>
                        handleSettingChange(
                          "defaultSummaryLength",
                          e.target.value,
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                    >
                      <option value="short">Short (150-200 words)</option>
                      <option value="medium">Medium (250-300 words)</option>
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
                      checked={settings.autoSave}
                      onChange={(e) =>
                        handleSettingChange("autoSave", e.target.checked)
                      }
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "billing" && <SubscriptionManagement />}

          {activeTab === "notifications" && (
            <div className="space-y-8">
              {/* Email Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Email Notifications
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Weekly Summary Report
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Get a weekly digest of your activity and new features
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailWeeklyReport}
                      onChange={(e) =>
                        handleSettingChange(
                          "notifications.emailWeeklyReport",
                          e.target.checked,
                        )
                      }
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Credit Updates
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Notifications when you earn or use credits
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailCreditUpdates}
                      onChange={(e) =>
                        handleSettingChange(
                          "notifications.emailCreditUpdates",
                          e.target.checked,
                        )
                      }
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        New Feature Announcements
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Be the first to know about new SummifyAI features
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailFeatureUpdates}
                      onChange={(e) =>
                        handleSettingChange(
                          "notifications.emailFeatureUpdates",
                          e.target.checked,
                        )
                      }
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        Marketing Emails
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Tips, insights, and special offers
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.notifications.emailMarketing}
                      onChange={(e) =>
                        handleSettingChange(
                          "notifications.emailMarketing",
                          e.target.checked,
                        )
                      }
                      className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 dark:border-gray-600 rounded"
                    />
                  </div>
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
                      checked={settings.notifications.browserSummaryComplete}
                      onChange={(e) =>
                        handleSettingChange(
                          "notifications.browserSummaryComplete",
                          e.target.checked,
                        )
                      }
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
                      checked={settings.privacy.allowAnalytics}
                      onChange={(e) =>
                        handleSettingChange(
                          "privacy.allowAnalytics",
                          e.target.checked,
                        )
                      }
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
                      checked={settings.privacy.saveSearchHistory}
                      onChange={(e) =>
                        handleSettingChange(
                          "privacy.saveSearchHistory",
                          e.target.checked,
                        )
                      }
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

          {activeTab === "security" && (
            <div className="space-y-8">
              {/* Quick Security Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  🛡️ Security Overview
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Two-Factor Authentication
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Add an extra layer of security to your account
                    </p>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        settings.security.twoFactorEnabled
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {settings.security.twoFactorEnabled
                        ? "Enabled"
                        : "Disabled"}
                    </div>
                  </div>
                  <div className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Login Alerts
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      Get notified of new sign-ins
                    </p>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        settings.security.loginAlerts
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      }`}
                    >
                      {settings.security.loginAlerts ? "Enabled" : "Disabled"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  🖥️ Active Sessions
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Manage where you're signed in. If you see an unfamiliar
                  location, you should terminate that session.
                </p>
                <div className="space-y-4">
                  {realSessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-gray-600 dark:text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {session.device}
                            </h4>
                            {session.current && (
                              <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs px-2 py-1 rounded-full">
                                Current
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {session.location} • Last active{" "}
                            {new Date(session.lastActive).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {!session.current && (
                        <button className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm transition-colors">
                          Terminate
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

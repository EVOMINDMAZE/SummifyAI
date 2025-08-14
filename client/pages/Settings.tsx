import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ThemeSelector } from "../components/ThemeToggle";
import ThemeToggle from "@/components/ThemeToggle";
import Navigation from "../components/Navigation";
import { showNotification } from "../utils/actions";
import { sessionService, type UserSession } from "../services/sessionService";
import { teamService, type TeamMember, type TeamInvitation } from "../services/teamService";

export default function Settings() {
  const { user, updateUserSettings } = useAuth();
  const [activeTab, setActiveTab] = useState<
    | "general"
    | "notifications"
    | "privacy"
    | "security"
    | "team"
    | "subscription"
  >("general");

  const [realSessions, setRealSessions] = useState<UserSession[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<TeamInvitation[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('Member');

  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem("userSettings");
    return savedSettings
      ? JSON.parse(savedSettings)
      : {
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
          team: {
            members: [
              {
                id: "1",
                email: "john.doe@example.com",
                name: "John Doe",
                role: "Admin",
                status: "Active",
                joinedAt: "2024-01-15",
                lastActive: "2024-01-20",
              },
              {
                id: "2",
                email: "jane.smith@example.com",
                name: "Jane Smith",
                role: "Member",
                status: "Active",
                joinedAt: "2024-01-18",
                lastActive: "2024-01-19",
              },
              {
                id: "3",
                email: "mike.johnson@example.com",
                name: "Mike Johnson",
                role: "Member",
                status: "Pending",
                joinedAt: "2024-01-20",
                lastActive: null,
              },
            ],
            inviteEmail: "",
            inviteRole: "Member",
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
        console.error('Failed to load sessions:', error);
      }
    };

    loadSessions();
  }, []);

  // Load team data on mount
  useEffect(() => {
    const loadTeamData = async () => {
      try {
        const [members, invitations] = await Promise.all([
          teamService.getTeamMembers(),
          teamService.getPendingInvitations()
        ]);
        setTeamMembers(members);
        setPendingInvitations(invitations);
      } catch (error) {
        console.error('Failed to load team data:', error);
      }
    };

    loadTeamData();
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
      showNotification("Settings saved successfully!", "success");
    } catch (error) {
      console.error("Failed to save settings:", error);
      showNotification(
        "Settings saved locally. Will sync when connection is restored.",
        "info",
      );
    }
  };

  // Team management functions
  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) return;

    try {
      const invitation = await teamService.inviteTeamMember(inviteEmail, inviteRole);
      const updatedInvitations = await teamService.getPendingInvitations();
      setPendingInvitations(updatedInvitations);
      setInviteEmail('');

      showNotification(`Invitation sent to ${inviteEmail}!`, 'success');
    } catch (error) {
      console.error("Failed to invite member:", error);
      showNotification("Failed to send invitation. Please try again.", 'error');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm("Are you sure you want to remove this team member?")) {
      return;
    }

    try {
      await teamService.removeTeamMember(memberId);
      const updatedMembers = await teamService.getTeamMembers();
      setTeamMembers(updatedMembers);

      showNotification("Team member removed successfully.", 'success');
    } catch (error) {
      console.error("Failed to remove member:", error);
      showNotification("Failed to remove team member. Please try again.", 'error');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: TeamMember['role']) => {
    try {
      await teamService.updateTeamMemberRole(memberId, newRole);
      const updatedMembers = await teamService.getTeamMembers();
      setTeamMembers(updatedMembers);

      showNotification("Member role updated successfully.", 'success');
    } catch (error) {
      console.error("Failed to update member role:", error);
      showNotification("Failed to update member role. Please try again.", 'error');
    }
  };

  const handleResendInvitation = async (memberId: string) => {
    try {
      // In a real app, this would resend the invitation email
      alert("Invitation resent successfully!");
    } catch (error) {
      console.error("Failed to resend invitation:", error);
      alert("Failed to resend invitation. Please try again.");
    }
  };

  // 2FA management functions
  const [totpSetup, setTotpSetup] = useState({
    isSettingUp: false,
    secret: "",
    qrCode: "",
    verificationCode: "",
    backupCodes: [] as string[],
  });

  const generateTOTPSecret = () => {
    // In a real app, this would be generated by the backend
    const secret = "JBSWY3DPEHPK3PXP"; // Base32 encoded secret
    const issuer = "SummifyIO";
    const accountName = user?.email || "user@summifyio.com";

    const qrCode = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(accountName)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;

    setTotpSetup({
      ...totpSetup,
      isSettingUp: true,
      secret,
      qrCode,
    });
  };

  const verifyTOTPCode = async () => {
    // In a real app, this would verify against the backend
    if (totpSetup.verificationCode.length === 6) {
      // Simulate successful verification
      const backupCodes = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substring(2, 8).toUpperCase(),
      );

      setSettings((prev) => ({
        ...prev,
        security: {
          ...prev.security,
          twoFactorEnabled: true,
          backupCodes,
        },
      }));

      setTotpSetup({
        ...totpSetup,
        isSettingUp: false,
        backupCodes,
      });

      alert("2FA has been successfully enabled!");
    } else {
      alert("Please enter a valid 6-digit code.");
    }
  };

  const disable2FA = async () => {
    if (
      !window.confirm(
        "Are you sure you want to disable 2FA? This will make your account less secure.",
      )
    ) {
      return;
    }

    try {
      setSettings((prev) => ({
        ...prev,
        security: {
          ...prev.security,
          twoFactorEnabled: false,
          backupCodes: [],
        },
      }));

      setTotpSetup({
        isSettingUp: false,
        secret: "",
        qrCode: "",
        verificationCode: "",
        backupCodes: [],
      });

      alert("2FA has been disabled.");
    } catch (error) {
      console.error("Failed to disable 2FA:", error);
      alert("Failed to disable 2FA. Please try again.");
    }
  };

  const regenerateBackupCodes = async () => {
    if (
      !window.confirm(
        "This will invalidate your current backup codes. Continue?",
      )
    ) {
      return;
    }

    try {
      const newBackupCodes = Array.from({ length: 8 }, () =>
        Math.random().toString(36).substring(2, 8).toUpperCase(),
      );

      setSettings((prev) => ({
        ...prev,
        security: {
          ...prev.security,
          backupCodes: newBackupCodes,
        },
      }));

      alert("New backup codes have been generated!");
    } catch (error) {
      console.error("Failed to regenerate backup codes:", error);
      alert("Failed to regenerate backup codes. Please try again.");
    }
  };

  const terminateSession = async (sessionId: string) => {
    if (!window.confirm("Are you sure you want to terminate this session?")) {
      return;
    }

    try {
      await sessionService.terminateSession(sessionId);
      const updatedSessions = await sessionService.getAllSessions();
      setRealSessions(updatedSessions);

      alert("Session terminated successfully.");
    } catch (error) {
      console.error("Failed to terminate session:", error);
      alert("Failed to terminate session. Please try again.");
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
              { id: "notifications", name: "Notifications", icon: "🔔" },
              { id: "privacy", name: "Privacy", icon: "🔒" },
              { id: "security", name: "Security", icon: "🛡️" },
              { id: "team", name: "Team", icon: "👥" },
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
              {/* Two-Factor Authentication */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      ����️ Two-Factor Authentication
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
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

                {!settings.security.twoFactorEnabled &&
                  !totpSetup.isSettingUp && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            Secure your account with 2FA
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 mb-4">
                            Two-factor authentication adds an extra layer of
                            security by requiring both your password and a
                            verification code from your phone.
                          </p>
                          <button
                            onClick={generateTOTPSecret}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                          >
                            Enable 2FA
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                {totpSetup.isSettingUp && (
                  <div className="space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Set up 2FA with your authenticator app
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                            1. Scan QR Code
                          </h4>
                          <div className="bg-white p-4 rounded-lg border">
                            <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                              <div className="text-center">
                                <div className="text-4xl mb-2">📱</div>
                                <p className="text-sm text-gray-600">QR Code</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Scan with your authenticator app
                                </p>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            Or manually enter this key:{" "}
                            <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                              {totpSetup.secret}
                            </code>
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                            2. Enter verification code
                          </h4>
                          <input
                            type="text"
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            value={totpSetup.verificationCode}
                            onChange={(e) =>
                              setTotpSetup({
                                ...totpSetup,
                                verificationCode: e.target.value.replace(
                                  /\D/g,
                                  "",
                                ),
                              })
                            }
                            className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <div className="mt-4 space-x-3">
                            <button
                              onClick={verifyTOTPCode}
                              disabled={totpSetup.verificationCode.length !== 6}
                              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              Verify & Enable
                            </button>
                            <button
                              onClick={() =>
                                setTotpSetup({
                                  ...totpSetup,
                                  isSettingUp: false,
                                })
                              }
                              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {settings.security.twoFactorEnabled && (
                  <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                            2FA is enabled ✅
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300">
                            Your account is protected with two-factor
                            authentication
                          </p>
                        </div>
                        <button
                          onClick={disable2FA}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                          Disable 2FA
                        </button>
                      </div>
                    </div>

                    {/* Backup Codes */}
                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Recovery Backup Codes
                        </h3>
                        <button
                          onClick={regenerateBackupCodes}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                        >
                          Regenerate
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Save these backup codes in a safe place. You can use
                        them to access your account if you lose your phone.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {settings.security.backupCodes.map((code, index) => (
                          <div
                            key={index}
                            className="bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono text-sm text-center"
                          >
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
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
                        <button
                          onClick={() => terminateSession(session.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm transition-colors"
                        >
                          Terminate
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Notifications */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  🔔 Security Notifications
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Login alerts
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified of new sign-ins from unrecognized devices
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={settings.security.loginAlerts}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            security: {
                              ...prev.security,
                              loginAlerts: e.target.checked,
                            },
                          }))
                        }
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Password change confirmation
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Last changed on{" "}
                        {new Date(
                          settings.security.lastPasswordChange,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "team" && (
            <div className="space-y-8">
              {/* Team Overview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      👥 Team Members
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Manage your team members and their access levels
                    </p>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-lg">
                    {teamMembers.length} members
                  </div>
                </div>

                {/* Invite New Member */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Invite New Member
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="Member">Member</option>
                        <option value="Admin">Admin</option>
                        <option value="Viewer">Viewer</option>
                      </select>
                    </div>
                    <div>
                      <button
                        onClick={handleInviteMember}
                        disabled={!inviteEmail.trim()}
                        className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                      >
                        Send Invite
                      </button>
                    </div>
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-4">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {member.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {member.name}
                            </h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${teamService.getStatusColor(member.status)}`}>
                              {member.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {member.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Joined{" "}
                            {new Date(member.joinedAt).toLocaleDateString()}{" "}
                            {member.lastActive && (
                              <>
                                • Last active{" "}
                                {new Date(
                                  member.lastActive,
                                ).toLocaleDateString()}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={member.role}
                          onChange={(e) =>
                            handleUpdateMemberRole(member.id, e.target.value)
                          }
                          disabled={member.status === "Pending"}
                          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-700"
                        >
                          <option value="Viewer">Viewer</option>
                          <option value="Member">Member</option>
                          <option value="Admin">Admin</option>
                        </select>

                        {member.status === "Pending" && (
                          <button
                            onClick={() => handleResendInvitation(member.id)}
                            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                          >
                            Resend
                          </button>
                        )}

                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Settings */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Team Settings
                </h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Auto-share discoveries
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Automatically share new chapter discoveries with team
                        members
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={true}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Team collaboration notifications
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Get notified when team members invite you to collaborate
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked={true}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Default team member role
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Set the default role for new team member invitations
                      </p>
                    </div>
                    <select
                      defaultValue="Member"
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="Viewer">Viewer</option>
                      <option value="Member">Member</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Role Permissions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Role Permissions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      👁️ Viewer
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• View shared summaries</li>
                      <li>• Access team library</li>
                      <li>• Join collaboration sessions</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      👤 Member
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• All Viewer permissions</li>
                      <li>• Create new summaries</li>
                      <li>• Share discoveries</li>
                      <li>• Start collaboration sessions</li>
                    </ul>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                      👑 Admin
                    </h3>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• All Member permissions</li>
                      <li>• Invite team members</li>
                      <li>• Manage team settings</li>
                      <li>• Remove team members</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "subscription" && (
            <div className="space-y-8">
              {/* Current Plan */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Current Plan
                  </h2>
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-medium ${
                      user.tier === "premium"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                    }`}
                  >
                    {user.tier === "premium"
                      ? "💎 Premium Plan"
                      : "🆓 Free Plan"}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Plan Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Plan Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Monthly Searches
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.tier === "premium"
                            ? "Unlimited"
                            : `${user.queriesUsed}/${user.queriesLimit}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          PDF Exports
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.tier === "premium"
                            ? "✅ Included"
                            : "❌ Upgrade Required"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Priority Support
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {user.tier === "premium"
                            ? "✅ 24/7 Support"
                            : "❌ Email Only"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Usage Stats */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                      Usage This Month
                    </h3>
                    {user.tier === "free" ? (
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            Searches Used
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {user.queriesUsed}/{user.queriesLimit}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-[#FFFD63] to-yellow-400 h-2 rounded-full transition-all"
                            style={{
                              width: `${(user.queriesUsed / user.queriesLimit) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          {user.queriesLimit - user.queriesUsed} searches
                          remaining
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Searches
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            Unlimited ��
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            PDF Exports
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            23 this month
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">
                            Priority Generations
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            5 this month
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  {user.tier === "free" ? (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Link
                        to="/pricing"
                        className="flex-1 bg-gradient-to-r from-[#FFFD63] to-yellow-400 hover:from-yellow-400 hover:to-[#FFFD63] text-[#0A0B1E] px-6 py-3 rounded-lg font-bold transition-all text-center"
                      >
                        🚀 Upgrade to Premium
                      </Link>
                      <Link
                        to="/pricing"
                        className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center"
                      >
                        Compare Plans
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        📄 View Billing History
                      </button>
                      <button
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing period.",
                            )
                          ) {
                            alert(
                              "Subscription cancelled. You'll retain access until Feb 15, 2024.",
                            );
                          }
                        }}
                        className="flex-1 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 px-6 py-3 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        ❌ Cancel Subscription
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Billing Information */}
              {user.tier === "premium" && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    💳 Billing Information
                  </h2>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Payment Method */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Payment Method
                      </h3>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded flex items-center justify-center">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M2 5c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V5zm2 0v2h16V5H4zm0 4v8h16v-8H4z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              **** **** **** 4242
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Expires 12/25
                            </div>
                          </div>
                        </div>
                        <button className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                          ���� Update Payment Method
                        </button>
                      </div>
                    </div>

                    {/* Next Billing */}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Next Billing Date
                      </h3>
                      <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                        <div className="font-medium text-gray-900 dark:text-white mb-1">
                          📅 February 15, 2024
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Premium Annual - $199.00
                        </div>
                        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                          🔄 Change Billing Cycle
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";

export default function TeamWorkspace() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "templates" | "settings"
  >("overview");

  const mockTeamMembers = [
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah@company.com",
      role: "Admin",
      summariesCreated: 23,
      lastActive: "2024-01-20",
      avatar: "SJ",
    },
    {
      id: "2",
      name: "Mike Chen",
      email: "mike@company.com",
      role: "Editor",
      summariesCreated: 18,
      lastActive: "2024-01-19",
      avatar: "MC",
    },
    {
      id: "3",
      name: "Emma Wilson",
      email: "emma@company.com",
      role: "Viewer",
      summariesCreated: 7,
      lastActive: "2024-01-18",
      avatar: "EW",
    },
  ];

  const mockTemplates = [
    {
      id: "1",
      name: "Leadership Analysis",
      description: "Standard template for leadership book summaries",
      uses: 15,
      createdBy: "Sarah Johnson",
      lastUsed: "2024-01-20",
    },
    {
      id: "2",
      name: "Technical Deep Dive",
      description: "For technology and programming books",
      uses: 8,
      createdBy: "Mike Chen",
      lastUsed: "2024-01-19",
    },
    {
      id: "3",
      name: "Business Strategy",
      description: "Business and strategy book analysis template",
      uses: 12,
      createdBy: "Sarah Johnson",
      lastUsed: "2024-01-18",
    },
  ];

  const mockRecentActivity = [
    {
      id: "1",
      action: "created",
      item: "Innovation summary",
      user: "Mike Chen",
      time: "2 hours ago",
      type: "summary",
    },
    {
      id: "2",
      action: "shared",
      item: "Leadership template",
      user: "Sarah Johnson",
      time: "4 hours ago",
      type: "template",
    },
    {
      id: "3",
      action: "joined",
      item: "workspace",
      user: "Emma Wilson",
      time: "1 day ago",
      type: "member",
    },
    {
      id: "4",
      action: "created",
      item: "Productivity summary",
      user: "Sarah Johnson",
      time: "2 days ago",
      type: "summary",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <span className="text-[#0A0B1E] font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-[#0A0B1E]">
                SummifyAI
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-[#0A0B1E] font-medium"
              >
                Back to Home
              </Link>
              <Link
                to="/signup"
                className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Create Workspace
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-pink-50 to-pink-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-black text-[#0A0B1E] mb-6">
            Team Workspace
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Collaborate with your team to create, share, and manage book
            summaries. Streamline your research process and knowledge sharing.
          </p>
        </div>
      </div>

      {/* Workspace Demo */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Workspace Header */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">TC</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#0A0B1E]">
                    Tech Company Research Team
                  </h2>
                  <p className="text-gray-600">
                    3 members • 48 summaries • Created Jan 2024
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium">
                  Invite Members
                </button>
                <button className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium">
                  New Summary
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">48</div>
                <div className="text-sm text-gray-600">Total Summaries</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">1.2k</div>
                <div className="text-sm text-gray-600">Views This Month</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">156</div>
                <div className="text-sm text-gray-600">Affiliate Clicks</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">$234</div>
                <div className="text-sm text-gray-600">Team Earnings</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "overview"
                    ? "border-[#FFFD63] text-[#0A0B1E]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("members")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "members"
                    ? "border-[#FFFD63] text-[#0A0B1E]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Team Members
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "templates"
                    ? "border-[#FFFD63] text-[#0A0B1E]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "settings"
                    ? "border-[#FFFD63] text-[#0A0B1E]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Settings
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Recent Activity */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#0A0B1E] mb-6">
                  Recent Activity
                </h3>
                <div className="space-y-4">
                  {mockRecentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === "summary"
                            ? "bg-blue-100 text-blue-600"
                            : activity.type === "template"
                              ? "bg-green-100 text-green-600"
                              : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {activity.type === "summary" ? (
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        ) : activity.type === "template" ? (
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
                              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            />
                          </svg>
                        ) : (
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
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-[#0A0B1E]">
                          <span className="font-medium">{activity.user}</span>{" "}
                          {activity.action}{" "}
                          <span className="font-medium">{activity.item}</span>
                        </p>
                        <p className="text-sm text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Performance */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#0A0B1E] mb-6">
                    Top Contributors
                  </h3>
                  <div className="space-y-4">
                    {mockTeamMembers
                      .sort((a, b) => b.summariesCreated - a.summariesCreated)
                      .map((member, index) => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-[#FFFD63] rounded-full flex items-center justify-center font-medium text-sm">
                              {index + 1}
                            </div>
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-medium">
                              {member.avatar}
                            </div>
                            <div>
                              <div className="font-medium text-[#0A0B1E]">
                                {member.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {member.role}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#0A0B1E]">
                              {member.summariesCreated}
                            </div>
                            <div className="text-sm text-gray-600">
                              summaries
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-[#0A0B1E] mb-6">
                    Popular Templates
                  </h3>
                  <div className="space-y-4">
                    {mockTemplates
                      .sort((a, b) => b.uses - a.uses)
                      .map((template, index) => (
                        <div
                          key={template.id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <svg
                                className="w-4 h-4 text-blue-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                                />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-[#0A0B1E]">
                                {template.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                by {template.createdBy}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-[#0A0B1E]">
                              {template.uses}
                            </div>
                            <div className="text-sm text-gray-600">uses</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#0A0B1E]">
                  Team Members
                </h2>
                <button className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium">
                  Invite Member
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-medium text-[#0A0B1E]">
                        Member
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-[#0A0B1E]">
                        Role
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-[#0A0B1E]">
                        Summaries
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-[#0A0B1E]">
                        Last Active
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-[#0A0B1E]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {mockTeamMembers.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-medium">
                              {member.avatar}
                            </div>
                            <div>
                              <div className="font-medium text-[#0A0B1E]">
                                {member.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {member.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              member.role === "Admin"
                                ? "bg-red-100 text-red-800"
                                : member.role === "Editor"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {member.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-[#0A0B1E] font-medium">
                          {member.summariesCreated}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {new Date(member.lastActive).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <button className="text-gray-400 hover:text-gray-600">
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
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[#0A0B1E]">
                  Shared Templates
                </h2>
                <button className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium">
                  Create Template
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-blue-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                          />
                        </svg>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {template.uses} uses
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-[#0A0B1E] mb-2">
                      {template.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">
                        by {template.createdBy}
                      </span>
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-[#0A0B1E]">
                Workspace Settings
              </h2>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#0A0B1E] mb-4">
                    General Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Workspace Name
                      </label>
                      <input
                        type="text"
                        value="Tech Company Research Team"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        rows={3}
                        value="Collaborative research workspace for tech industry insights"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FFFD63] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-[#0A0B1E] mb-4">
                    Permissions
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-[#0A0B1E]">
                          Public Summaries
                        </div>
                        <div className="text-sm text-gray-600">
                          Allow members to create public summaries
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked
                        className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-[#0A0B1E]">
                          Template Sharing
                        </div>
                        <div className="text-sm text-gray-600">
                          Allow sharing templates outside workspace
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 rounded"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-[#0A0B1E]">
                          Affiliate Tracking
                        </div>
                        <div className="text-sm text-gray-600">
                          Track affiliate earnings for team summaries
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked
                        className="h-4 w-4 text-[#FFFD63] focus:ring-[#FFFD63] border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-red-800 mb-2">
                  Danger Zone
                </h3>
                <p className="text-red-700 mb-4">
                  Permanently delete this workspace and all its data. This
                  action cannot be undone.
                </p>
                <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium">
                  Delete Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#0A0B1E] mb-4">
              Why Teams Love SummifyAI Workspaces
            </h2>
            <p className="text-gray-600 text-lg">
              Everything your team needs to collaborate effectively
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: "👥",
                title: "Team Collaboration",
                description:
                  "Work together on summaries, share insights, and build a collective knowledge base.",
              },
              {
                icon: "📋",
                title: "Shared Templates",
                description:
                  "Create reusable templates for consistent analysis across your team's research.",
              },
              {
                icon: "📊",
                title: "Team Analytics",
                description:
                  "Track team performance, popular topics, and collective affiliate earnings.",
              },
              {
                icon: "🔒",
                title: "Access Control",
                description:
                  "Manage who can view, edit, and share summaries with granular permissions.",
              },
              {
                icon: "💰",
                title: "Shared Earnings",
                description:
                  "Split affiliate commissions fairly among team members based on contributions.",
              },
              {
                icon: "🔄",
                title: "Version History",
                description:
                  "Track changes to summaries and revert to previous versions when needed.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg text-[#0A0B1E] mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#0A0B1E] text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to collaborate with your team?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Create a workspace and start building your team's knowledge base
            together.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-[#FFFD63] text-[#0A0B1E] px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-colors"
          >
            Create Your Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  freeUsers: number;
  totalSummaries: number;
  summariesToday: number;
  totalRevenue: number;
  monthlyRevenue: number;
  affiliateEarnings: number;
  conversionRate: number;
  avgSessionTime: string;
  supportTickets: number;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  tier: "free" | "premium";
  queriesUsed: number;
  queriesLimit: number;
  affiliateEarnings: number;
  createdAt: string;
  lastActive: string;
  status: "active" | "inactive" | "suspended";
  totalSpent: number;
}

interface SystemAlert {
  id: string;
  type: "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "analytics" | "revenue" | "system" | "support"
  >("overview");
  const [userFilter, setUserFilter] = useState<
    "all" | "free" | "premium" | "active" | "inactive"
  >("all");
  const [dateRange, setDateRange] = useState("7d");

  // Check admin access
  useEffect(() => {
    if (!user || user.email !== "admin@summifyai.com") {
      // In a real app, check proper admin permissions
      console.warn("Unauthorized admin access attempt");
    }
  }, [user]);

  // Mock comprehensive admin data
  const stats: AdminStats = {
    totalUsers: 2847,
    activeUsers: 1932,
    premiumUsers: 429,
    freeUsers: 2418,
    totalSummaries: 15847,
    summariesToday: 234,
    totalRevenue: 34567.89,
    monthlyRevenue: 8932.45,
    affiliateEarnings: 6724.33,
    conversionRate: 15.1,
    avgSessionTime: "12m 34s",
    supportTickets: 23,
  };

  const mockUsers: UserData[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      tier: "premium",
      queriesUsed: 45,
      queriesLimit: 1000,
      affiliateEarnings: 267.89,
      createdAt: "2024-01-15",
      lastActive: "2024-01-20",
      status: "active",
      totalSpent: 239.88,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah@company.com",
      tier: "free",
      queriesUsed: 8,
      queriesLimit: 10,
      affiliateEarnings: 12.45,
      createdAt: "2024-01-18",
      lastActive: "2024-01-19",
      status: "active",
      totalSpent: 0,
    },
    {
      id: "3",
      name: "Mike Chen",
      email: "mike@startup.io",
      tier: "premium",
      queriesUsed: 178,
      queriesLimit: 1000,
      affiliateEarnings: 445.67,
      createdAt: "2023-12-05",
      lastActive: "2024-01-20",
      status: "active",
      totalSpent: 479.76,
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily@consultant.com",
      tier: "free",
      queriesUsed: 10,
      queriesLimit: 10,
      affiliateEarnings: 0,
      createdAt: "2024-01-19",
      lastActive: "2024-01-19",
      status: "inactive",
      totalSpent: 0,
    },
  ];

  const revenueData = [
    { month: "Jul", revenue: 15420, users: 1205, conversions: 45 },
    { month: "Aug", revenue: 18950, users: 1456, conversions: 62 },
    { month: "Sep", revenue: 22340, users: 1723, conversions: 78 },
    { month: "Oct", revenue: 26780, users: 2048, conversions: 89 },
    { month: "Nov", revenue: 31250, users: 2367, conversions: 95 },
    { month: "Dec", revenue: 34120, users: 2654, conversions: 108 },
    { month: "Jan", revenue: 34568, users: 2847, conversions: 115 },
  ];

  const usageData = [
    { day: "Mon", free: 420, premium: 180 },
    { day: "Tue", free: 380, premium: 210 },
    { day: "Wed", free: 445, premium: 195 },
    { day: "Thu", free: 520, premium: 240 },
    { day: "Fri", free: 380, premium: 185 },
    { day: "Sat", free: 280, premium: 145 },
    { day: "Sun", free: 320, premium: 165 },
  ];

  const topicsData = [
    { name: "Leadership", value: 1247, color: "#4361EE" },
    { name: "Productivity", value: 932, color: "#7B2CBF" },
    { name: "Marketing", value: 756, color: "#FFFD63" },
    { name: "Communication", value: 623, color: "#06FFA5" },
    { name: "Finance", value: 445, color: "#FB8500" },
  ];

  const systemAlerts: SystemAlert[] = [
    {
      id: "1",
      type: "warning",
      title: "High Server Load",
      message: "API response time increased by 15% in the last hour",
      timestamp: "2024-01-20T15:30:00Z",
      resolved: false,
    },
    {
      id: "2",
      type: "info",
      title: "Scheduled Maintenance",
      message: "Database optimization scheduled for tonight at 2 AM EST",
      timestamp: "2024-01-20T10:00:00Z",
      resolved: false,
    },
    {
      id: "3",
      type: "error",
      title: "Payment Processing Issue",
      message: "Stripe webhook failed for 3 transactions",
      timestamp: "2024-01-20T14:45:00Z",
      resolved: true,
    },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const filteredUsers = mockUsers.filter((user) => {
    switch (userFilter) {
      case "free":
        return user.tier === "free";
      case "premium":
        return user.tier === "premium";
      case "active":
        return user.status === "active";
      case "inactive":
        return user.status === "inactive";
      default:
        return true;
    }
  });

  const handleUserAction = (
    userId: string,
    action: "suspend" | "activate" | "delete",
  ) => {
    // In a real app, this would make API calls
    alert(`${action.charAt(0).toUpperCase() + action.slice(1)} user ${userId}`);
  };

  if (!user || user.email !== "admin@summifyai.com") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600 mb-4">
            You don't have permission to access this page.
          </p>
          <Link
            to="/"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                  <span className="text-[#0A0B1E] font-bold text-lg">S</span>
                </div>
                <span className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
                  SummifyAI Admin
                </span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Welcome, {user.email}
              </span>
              <Link
                to="/dashboard"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                User Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Monitor user activity, revenue, system performance, and manage the
            platform
          </p>
        </div>

        {/* System Alerts */}
        {systemAlerts.filter((alert) => !alert.resolved).length > 0 && (
          <div className="mb-8">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <svg
                  className="w-5 h-5 text-red-500 mr-2"
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
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {systemAlerts.filter((alert) => !alert.resolved).length}{" "}
                  Active System Alerts
                </h3>
              </div>
              {systemAlerts
                .filter((alert) => !alert.resolved)
                .slice(0, 2)
                .map((alert) => (
                  <p
                    key={alert.id}
                    className="text-sm text-red-700 dark:text-red-300"
                  >
                    • {alert.title}: {alert.message}
                  </p>
                ))}
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "overview", name: "Overview", icon: "📊" },
              { id: "users", name: "Users", icon: "👥" },
              { id: "analytics", name: "Analytics", icon: "📈" },
              { id: "revenue", name: "Revenue", icon: "💰" },
              { id: "system", name: "System", icon: "⚙️" },
              { id: "support", name: "Support", icon: "🎧" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-[#4361EE] text-[#4361EE] dark:text-[#FFFD63] dark:border-[#FFFD63]"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Key Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
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
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Users
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.totalUsers.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      +12% from last month
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Monthly Revenue
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      ${stats.monthlyRevenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      +18% from last month
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <svg
                      className="w-6 h-6 text-purple-600 dark:text-purple-400"
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
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Summaries Today
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.summariesToday}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      +5% from yesterday
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <svg
                      className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Conversion Rate
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {stats.conversionRate}%
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      +2.1% from last month
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Revenue Growth
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4361EE"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#4361EE"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#4361EE"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Popular Topics
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={topicsData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {topicsData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="space-y-6">
            {/* User Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  User Management
                </h3>
                <div className="flex gap-2">
                  {["all", "free", "premium", "active", "inactive"].map(
                    (filter) => (
                      <button
                        key={filter}
                        onClick={() => setUserFilter(filter as any)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          userFilter === filter
                            ? "bg-[#4361EE] text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              Joined{" "}
                              {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.tier === "premium"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            }`}
                          >
                            {user.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {user.queriesUsed}/
                          {user.tier === "premium" ? "∞" : user.queriesLimit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          ${user.totalSpent.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() =>
                              handleUserAction(
                                user.id,
                                user.status === "active"
                                  ? "suspend"
                                  : "activate",
                              )
                            }
                            className={`px-3 py-1 rounded text-xs ${
                              user.status === "active"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                                : "bg-green-100 text-green-800 hover:bg-green-200"
                            }`}
                          >
                            {user.status === "active" ? "Suspend" : "Activate"}
                          </button>
                          <button
                            onClick={() => handleUserAction(user.id, "delete")}
                            className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Daily Usage
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={usageData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="free"
                      stackId="a"
                      fill="#94A3B8"
                      name="Free Users"
                    />
                    <Bar
                      dataKey="premium"
                      stackId="a"
                      fill="#4361EE"
                      name="Premium Users"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  User Growth
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#4361EE"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Revenue Tab */}
        {activeTab === "revenue" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Total Revenue
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  ${stats.totalRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  All time
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Monthly Revenue
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  ${stats.monthlyRevenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  This month
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Affiliate Earnings
                </h3>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  ${stats.affiliateEarnings.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Total paid out
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Revenue Trends
              </h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#4361EE" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#4361EE" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#4361EE"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === "system" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Server Status
                </h3>
                <div className="flex items-center mt-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Operational
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  API Response
                </h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                  156ms
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Database
                </h3>
                <div className="flex items-center mt-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    Connected
                  </span>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Sessions
                </h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
                  1,247
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                System Alerts
              </h3>
              <div className="space-y-4">
                {systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${
                      alert.type === "error"
                        ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20"
                        : alert.type === "warning"
                          ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20"
                          : "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4
                          className={`font-medium ${
                            alert.type === "error"
                              ? "text-red-800 dark:text-red-200"
                              : alert.type === "warning"
                                ? "text-yellow-800 dark:text-yellow-200"
                                : "text-blue-800 dark:text-blue-200"
                          }`}
                        >
                          {alert.title}
                        </h4>
                        <p
                          className={`text-sm ${
                            alert.type === "error"
                              ? "text-red-700 dark:text-red-300"
                              : alert.type === "warning"
                                ? "text-yellow-700 dark:text-yellow-300"
                                : "text-blue-700 dark:text-blue-300"
                          }`}
                        >
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.resolved && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Resolved
                          </span>
                        )}
                        {!alert.resolved && (
                          <button className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs rounded">
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === "support" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Support Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.supportTickets}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Open Tickets
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    2.1h
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Response Time
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                    94%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Customer Satisfaction
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Support Tickets
                </h3>
                <button className="bg-[#4361EE] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#4361EE]/90">
                  View All Tickets
                </button>
              </div>
              <div className="space-y-4">
                {[
                  {
                    id: "#1247",
                    user: "john@example.com",
                    subject: "PDF export not working",
                    priority: "high",
                    status: "open",
                  },
                  {
                    id: "#1246",
                    user: "sarah@company.com",
                    subject: "Billing question about premium plan",
                    priority: "medium",
                    status: "in_progress",
                  },
                  {
                    id: "#1245",
                    user: "mike@startup.io",
                    subject: "Feature request: API rate limits",
                    priority: "low",
                    status: "closed",
                  },
                ].map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {ticket.id}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            ticket.priority === "high"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : ticket.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {ticket.subject}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {ticket.user}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        ticket.status === "open"
                          ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                          : ticket.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      }`}
                    >
                      {ticket.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

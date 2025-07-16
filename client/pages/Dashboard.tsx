import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
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

interface Summary {
  id: string;
  topic: string;
  createdAt: string;
  books: Array<{
    title: string;
    author: string;
    cover: string;
    amazonLink: string;
  }>;
  summary: string;
  quotes: string[];
}

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWidget {
  id: string;
  title: string;
  component: React.ReactNode;
  defaultProps: {
    w: number;
    h: number;
    x: number;
    y: number;
    minW?: number;
    minH?: number;
  };
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [layouts, setLayouts] = useState({});
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const [compactType, setCompactType] = useState<
    "vertical" | "horizontal" | null
  >("vertical");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "topic" | "books">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterByBooks, setFilterByBooks] = useState<string>("");

  // Mock data - replace with real data
  const recentSummaries: Summary[] = [
    {
      id: "1",
      topic: "Leadership Excellence",
      createdAt: "2024-01-15T10:30:00Z",
      books: [
        {
          title: "Good to Great",
          author: "Jim Collins",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0066620996.01.L.jpg",
          amazonLink: "#",
        },
        {
          title: "The 7 Habits of Highly Effective People",
          author: "Stephen Covey",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/0743269519.01.L.jpg",
          amazonLink: "#",
        },
        {
          title: "Leaders Eat Last",
          author: "Simon Sinek",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1591845327.01.L.jpg",
          amazonLink: "#",
        },
      ],
      summary:
        "Leadership excellence emerges from the intersection of humility and determination...",
      quotes: [
        "Level 5 leaders channel their ego needs away from themselves...",
        "Begin with the end in mind.",
        "Great leaders sacrifice their own interests for the good of those in their care.",
      ],
    },
    {
      id: "2",
      topic: "Productivity & Focus",
      createdAt: "2024-01-12T14:20:00Z",
      books: [
        {
          title: "Deep Work",
          author: "Cal Newport",
          cover:
            "https://images-na.ssl-images-amazon.com/images/P/1455586692.01.L.jpg",
          amazonLink: "#",
        },
      ],
      summary:
        "Deep work represents the ability to focus without distraction on cognitively demanding tasks...",
      quotes: [
        "Human beings, it seems, are at their best when immersed deeply in something challenging.",
      ],
    },
  ];

  const affiliateEarnings = {
    thisMonth: 247.85,
    total: 1568.4,
    clicks: 142,
    conversions: 18,
  };

  // Mock analytics data
  const earningsData = [
    { month: "Jan", earnings: 120, clicks: 89, conversions: 12 },
    { month: "Feb", earnings: 180, clicks: 105, conversions: 15 },
    { month: "Mar", earnings: 210, clicks: 134, conversions: 18 },
    { month: "Apr", earnings: 190, clicks: 118, conversions: 16 },
    { month: "May", earnings: 230, clicks: 156, conversions: 22 },
    { month: "Jun", earnings: 248, clicks: 142, conversions: 18 },
  ];

  const topicsData = [
    { name: "Leadership", searches: 45, color: "#4361EE" },
    { name: "Productivity", searches: 38, color: "#7B2CBF" },
    { name: "Finance", searches: 32, color: "#FFFD63" },
    { name: "Health", searches: 28, color: "#F72585" },
    { name: "Technology", searches: 25, color: "#4CC9F0" },
  ];

  const activityData = [
    { day: "Mon", searches: 8, summaries: 6 },
    { day: "Tue", searches: 12, summaries: 9 },
    { day: "Wed", searches: 15, summaries: 11 },
    { day: "Thu", searches: 10, summaries: 8 },
    { day: "Fri", searches: 18, summaries: 14 },
    { day: "Sat", searches: 5, summaries: 4 },
    { day: "Sun", searches: 7, summaries: 5 },
  ];

  const topBooksData = [
    { title: "Atomic Habits", sales: 42, author: "James Clear" },
    { title: "Think and Grow Rich", sales: 38, author: "Napoleon Hill" },
    { title: "The 7 Habits", sales: 35, author: "Stephen Covey" },
    { title: "Good to Great", sales: 31, author: "Jim Collins" },
    { title: "Leaders Eat Last", sales: 28, author: "Simon Sinek" },
  ];

  const performanceData = [
    { metric: "Click Rate", value: 12.7, target: 15 },
    { metric: "Conversion Rate", value: 8.4, target: 10 },
    { metric: "Revenue/Click", value: 1.74, target: 2.0 },
    { metric: "Avg Session", value: 4.2, target: 5.0 },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Filter and sort summaries
  const filteredAndSortedSummaries = () => {
    let filtered = recentSummaries;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (summary) =>
          summary.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
          summary.books.some(
            (book) =>
              book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              book.author.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
      );
    }

    // Apply book filter
    if (filterByBooks) {
      filtered = filtered.filter((summary) =>
        summary.books.some((book) =>
          book.title.toLowerCase().includes(filterByBooks.toLowerCase()),
        ),
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "topic":
          comparison = a.topic.localeCompare(b.topic);
          break;
        case "books":
          comparison = a.books.length - b.books.length;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    return filtered;
  };

  const getUniqueBooks = () => {
    const allBooks = recentSummaries.flatMap((summary) => summary.books);
    const uniqueBooks = Array.from(new Set(allBooks.map((book) => book.title)));
    return uniqueBooks.sort();
  };

  // Widget definitions
  const generateWidgets = (): DashboardWidget[] => [
    {
      id: "searches",
      title: "Searches",
      defaultProps: { w: 1, h: 2, x: 0, y: 0, minW: 1, minH: 2 },
      component: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow h-full">
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Searches
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.queriesUsed || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {user?.tier === "premium"
                  ? "Unlimited"
                  : `${(user?.queriesLimit || 10) - (user?.queriesUsed || 0)} remaining`}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "monthly",
      title: "Monthly Earnings",
      defaultProps: { w: 1, h: 2, x: 1, y: 0, minW: 1, minH: 2 },
      component: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow h-full">
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                This Month
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                ${affiliateEarnings.thisMonth}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                +{((affiliateEarnings.thisMonth / 200) * 100).toFixed(0)}% vs
                last month
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
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
          </div>
        </div>
      ),
    },
    {
      id: "total",
      title: "Total Earnings",
      defaultProps: { w: 1, h: 2, x: 2, y: 0, minW: 1, minH: 2 },
      component: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow h-full">
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Earned
              </p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                ${affiliateEarnings.total}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                {affiliateEarnings.conversions} conversions
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "trending",
      title: "Top Trending",
      defaultProps: { w: 1, h: 2, x: 3, y: 0, minW: 1, minH: 2 },
      component: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow h-full">
          <div className="flex items-center justify-between h-full">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Top Trending
              </p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                Leadership
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                +247% searches
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600 dark:text-orange-400"
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
          </div>
        </div>
      ),
    },
    {
      id: "earnings-chart",
      title: "Earnings Trend",
      defaultProps: { w: 2, h: 3, x: 0, y: 2, minW: 2, minH: 3 },
      component: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 h-full">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            📈 Earnings Trend
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <AreaChart data={earningsData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4361EE" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4361EE" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                stroke="#666"
                axisLine={false}
                type="category"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                stroke="#666"
                axisLine={false}
                type="number"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                }}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#4361EE"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ),
    },
    {
      id: "top-books",
      title: "Top Converting Books",
      defaultProps: { w: 2, h: 3, x: 2, y: 2, minW: 2, minH: 3 },
      component: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 h-full">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            📚 Top Converting Books
          </h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={topBooksData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis
                dataKey="title"
                tick={{ fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={80}
                tickLine={false}
                axisLine={false}
                type="category"
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                stroke="#666"
                axisLine={false}
                type="number"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                }}
              />
              <Bar dataKey="sales" fill="#7B2CBF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ),
    },
    {
      id: "recent-summaries",
      title: "Recent Chapter Discoveries",
      defaultProps: { w: 4, h: 4, x: 0, y: 5, minW: 3, minH: 3 },
      component: (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 h-full flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              📖 Recent Chapter Discoveries
            </h3>
            <span className="text-xs text-gray-500">
              {filteredAndSortedSummaries().length} results
            </span>
          </div>

          {/* Compact Filters */}
          <div className="mb-4 space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search topics or books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-1 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "date" | "topic" | "books")
                }
                className="px-2 py-1 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="date">Date</option>
                <option value="topic">Topic</option>
                <option value="books">Books</option>
              </select>
              <button
                onClick={() =>
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                }
                className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500"
              >
                {sortOrder === "asc" ? "↑" : "↓"}
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto">
            {filteredAndSortedSummaries()
              .slice(0, 5)
              .map((summary) => (
                <div
                  key={summary.id}
                  className="border-l-4 border-[#4361EE] pl-4 py-2"
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {summary.topic}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {new Date(summary.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {summary.books.slice(0, 2).map((book, index) => (
                      <span
                        key={index}
                        className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded"
                      >
                        {book.title}
                      </span>
                    ))}
                    {summary.books.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{summary.books.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            {filteredAndSortedSummaries().length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p className="text-sm">No summaries found</p>
                <p className="text-xs">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  const widgets = generateWidgets();

  // Default layouts for different breakpoints
  const getDefaultLayouts = () => {
    const layouts: any = {};
    ["lg", "md", "sm", "xs", "xxs"].forEach((breakpoint) => {
      layouts[breakpoint] = widgets.map((widget) => ({
        i: widget.id,
        ...widget.defaultProps,
      }));
    });
    return layouts;
  };

  // Load saved layouts from localStorage or use defaults
  useEffect(() => {
    const savedLayouts = localStorage.getItem("dashboard-layouts");
    if (savedLayouts) {
      setLayouts(JSON.parse(savedLayouts));
    } else {
      setLayouts(getDefaultLayouts());
    }
  }, []);

  const onLayoutChange = (layout: any, layouts: any) => {
    setLayouts(layouts);
    localStorage.setItem("dashboard-layouts", JSON.stringify(layouts));
  };

  const onBreakpointChange = (breakpoint: string) => {
    setCurrentBreakpoint(breakpoint);
  };

  const resetLayouts = () => {
    const defaultLayouts = getDefaultLayouts();
    setLayouts(defaultLayouts);
    localStorage.setItem("dashboard-layouts", JSON.stringify(defaultLayouts));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              className="w-10 h-10 text-white"
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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Please sign in to access your premium dashboard
          </p>
          <Link
            to="/signin"
            className="bg-gradient-to-r from-[#FFFD63] to-[#FFE066] hover:from-[#FFE066] hover:to-[#FFFD63] text-[#0A0B1E] px-8 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Sign In to Continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Premium Navigation */}
      <nav className="bg-[#FFFD63] dark:bg-gray-900 relative z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center group">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FFFD63] to-[#FFE066] rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                  <span className="text-[#0A0B1E] font-bold text-xl">S</span>
                </div>
                <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-[#0A0B1E] to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  SummifyAI
                </span>
              </Link>
              <div className="hidden lg:ml-10 lg:flex lg:space-x-1">
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg"
                >
                  Dashboard
                </Link>
                <Link
                  to="/generate"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Generate
                </Link>
                <Link
                  to="/results"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Library
                </Link>
                <Link
                  to="/support"
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  Support
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <ThemeToggle />

              {/* Premium User Profile */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-2 hover:shadow-lg transition-all"
                >
                  <div className="w-10 h-10 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {user.tier} Member
                    </div>
                  </div>
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    <div className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] p-6 text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-bold">{user.name}</div>
                          <div className="text-white/80 text-sm">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-2">
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <svg
                          className="w-5 h-5 text-gray-500"
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
                        <span className="text-gray-700 dark:text-gray-300">
                          Settings
                        </span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600 dark:text-red-400"
                      >
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
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-3xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-white/80 text-lg">
                Ready to discover exact chapters and pages? Let's find precisely
                what you need to learn.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/generate"
                  className="bg-[#FFFD63] hover:bg-[#FFE066] text-[#0A0B1E] px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Find New Chapters
                </Link>
                <Link
                  to="/results"
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-2xl font-medium transition-all border border-white/30 flex items-center justify-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  View Library
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Customization Controls */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Dashboard Analytics
            </h2>
            <button
              onClick={() => setIsCustomizing(!isCustomizing)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isCustomizing
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              {isCustomizing ? "✅ Save Layout" : "⚙️ Customize"}
            </button>
            {isCustomizing && (
              <button
                onClick={resetLayouts}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all"
              >
                🔄 Reset
              </button>
            )}
          </div>
          {isCustomizing && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              💡 Drag and resize widgets to customize your dashboard
            </div>
          )}
        </div>

        {/* Customizable Dashboard Grid */}
        <div className="mb-8">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={onLayoutChange}
            onBreakpointChange={onBreakpointChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 4, md: 3, sm: 2, xs: 1, xxs: 1 }}
            rowHeight={80}
            isDraggable={isCustomizing}
            isResizable={isCustomizing}
            compactType={compactType}
            preventCollision={false}
            margin={[16, 16]}
            containerPadding={[0, 0]}
          >
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className={isCustomizing ? "cursor-move" : ""}
              >
                {widget.component}
                {isCustomizing && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded opacity-75">
                    {widget.title}
                  </div>
                )}
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>

        {/* Premium Stats Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          style={{ display: "none" }}
        >
          {/* Summaries Generated */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Searches
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.queriesUsed || 0}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {user?.tier === "premium"
                    ? "Unlimited"
                    : `${(user?.queriesLimit || 10) - (user?.queriesUsed || 0)} remaining`}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Monthly Earnings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  This Month
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${affiliateEarnings.thisMonth}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  +{((affiliateEarnings.thisMonth / 200) * 100).toFixed(0)}% vs
                  last month
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
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
            </div>
          </div>

          {/* Total Earnings */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Earned
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  ${affiliateEarnings.total}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {affiliateEarnings.conversions} conversions
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
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
                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Performance */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Click Rate
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {(
                    (affiliateEarnings.conversions / affiliateEarnings.clicks) *
                    100
                  ).toFixed(1)}
                  %
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {affiliateEarnings.clicks} total clicks
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600 dark:text-orange-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Earnings Trend Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Earnings Trend
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monthly performance overview
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-[#4361EE] rounded-full"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Earnings
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={earningsData}>
                <defs>
                  <linearGradient
                    id="earningsGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#4361EE" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4361EE" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  horizontal={true}
                  vertical={true}
                />
                <XAxis
                  dataKey="month"
                  stroke="#6b7280"
                  fontSize={12}
                  axisLine={true}
                  tickLine={true}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  axisLine={true}
                  tickLine={true}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  formatter={(value) => [`$${value}`, "Earnings"]}
                  animationDuration={200}
                  isAnimationActive={true}
                />
                <Area
                  type="monotone"
                  dataKey="earnings"
                  stroke="#4361EE"
                  fillOpacity={1}
                  fill="url(#earningsGradient)"
                  strokeWidth={3}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Top Topics Pie Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Popular Topics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your most searched subjects
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topicsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="searches"
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  {topicsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  formatter={(value) => [`${value} searches`, "Total"]}
                  animationDuration={200}
                  isAnimationActive={true}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px" }}
                  align="center"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Weekly Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Weekly Activity
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Searches vs summaries generated
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#4361EE] rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Searches
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-[#FFFD63] rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Summaries
                  </span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  horizontal={true}
                  vertical={true}
                />
                <XAxis
                  dataKey="day"
                  stroke="#6b7280"
                  fontSize={12}
                  axisLine={true}
                  tickLine={true}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={12}
                  axisLine={true}
                  tickLine={true}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "12px",
                    color: "#fff",
                  }}
                  animationDuration={200}
                  isAnimationActive={true}
                />
                <Bar
                  dataKey="searches"
                  fill="#4361EE"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                <Bar
                  dataKey="summaries"
                  fill="#FFFD63"
                  radius={[4, 4, 0, 0]}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Performance Metrics
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Key performance indicators
                </p>
              </div>
            </div>
            <div className="space-y-6">
              {performanceData.map((item, index) => {
                const percentage = (item.value / item.target) * 100;
                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.metric}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {item.value}
                        {item.metric.includes("Rate")
                          ? "%"
                          : item.metric.includes("Revenue")
                            ? "$"
                            : "min"}{" "}
                        / {item.target}
                        {item.metric.includes("Rate")
                          ? "%"
                          : item.metric.includes("Revenue")
                            ? "$"
                            : "min"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          percentage >= 80
                            ? "bg-green-500"
                            : percentage >= 60
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Summaries */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Chapter Discoveries
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your latest chapter findings and targeted insights (
                  {filteredAndSortedSummaries().length} results)
                </p>
              </div>
              <Link
                to="/results"
                className="bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg transition-all"
              >
                View All
              </Link>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Search topics, books, or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-[#4361EE] focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={filterByBooks}
                  onChange={(e) => setFilterByBooks(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4361EE] focus:border-transparent"
                >
                  <option value="">All Books</option>
                  {getUniqueBooks().map((bookTitle) => (
                    <option key={bookTitle} value={bookTitle}>
                      {bookTitle}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "date" | "topic" | "books")
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#4361EE] focus:border-transparent"
                >
                  <option value="date">Date</option>
                  <option value="topic">Topic</option>
                  <option value="books">Books</option>
                </select>
                <button
                  onClick={() =>
                    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                  }
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors font-medium"
                  title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
                >
                  {sortOrder === "asc" ? "↑" : "↓"}
                </button>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedSummaries().length > 0 ? (
              filteredAndSortedSummaries().map((summary) => (
                <div
                  key={summary.id}
                  className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-2xl flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {summary.topic.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {summary.topic}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {new Date(summary.createdAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            },
                          )}{" "}
                          • {summary.books.length} books analyzed
                        </p>
                        <div className="flex -space-x-2">
                          {summary.books.slice(0, 3).map((book, index) => (
                            <img
                              key={index}
                              src={book.cover}
                              alt={book.title}
                              className="w-8 h-10 rounded border-2 border-white dark:border-gray-800 object-cover"
                            />
                          ))}
                          {summary.books.length > 3 && (
                            <div className="w-8 h-10 bg-gray-200 dark:bg-gray-600 rounded border-2 border-white dark:border-gray-800 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                +{summary.books.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Link
                        to={`/results/${summary.id}`}
                        className="bg-[#FFFD63] hover:bg-[#FFE066] text-[#0A0B1E] px-4 py-2 rounded-xl font-medium transition-colors"
                      >
                        View Summary
                      </Link>
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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
                            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-r from-[#4361EE] to-[#7B2CBF] rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        recentSummaries.length === 0
                          ? "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          : "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      }
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {recentSummaries.length === 0
                    ? "Ready to start your journey?"
                    : "No results found"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  {recentSummaries.length === 0
                    ? "Generate your first book summary and unlock the power of comparative analysis. Discover insights from multiple perspectives in minutes."
                    : "No summaries match your current search criteria. Try adjusting your filters or search terms."}
                </p>
                {recentSummaries.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterByBooks("");
                      setSortBy("date");
                      setSortOrder("desc");
                    }}
                    className="inline-flex items-center px-4 py-2 bg-[#4361EE] hover:bg-[#4361EE]/90 text-white rounded-lg font-medium transition-colors mr-4"
                  >
                    🔄 Clear Filters
                  </button>
                )}
                <Link
                  to="/generate"
                  className="bg-gradient-to-r from-[#FFFD63] to-[#FFE066] hover:from-[#FFE066] hover:to-[#FFFD63] text-[#0A0B1E] px-8 py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center"
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  Generate Your First Summary
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

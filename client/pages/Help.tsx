import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  readTime: number;
  helpful: number;
  notHelpful: number;
}

interface HelpCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  articles: number;
}

export default function Help() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null,
  );

  const categories: HelpCategory[] = [
    {
      id: "getting-started",
      name: "Getting Started",
      icon: "🚀",
      description: "Learn the basics of SummifyIO",
      articles: 8,
    },
    {
      id: "generation",
      name: "Chapter Generation",
      icon: "📚",
      description: "How to generate and customize summaries",
      articles: 12,
    },
    {
      id: "collaboration",
      name: "Collaboration",
      icon: "👥",
      description: "Work together with your team",
      articles: 6,
    },
    {
      id: "account",
      name: "Account & Billing",
      icon: "💳",
      description: "Manage your account and subscription",
      articles: 10,
    },
    {
      id: "api",
      name: "API & Integrations",
      icon: "🔌",
      description: "Developer documentation and API guides",
      articles: 7,
    },
    {
      id: "troubleshooting",
      name: "Troubleshooting",
      icon: "🔧",
      description: "Common issues and solutions",
      articles: 15,
    },
  ];

  const articles: HelpArticle[] = [
    {
      id: "1",
      title: "How to Generate Your First Chapter Discovery",
      content: `Welcome to SummifyIO! This guide will walk you through generating your first chapter discovery.

## Step 1: Enter Your Topic
Start by entering a specific question or topic in the search box. For example:
- "How to build trust in teams"
- "Effective leadership strategies"
- "Time management techniques"

## Step 2: Choose Generation Type
- **Standard Generation**: Free for all users, takes about 60 seconds
- **Priority Generation**: Premium feature, results in 10 seconds

## Step 3: Review Results
Your results will include:
- **Relevant Books**: Curated list of books that address your topic
- **Chapter Analysis**: Specific chapters and pages to read
- **Key Insights**: Extracted quotes and actionable advice
- **Comparative Analysis**: How different authors approach the topic

## Step 4: Export and Share
- Export to PDF, TXT, or DOCX formats
- Share with team members
- Save to your library for future reference

## Tips for Better Results
- Be specific with your questions
- Use concrete terms rather than abstract concepts
- Try different phrasings if results aren't what you expected

That's it! You're now ready to discover exactly what chapters to read instead of entire books.`,
      category: "getting-started",
      tags: ["beginner", "tutorial", "generation"],
      lastUpdated: "2024-01-20",
      readTime: 5,
      helpful: 47,
      notHelpful: 3,
    },
    {
      id: "2",
      title: "Understanding Different Generation Types",
      content: `SummifyIO offers two types of chapter generation to meet different needs and budgets.

## Standard Generation (Free)
- **Processing Time**: ~60 seconds
- **Books Analyzed**: Up to 5 books per search
- **Monthly Limit**: 10 searches for free users
- **Features**: Basic analysis, PDF export, sharing

## Priority Generation ($1.99)
- **Processing Time**: ~10 seconds (6x faster)
- **Books Analyzed**: Up to 10 books per search
- **Enhanced AI**: GPT-4 powered analysis
- **Premium Features**: 
  - Advanced comparative analysis
  - Extended quote collection
  - 4A Framework insights
  - Cross-referenced findings
  - Priority customer support

## When to Use Each Type

### Use Standard Generation When:
- You have time to wait for results
- Working on personal research
- Budget is a primary concern
- Basic analysis meets your needs

### Use Priority Generation When:
- You need results immediately
- Working on time-sensitive projects
- Presenting to clients or stakeholders
- Want the most comprehensive analysis

## Upgrading Mid-Search
You can upgrade any standard generation to priority generation while it's processing for the difference in cost.`,
      category: "generation",
      tags: ["generation", "premium", "features"],
      lastUpdated: "2024-01-19",
      readTime: 3,
      helpful: 32,
      notHelpful: 1,
    },
    {
      id: "3",
      title: "How to Set Up Team Collaboration",
      content: `SummifyIO's collaboration features help teams work together on research and share discoveries efficiently.

## Setting Up Your Team

### Step 1: Access Team Settings
1. Go to Settings → Team tab
2. Click "Invite New Member"
3. Enter email address and select role
4. Click "Send Invite"

### Step 2: Understanding Team Roles
- **Viewer**: Can view shared summaries and join collaboration sessions
- **Member**: Can create summaries, share discoveries, and start collaboration sessions
- **Admin**: Full access including team management and settings

## Real-Time Collaboration

### Starting a Collaboration Session
1. Click the "Collaborate" button on any page
2. Choose "Create New Session"
3. Enter session name and topic
4. Share the session ID with team members

### During a Session
- **Chat**: Communicate with team members in real-time
- **Share Books**: Share interesting book recommendations
- **Live Updates**: See what others are working on
- **Session Notes**: Collaborative note-taking

## Best Practices for Team Collaboration

### Organization
- Use descriptive session names
- Set clear topics for each session
- Assign roles and responsibilities

### Communication
- Use the chat feature for quick questions
- Share relevant book discoveries immediately
- Provide context when sharing insights

### Security
- Only invite trusted team members
- Regularly review active sessions
- Use appropriate access levels for each member

## Managing Team Settings
- Auto-share discoveries with team
- Set default member roles
- Configure collaboration notifications
- Review team activity and usage`,
      category: "collaboration",
      tags: ["team", "collaboration", "real-time"],
      lastUpdated: "2024-01-18",
      readTime: 7,
      helpful: 28,
      notHelpful: 2,
    },
    {
      id: "4",
      title: "Billing and Subscription Management",
      content: `Learn how to manage your SummifyIO subscription, billing, and payment methods.

## Subscription Plans

### Free Plan
- 10 chapter discoveries per month
- Standard generation only
- Basic PDF export
- Community support

### Premium Plan ($19.99/month)
- Unlimited chapter discoveries
- Priority generation included
- Advanced export formats
- Team collaboration features
- Priority customer support
- API access

## Managing Your Subscription

### Upgrading to Premium
1. Go to Settings → Subscription
2. Click "Upgrade to Premium"
3. Choose monthly or annual billing
4. Enter payment information
5. Complete the upgrade

### Updating Payment Methods
1. Navigate to Settings → Subscription
2. Click "Update Payment Method"
3. Enter new card information
4. Save changes

### Viewing Usage and Billing
- **Current Usage**: View your monthly discovery count
- **Billing History**: Download invoices and receipts
- **Next Billing Date**: See when your next payment is due
- **Usage Analytics**: Track your team's activity

## Billing FAQ

### When am I charged?
- Monthly subscriptions: Same date each month
- Annual subscriptions: Same date each year
- Priority generations: Immediately upon use

### Can I cancel anytime?
Yes, you can cancel your subscription at any time. You'll retain premium features until the end of your current billing period.

### What happens if I exceed my limit?
Free users can purchase additional discoveries or upgrade to premium. Premium users have unlimited access.

### Do you offer refunds?
We offer refunds within 30 days of purchase for annual subscriptions, and within 7 days for monthly subscriptions.

## Enterprise and Team Plans
Contact our sales team for custom enterprise solutions with:
- Advanced team management
- Custom integrations
- Dedicated support
- Volume discounts`,
      category: "account",
      tags: ["billing", "subscription", "premium", "payment"],
      lastUpdated: "2024-01-17",
      readTime: 6,
      helpful: 41,
      notHelpful: 4,
    },
    {
      id: "5",
      title: "API Documentation and Integration Guide",
      content: `SummifyIO provides a comprehensive REST API for developers to integrate chapter discovery into their applications.

## Getting Started with the API

### Authentication
All API requests require authentication using your API key:

\`\`\`bash
curl -H "Authorization: Bearer YOUR_API_KEY" \\
     -H "Content-Type: application/json" \\
     https://api.summifyai.com/v1/discoveries
\`\`\`

### Base URL
\`https://api.summifyai.com/v1\`

## Core Endpoints

### Generate Chapter Discovery
\`POST /discoveries\`

Request body:
\`\`\`json
{
  "topic": "how to build trust in teams",
  "priority": false,
  "max_books": 5
}
\`\`\`

Response:
\`\`\`json
{
  "id": "disc_123456",
  "status": "completed",
  "topic": "how to build trust in teams",
  "books": [...],
  "summary": "...",
  "quotes": [...],
  "created_at": "2024-01-20T10:30:00Z"
}
\`\`\`

### Get Discovery Status
\`GET /discoveries/{id}\`

### List User Discoveries
\`GET /discoveries\`

Query parameters:
- \`limit\`: Number of results (max 100)
- \`offset\`: Pagination offset
- \`category\`: Filter by category

## Rate Limits
- **Free tier**: 100 requests per hour
- **Premium tier**: 1000 requests per hour
- **Enterprise**: Custom limits

## Webhooks
Configure webhooks to receive real-time updates:

\`\`\`json
{
  "event": "discovery.completed",
  "data": {
    "discovery_id": "disc_123456",
    "status": "completed"
  }
}
\`\`\`

## SDK Libraries
We provide official SDKs for:
- **JavaScript/Node.js**: \`npm install @summifyai/sdk\`
- **Python**: \`pip install summifyai\`
- **PHP**: \`composer require summifyai/sdk\`

## Error Handling
The API uses conventional HTTP response codes:
- \`200\`: Success
- \`400\`: Bad Request
- \`401\`: Unauthorized
- \`429\`: Rate Limit Exceeded
- \`500\`: Internal Server Error

## Best Practices
1. Cache responses when possible
2. Use webhooks for long-running requests
3. Implement exponential backoff for retries
4. Monitor your rate limit usage`,
      category: "api",
      tags: ["api", "developer", "integration", "sdk"],
      lastUpdated: "2024-01-16",
      readTime: 8,
      helpful: 22,
      notHelpful: 1,
    },
    {
      id: "6",
      title: "Troubleshooting Common Issues",
      content: `This guide covers the most common issues users encounter and how to resolve them.

## Generation Issues

### "No relevant books found"
**Causes:**
- Topic too specific or niche
- Spelling errors in search terms
- Using very technical jargon

**Solutions:**
- Try broader search terms
- Use synonyms or alternative phrasings
- Check spelling and grammar
- Try related but broader topics

### Generation stuck or timing out
**Causes:**
- High server load
- Complex search requiring more processing
- Network connectivity issues

**Solutions:**
- Wait for current generation to complete
- Try again with simpler terms
- Check your internet connection
- Contact support if issue persists

## Account Issues

### Can't sign in
**Solutions:**
- Check email and password spelling
- Try password reset
- Check if caps lock is on
- Clear browser cache and cookies
- Try incognito/private browsing mode

### Missing search history
**Causes:**
- Browser storage cleared
- Account sync issues
- Privacy settings blocking storage

**Solutions:**
- Check if signed into correct account
- Enable cookies and local storage
- Check privacy settings
- Contact support for account recovery

## Export Problems

### PDF export fails
**Solutions:**
- Check browser popup blocker
- Try different browser
- Ensure stable internet connection
- Clear browser cache
- Try exporting smaller summaries

### Exported content incomplete
**Causes:**
- Free plan limitations
- Generation not fully complete
- Export format limitations

**Solutions:**
- Wait for generation to complete fully
- Upgrade to premium for full exports
- Try different export format

## Collaboration Issues

### Can't join collaboration session
**Solutions:**
- Check session ID is correct
- Ensure you're invited to the session
- Try refreshing the page
- Check internet connection
- Verify WebSocket support in browser

### Real-time updates not working
**Solutions:**
- Check firewall/proxy settings
- Enable WebSocket connections
- Try different network
- Update browser to latest version

## Performance Issues

### Slow loading times
**Solutions:**
- Check internet connection speed
- Clear browser cache
- Close unnecessary browser tabs
- Try different browser
- Check for browser extensions blocking content

## Getting Additional Help

If these solutions don't resolve your issue:

1. **Check Status Page**: Visit status.summifyai.com
2. **Contact Support**: Use the chat widget or email support@summifyai.com
3. **Community Forum**: Join our community discussions
4. **Video Tutorials**: Watch our YouTube channel

When contacting support, please include:
- Your account email
- Browser and version
- Operating system
- Description of the issue
- Screenshots if applicable`,
      category: "troubleshooting",
      tags: ["troubleshooting", "common-issues", "support"],
      lastUpdated: "2024-01-15",
      readTime: 10,
      helpful: 67,
      notHelpful: 8,
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleVoteHelpful = (articleId: string, helpful: boolean) => {
    // In a real app, this would send feedback to the backend
    alert(`Thank you for your feedback! ${helpful ? "👍" : "👎"}`);
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation */}
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                  <span className="text-[#0A0B1E] font-bold text-lg">S</span>
                </div>
                <span className="text-xl font-bold text-[#0A0B1E] dark:text-white">
                  SummifyIO
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-gray-600 dark:text-gray-300 hover:text-[#0A0B1E] dark:hover:text-white font-medium"
                >
                  ← Back to Help Center
                </button>
                <ThemeToggle />
                {user && (
                  <Link
                    to="/dashboard"
                    className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-8">
              {/* Article Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <span className="capitalize">
                    {selectedArticle.category.replace("-", " ")}
                  </span>
                  <span>•</span>
                  <span>{selectedArticle.readTime} min read</span>
                  <span>•</span>
                  <span>
                    Updated{" "}
                    {new Date(selectedArticle.lastUpdated).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedArticle.title}
                </h1>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Article Content */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div className="whitespace-pre-line leading-relaxed">
                  {selectedArticle.content}
                </div>
              </div>

              {/* Feedback Section */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Was this article helpful?
                  </h3>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() =>
                        handleVoteHelpful(selectedArticle.id, true)
                      }
                      className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-800 px-4 py-2 rounded-lg transition-colors"
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
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        />
                      </svg>
                      Yes ({selectedArticle.helpful})
                    </button>
                    <button
                      onClick={() =>
                        handleVoteHelpful(selectedArticle.id, false)
                      }
                      className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors"
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
                          d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2M7 4H5a2 2 0 00-2 2v6a2 2 0 002 2h2.5"
                        />
                      </svg>
                      No ({selectedArticle.notHelpful})
                    </button>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Need more help?
                    </p>
                    <Link
                      to="/contact"
                      className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                    >
                      Contact our support team →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
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
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFFD63] rounded-lg flex items-center justify-center">
                <span className="text-[#0A0B1E] font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-[#0A0B1E] dark:text-white">
                SummifyIO
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              {user && (
                <Link
                  to="/dashboard"
                  className="bg-[#FFFD63] hover:bg-yellow-300 text-[#0A0B1E] px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            📚 Help Center
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
            Find answers, learn features, and get the most out of SummifyAI.
            Everything you need to become a chapter discovery expert.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <input
              type="text"
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 text-lg rounded-2xl border-2 border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/20 focus:border-white/40 backdrop-blur-sm"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-6 h-6 text-white/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`text-left p-6 rounded-2xl border-2 transition-all hover:shadow-lg ${
                  selectedCategory === category.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                  {category.description}
                </p>
                <span className="text-xs text-gray-500 dark:text-gray-500">
                  {category.articles} articles
                </span>
              </button>
            ))}
          </div>

          {selectedCategory !== "all" && (
            <div className="text-center mt-6">
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                ← Show all categories
              </button>
            </div>
          )}
        </div>

        {/* Articles */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {selectedCategory === "all"
                ? "All Articles"
                : categories.find((c) => c.id === selectedCategory)?.name ||
                  "Articles"}
            </h2>
            <span className="text-gray-600 dark:text-gray-400">
              {filteredArticles.length} articles
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => setSelectedArticle(article)}
                className="text-left bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600 transition-all"
              >
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <span className="capitalize">
                    {article.category.replace("-", " ")}
                  </span>
                  <span>•</span>
                  <span>{article.readTime} min read</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {article.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                  {article.content.substring(0, 200)}...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {article.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                    {article.helpful}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No articles found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your search terms or browse different categories.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Still need help?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help
            you get the most out of SummifyAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Contact Support
            </Link>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Join Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

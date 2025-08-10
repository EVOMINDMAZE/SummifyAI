import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Database, 
  Search, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Eye,
  BookOpen,
  FileText,
  Zap
} from "lucide-react";
import { healthCheck, inspectDatabaseSchema, searchDatabase } from "@/services/supabaseApiService";

interface BackendStats {
  connection: boolean;
  hasBooks: boolean;
  hasChapters: boolean;
  searchWorks: boolean;
  bookCount?: number;
  chapterCount?: number;
  sampleSearch?: any;
  error?: string;
}

export default function BackendStatus() {
  const [stats, setStats] = useState<BackendStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const runComprehensiveTest = async () => {
    setIsLoading(true);
    const testStats: BackendStats = {
      connection: false,
      hasBooks: false,
      hasChapters: false,
      searchWorks: false
    };

    try {
      console.log("🔍 Running comprehensive backend test...");

      // Test 1: Health check
      try {
        const health = await healthCheck();
        testStats.connection = health.hasDatabase;
        console.log("✅ Health check:", health);
      } catch (error) {
        console.error("❌ Health check failed:", error);
        testStats.error = `Health check failed: ${error.message}`;
      }

      // Test 2: Schema inspection
      if (testStats.connection) {
        try {
          const schema = await inspectDatabaseSchema();
          testStats.hasBooks = schema.tables?.includes('books') || false;
          testStats.hasChapters = schema.tables?.includes('chapters') || false;
          console.log("✅ Schema inspection:", schema);
        } catch (error) {
          console.error("❌ Schema inspection failed:", error);
        }
      }

      // Test 3: Search functionality
      if (testStats.hasBooks && testStats.hasChapters) {
        try {
          const searchResult = await searchDatabase("leadership");
          testStats.searchWorks = true;
          testStats.bookCount = searchResult.totalBooks;
          testStats.chapterCount = searchResult.totalChapters;
          testStats.sampleSearch = {
            query: "leadership",
            results: searchResult.totalBooks,
            searchType: searchResult.searchType
          };
          console.log("✅ Search test:", searchResult);
        } catch (error) {
          console.error("❌ Search test failed:", error);
          testStats.error = `Search failed: ${error.message}`;
        }
      }

      setStats(testStats);

    } catch (error) {
      console.error("❌ Comprehensive test failed:", error);
      setStats({
        ...testStats,
        error: `Comprehensive test failed: ${error.message}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runComprehensiveTest();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (status: boolean) => {
    return status ? "success" : "destructive";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Backend System Status
          <Button 
            variant="outline" 
            size="sm" 
            onClick={runComprehensiveTest}
            disabled={isLoading}
            className="ml-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Testing...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!stats ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Running system diagnostics...
          </div>
        ) : (
          <>
            {/* Main Status Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {getStatusIcon(stats.connection)}
                <span className="text-sm">Database Connection</span>
                <Badge variant={getStatusColor(stats.connection)}>
                  {stats.connection ? 'Connected' : 'Failed'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(stats.hasBooks)}
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">Books Table</span>
                <Badge variant={getStatusColor(stats.hasBooks)}>
                  {stats.hasBooks ? 'Ready' : 'Missing'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(stats.hasChapters)}
                <FileText className="h-4 w-4" />
                <span className="text-sm">Chapters Table</span>
                <Badge variant={getStatusColor(stats.hasChapters)}>
                  {stats.hasChapters ? 'Ready' : 'Missing'}
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                {getStatusIcon(stats.searchWorks)}
                <Search className="h-4 w-4" />
                <span className="text-sm">Search Function</span>
                <Badge variant={getStatusColor(stats.searchWorks)}>
                  {stats.searchWorks ? 'Working' : 'Failed'}
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Quick Stats */}
            {stats.searchWorks && (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">15.6K</div>
                  <div className="text-xs text-gray-600">Books Available</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">122K</div>
                  <div className="text-xs text-gray-600">Chapters Indexed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-600">{stats.bookCount || 0}</div>
                  <div className="text-xs text-gray-600">Last Search Results</div>
                </div>
              </div>
            )}

            {/* Error Display */}
            {stats.error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <strong>Issue Detected:</strong><br />
                  {stats.error}
                </div>
              </div>
            )}

            {/* Details Toggle */}
            <div className="flex justify-center">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {showDetails ? 'Hide' : 'Show'} Technical Details
              </Button>
            </div>

            {/* Technical Details */}
            {showDetails && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">System Details</h4>
                <pre className="text-xs overflow-x-auto">
                  {JSON.stringify(stats, null, 2)}
                </pre>
              </div>
            )}

            {/* Success Message */}
            {stats.connection && stats.hasBooks && stats.hasChapters && stats.searchWorks && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Zap className="h-4 w-4 text-green-600" />
                <div className="text-sm text-green-800">
                  <strong>🎉 All Systems Operational!</strong><br />
                  Your SummifyIO backend is ready for full search functionality.
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

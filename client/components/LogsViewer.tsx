import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  Trash2,
  Download,
  Filter,
  Search,
  RefreshCw,
  Terminal,
  AlertCircle,
  Info,
  AlertTriangle,
  Bug,
  Activity,
} from "lucide-react";
import { logCapture, type LogEntry } from "@/utils/logCapture";

interface LogsViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LogsViewer({ isOpen, onClose }: LogsViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = logCapture.subscribe((newLogs) => {
      setLogs(newLogs);
    });

    return unsubscribe;
  }, [isOpen]);

  useEffect(() => {
    // Apply filters
    let filtered = logs;

    if (selectedLevel !== "all") {
      filtered = filtered.filter((log) => log.level === selectedLevel);
    }

    if (selectedSource !== "all") {
      filtered = filtered.filter((log) => log.source === selectedSource);
    }

    if (filter.trim()) {
      const searchTerm = filter.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.message.toLowerCase().includes(searchTerm) ||
          log.source?.toLowerCase().includes(searchTerm),
      );
    }

    setFilteredLogs(filtered);
  }, [logs, filter, selectedLevel, selectedSource]);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = 0; // Scroll to top since logs are newest first
    }
  }, [filteredLogs, autoScroll]);

  const getLogIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "warn":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />;
      case "debug":
        return <Bug className="w-4 h-4 text-purple-500" />;
      default:
        return <Terminal className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLogBadgeColor = (level: string) => {
    switch (level) {
      case "error":
        return "destructive";
      case "warn":
        return "secondary";
      case "info":
        return "default";
      case "debug":
        return "outline";
      default:
        return "outline";
    }
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case "AI":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "Database":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Search":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "Success":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const clearLogs = () => {
    logCapture.clearLogs();
  };

  const exportLogs = () => {
    const logText = logCapture.exportLogs();
    const blob = new Blob([logText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `app-logs-${new Date().toISOString().slice(0, 19)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const uniqueSources = Array.from(
    new Set(logs.map((log) => log.source).filter(Boolean)),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl h-[90vh] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Application Logs</span>
            <Badge variant="outline">{filteredLogs.length} entries</Badge>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Controls */}
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Filter logs..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-64"
              />
            </div>

            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="all">All Levels</option>
              <option value="log">Log</option>
              <option value="info">Info</option>
              <option value="warn">Warning</option>
              <option value="error">Error</option>
              <option value="debug">Debug</option>
            </select>

            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
            >
              <option value="all">All Sources</option>
              {uniqueSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              className={autoScroll ? "bg-blue-50 dark:bg-blue-900" : ""}
            >
              <RefreshCw
                className={`w-4 h-4 mr-1 ${autoScroll ? "animate-spin" : ""}`}
              />
              Auto-scroll
            </Button>

            <Button variant="outline" size="sm" onClick={clearLogs}>
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>

            <Button variant="outline" size="sm" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
          </div>

          {/* Logs Display */}
          <ScrollArea
            ref={scrollRef}
            className="flex-1 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900"
          >
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {logs.length === 0
                    ? "No logs captured yet"
                    : "No logs match current filters"}
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-3 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getLogIcon(log.level)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge
                          variant={getLogBadgeColor(log.level) as any}
                          className="text-xs"
                        >
                          {log.level.toUpperCase()}
                        </Badge>
                        {log.source && (
                          <Badge
                            className={`text-xs ${getSourceBadgeColor(log.source)}`}
                          >
                            {log.source}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {log.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="text-sm font-mono text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                        {log.message}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Stats */}
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total logs: {logs.length}</span>
            <span>Filtered: {filteredLogs.length}</span>
            <span>Auto-scroll: {autoScroll ? "ON" : "OFF"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

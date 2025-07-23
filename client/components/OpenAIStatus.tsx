import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { healthCheck } from '@/services/supabaseApiService';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface HealthStatus {
  status: string;
  hasDatabase: boolean;
  hasOpenAI: boolean;
}

export default function OpenAIStatus() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(false);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const result = await healthCheck();
      setHealth(result);
    } catch (error) {
      console.error('Health check failed:', error);
      setHealth({
        status: 'error',
        hasDatabase: false,
        hasOpenAI: false,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusIcon = (hasService: boolean) => {
    if (hasService) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBadge = (hasService: boolean, serviceName: string) => {
    return (
      <Badge variant={hasService ? "default" : "destructive"}>
        {getStatusIcon(hasService)}
        <span className="ml-1">
          {serviceName}: {hasService ? 'Connected' : 'Not Available'}
        </span>
      </Badge>
    );
  };

  if (!health) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Checking system status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const needsSetup = !health.hasOpenAI;

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">System Status</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={checkHealth}
            disabled={loading}
          >
            {loading ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
            <span className="ml-1">Refresh</span>
          </Button>
        </div>

        <div className="space-y-2">
          {getStatusBadge(health.hasDatabase, 'Database')}
          {getStatusBadge(health.hasOpenAI, 'Edge Functions')}
        </div>

        {needsSetup && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>AI Features in Fallback Mode:</strong> The app works without OpenAI, but you'll get enhanced AI analysis with an API key.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                    onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Get API Key
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-700 border-blue-300 hover:bg-blue-100"
                    onClick={() => window.open('/OPENAI_SETUP_GUIDE.md', '_blank')}
                  >
                    📖 Setup Guide
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {health.hasOpenAI && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-800 dark:text-green-200">
                All AI features are enabled and ready to use!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

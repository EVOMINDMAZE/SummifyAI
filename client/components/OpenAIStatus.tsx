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
          {getStatusBadge(health.hasOpenAI, 'Netlify Functions')}
        </div>

        {needsSetup && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  <strong>Running in Fallback Mode:</strong> Netlify Functions not deployed yet. App is fully functional with basic AI features.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-700 border-amber-300 hover:bg-amber-100"
                    onClick={() => window.open('/NETLIFY_SETUP.md', '_blank')}
                  >
                    📖 Setup Guide
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-amber-700 border-amber-300 hover:bg-amber-100"
                    onClick={() => alert('Deploy Netlify Functions:\n\n1. Push code to main branch (auto-deploys)\n2. Or use Netlify CLI: netlify deploy --prod\n3. Set OPENAI_API_KEY in Netlify env vars\n\nSee NETLIFY_SETUP.md for details')}
                  >
                    🚀 Deploy Guide
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
                Netlify Functions active! Secure AI analysis is working. 🚀
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

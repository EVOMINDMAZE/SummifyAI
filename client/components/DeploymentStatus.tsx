import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ExternalLink, Terminal, CheckCircle } from 'lucide-react';

export default function DeploymentStatus() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Command copied to clipboard!');
  };

  return (
    <Card className="w-full mb-6 border-amber-200 bg-amber-50 dark:bg-amber-900/10">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200">
                Edge Functions Not Deployed
              </h3>
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                App Working in Fallback Mode
              </Badge>
            </div>
            
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              Your app is fully functional! Deploy Edge Functions to unlock secure AI-powered analysis.
            </p>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-amber-700 dark:text-amber-300">Search and basic analysis working</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-amber-700 dark:text-amber-300">Fallback AI analysis active</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-amber-700 dark:text-amber-300">Enhanced OpenAI features pending deployment</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 font-mono">Quick Deploy Commands:</span>
              </div>
              <div className="space-y-1 text-xs font-mono text-green-400">
                <div className="flex items-center justify-between">
                  <span>supabase login</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    onClick={() => copyToClipboard('supabase login')}
                  >
                    📋
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>supabase link --project-ref voosuqmkazvjzheipbrl</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    onClick={() => copyToClipboard('supabase link --project-ref voosuqmkazvjzheipbrl')}
                  >
                    📋
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <span>supabase functions deploy</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                    onClick={() => copyToClipboard('supabase functions deploy')}
                  >
                    📋
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="text-amber-700 border-amber-300 hover:bg-amber-100"
                onClick={() => window.open('/EDGE_FUNCTIONS_SETUP.md', '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Full Setup Guide
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-amber-700 border-amber-300 hover:bg-amber-100"
                onClick={() => window.open('https://supabase.com/docs/guides/functions', '_blank')}
              >
                <Terminal className="w-3 h-3 mr-1" />
                Supabase Docs
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Info, Code, Terminal, ExternalLink } from 'lucide-react';

export default function DevelopmentModeInfo() {
  return (
    <Card className="w-full mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/10">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Code className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                Development Mode
              </h3>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                Local Fallback Active
              </Badge>
            </div>
            
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              Netlify Functions are not running locally. Your app is fully functional with fallback AI analysis.
            </p>

            <div className="bg-blue-100 dark:bg-blue-900/20 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">To test Netlify Functions locally:</span>
              </div>
              <code className="text-xs text-blue-800 dark:text-blue-200 bg-blue-200 dark:bg-blue-800 px-2 py-1 rounded">
                netlify dev
              </code>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                This will start both your app and Netlify Functions locally
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
                onClick={() => window.open('/NETLIFY_SETUP.md', '_blank')}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                Setup Guide
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-blue-700 border-blue-300 hover:bg-blue-100"
                onClick={() => alert('To test locally with functions:\n\n1. Install Netlify CLI: npm install -g netlify-cli\n2. Run: netlify dev\n3. Your app will run with local functions\n\nFor production: Deploy to get full AI features!')}
              >
                <Info className="w-3 h-3 mr-1" />
                Local Testing
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

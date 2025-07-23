import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, ExternalLink, Code, X } from 'lucide-react';

interface NetlifyDeploymentStatusProps {
  isVisible: boolean;
  onDismiss: () => void;
}

export default function NetlifyDeploymentStatus({ isVisible, onDismiss }: NetlifyDeploymentStatusProps) {
  if (!isVisible) return null;

  return (
    <Card className="w-full mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/10">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <Code className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                  Netlify Functions Ready for Deployment
                </h3>
                <Badge variant="outline" className="text-blue-700 border-blue-300">
                  Development Mode
                </Badge>
              </div>
              
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                Your AI functions are created and ready! Deploy to Netlify to enable full AI-powered features.
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">Functions created and configured</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">Fallback AI analysis working</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">Deploy needed for server-side AI features</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  onClick={() => window.open('/NETLIFY_SETUP.md', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Deployment Guide
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-blue-700 border-blue-300 hover:bg-blue-100"
                  onClick={() => alert('Quick Deploy:\n\n1. Push this code to your main branch\n2. Functions will auto-deploy with your site\n3. Set OPENAI_API_KEY in Netlify env vars\n4. Enjoy server-side AI features!')}
                >
                  🚀 Quick Deploy
                </Button>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-blue-600 hover:bg-blue-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

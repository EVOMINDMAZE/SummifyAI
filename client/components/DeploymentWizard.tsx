import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  Terminal, 
  Rocket,
  Download,
  Link,
  Upload,
  Settings
} from 'lucide-react';

export default function DeploymentWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Command copied! Paste it in your terminal.');
  };

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
    if (step < 5) {
      setCurrentStep(step + 1);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Install Supabase CLI",
      icon: <Download className="w-5 h-5" />,
      command: "npm install -g supabase",
      description: "Install the Supabase command line tool globally",
      verification: "Run 'supabase --help' to verify installation"
    },
    {
      id: 2,
      title: "Login to Supabase", 
      icon: <ExternalLink className="w-5 h-5" />,
      command: "supabase login",
      description: "Authenticate with your Supabase account (opens browser)",
      verification: "You should see 'Finished supabase login'"
    },
    {
      id: 3,
      title: "Link Your Project",
      icon: <Link className="w-5 h-5" />,
      command: "supabase link --project-ref voosuqmkazvjzheipbrl",
      description: "Connect your local files to your Supabase project",
      verification: "Should show 'Linked to project: your-project-name'"
    },
    {
      id: 4,
      title: "Deploy Edge Functions",
      icon: <Upload className="w-5 h-5" />,
      command: "supabase functions deploy",
      description: "Upload and deploy all your Edge Functions",
      verification: "Should list 3 deployed functions: analyze-topic, analyze-chapter, generate-embeddings"
    },
    {
      id: 5,
      title: "Verify in Dashboard",
      icon: <Settings className="w-5 h-5" />,
      command: "",
      description: "Check your Supabase dashboard to see the deployed functions",
      verification: "Functions should appear in Edge Functions section"
    }
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Rocket className="w-6 h-6 text-blue-600" />
          <span>Edge Functions Deployment Wizard</span>
          <Badge variant="outline" className="ml-auto">
            Step {currentStep} of {steps.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Steps */}
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const isAccessible = step.id <= currentStep;

          return (
            <Card 
              key={step.id} 
              className={`transition-all duration-200 ${
                isCurrent ? 'ring-2 ring-blue-500 shadow-lg' : 
                isCompleted ? 'bg-green-50 dark:bg-green-900/10 border-green-200' :
                !isAccessible ? 'opacity-50' : ''
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  {/* Step Icon */}
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-green-100 text-green-600' :
                    isCurrent ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : step.icon}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className={`font-semibold ${
                        isCompleted ? 'text-green-700' :
                        isCurrent ? 'text-blue-700' :
                        'text-gray-600'
                      }`}>
                        Step {step.id}: {step.title}
                      </h3>
                      {isCompleted && (
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          ✓ Complete
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {step.description}
                    </p>

                    {/* Command */}
                    {step.command && (
                      <div className="bg-gray-900 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <code className="text-green-400 text-sm font-mono">
                            {step.command}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-white h-8 w-8 p-0"
                            onClick={() => copyToClipboard(step.command)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Verification */}
                    <div className="text-xs text-gray-500 mb-3">
                      <strong>Verify:</strong> {step.verification}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {step.id === 5 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open('https://supabase.com/dashboard/project/voosuqmkazvjzheipbrl/functions', '_blank')}
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Open Dashboard
                        </Button>
                      ) : (
                        isCurrent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => markStepComplete(step.id)}
                          >
                            Mark as Complete
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Completion Message */}
        {completedSteps.length === steps.length && (
          <Card className="bg-green-50 dark:bg-green-900/10 border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                🎉 Edge Functions Deployed Successfully!
              </h3>
              <p className="text-green-600 mb-4">
                Your app now has secure, server-side AI capabilities powered by Supabase Edge Functions.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-green-700 border-green-300"
                onClick={() => window.location.reload()}
              >
                Refresh App to See Changes
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Help Links */}
        <div className="flex justify-center space-x-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('/DEPLOY_GUIDE.md', '_blank')}
          >
            <Terminal className="w-4 h-4 mr-1" />
            Full Guide
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open('https://supabase.com/docs/guides/functions', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Supabase Docs
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

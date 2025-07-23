import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { healthCheck } from '@/services/supabaseApiService'

export default function SupabaseTest() {
  const [testResult, setTestResult] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runTest = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      console.log('🧪 Testing Supabase connection...')
      const result = await healthCheck()
      setTestResult(result)
      console.log('✅ Supabase test completed:', result)
    } catch (error) {
      console.error('❌ Supabase test failed:', error)
      setTestResult({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'failed'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🧪 Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Testing...' : 'Test Supabase Connection'}
        </Button>

        {testResult && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

        <div className="text-xs text-gray-600">
          <p>This tests:</p>
          <ul className="list-disc list-inside ml-2">
            <li>Supabase database connection</li>
            <li>OpenAI API configuration</li>
            <li>Environment variables</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

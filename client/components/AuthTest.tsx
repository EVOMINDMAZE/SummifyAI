import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface AuthTestProps {
  onTestComplete?: (results: any) => void;
}

export const AuthTest: React.FC<AuthTestProps> = ({ onTestComplete }) => {
  const [testResults, setTestResults] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const { user, isLoading, signIn, signOut } = useAuth();

  const log = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
    const logMessage = `[${timestamp}] ${emoji} ${message}`;
    setLogs(prev => [...prev, logMessage]);
    console.log(logMessage);
  };

  const runTest = async (testName: string, testFn: () => Promise<boolean>) => {
    try {
      log(`Running ${testName}...`);
      const result = await testFn();
      setTestResults(prev => ({ ...prev, [testName]: { success: result, error: null } }));
      log(`${testName}: ${result ? 'PASSED' : 'FAILED'}`, result ? 'success' : 'error');
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTestResults(prev => ({ ...prev, [testName]: { success: false, error: errorMessage } }));
      log(`${testName}: FAILED - ${errorMessage}`, 'error');
      return false;
    }
  };

  const testEnvironment = async (): Promise<boolean> => {
    const checks = [
      ['Supabase Client', !!supabase],
      ['Auth Context', !!useAuth],
      ['Environment Variables', !!import.meta.env.VITE_SUPABASE_URL]
    ];

    const passed = checks.filter(([, result]) => result).length;
    log(`Environment: ${passed}/${checks.length} checks passed`);
    return passed === checks.length;
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      if (error) throw error;
      log('Database connection successful');
      return true;
    } catch (error) {
      throw new Error(`Connection failed: ${error.message}`);
    }
  };

  const testSession = async (): Promise<boolean> => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      
      if (session) {
        log(`Active session found for ${session.user.email}`);
      } else {
        log('No active session (normal if not logged in)');
      }
      return true;
    } catch (error) {
      throw new Error(`Session check failed: ${error.message}`);
    }
  };

  const testProfile = async (): Promise<boolean> => {
    if (!user) {
      log('Skipping profile test - no authenticated user');
      return true;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      if (profile) {
        log('Profile fetched successfully');
        return true;
      } else {
        throw new Error('No profile found');
      }
    } catch (error) {
      throw new Error(`Profile test failed: ${error.message}`);
    }
  };

  const testAuthContext = async (): Promise<boolean> => {
    const contextChecks = [
      ['Auth Context Loading State', typeof isLoading === 'boolean'],
      ['Sign In Function', typeof signIn === 'function'],
      ['Sign Out Function', typeof signOut === 'function'],
      ['User State Management', user === null || typeof user === 'object']
    ];

    const passed = contextChecks.filter(([, result]) => result).length;
    log(`Auth Context: ${passed}/${contextChecks.length} checks passed`);
    return passed === contextChecks.length;
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setLogs([]);
    setTestResults({});

    log('🚀 Starting SummifyIO Authentication Tests...');

    await runTest('Environment', testEnvironment);
    await runTest('Connection', testConnection);
    await runTest('Session', testSession);
    await runTest('AuthContext', testAuthContext);
    await runTest('Profile', testProfile);

    const results = Object.values(testResults);
    const passed = results.filter((r: any) => r.success).length;
    const total = results.length;

    log(`🏁 Tests completed: ${passed}/${total} passed`, passed === total ? 'success' : 'error');
    
    setIsRunning(false);
    
    if (onTestComplete) {
      onTestComplete({ passed, total, results: testResults });
    }
  };

  useEffect(() => {
    // Auto-run tests on mount
    runAllTests();
  }, []);

  const getStatusColor = (result: any) => {
    if (!result) return 'text-gray-500';
    return result.success ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🔐 Authentication System Test
        </h2>
        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
        >
          {isRunning ? 'Running...' : 'Run Tests'}
        </button>
      </div>

      {/* Current User Status */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Current Status:</h3>
        <div className="space-y-1 text-sm">
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>User: {user ? `${user.email} (${user.planType})` : 'Not authenticated'}</div>
          <div>Search Count: {user ? `${user.searchCount}/${user.monthlySearchLimit}` : 'N/A'}</div>
        </div>
      </div>

      {/* Test Results */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Test Results:</h3>
        <div className="space-y-2">
          {Object.entries(testResults).map(([testName, result]: [string, any]) => (
            <div key={testName} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <span className="font-medium text-gray-900 dark:text-white">{testName}</span>
              <span className={getStatusColor(result)}>
                {result.success ? '✅ PASSED' : `❌ FAILED${result.error ? `: ${result.error}` : ''}`}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Logs */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Test Logs:</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthTest;

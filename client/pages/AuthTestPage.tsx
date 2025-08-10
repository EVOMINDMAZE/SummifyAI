import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthTest from '@/components/AuthTest';
import Navigation from '@/components/Navigation';

export default function AuthTestPage() {
  const [testResults, setTestResults] = useState<any>(null);
  const { user, signIn, signOut, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTestComplete = (results: any) => {
    setTestResults(results);
    console.log('Authentication tests completed:', results);
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError('');

    try {
      await signIn(email, password);
      console.log('✅ Sign in successful');
    } catch (err: any) {
      setError(err.message || 'Sign in failed');
      console.error('❌ Sign in failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');

    try {
      await signInWithGoogle();
      console.log('✅ Google sign in initiated');
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
      console.error('❌ Google sign in failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      console.log('✅ Sign out successful');
    } catch (err: any) {
      setError(err.message || 'Sign out failed');
      console.error('❌ Sign out failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            SummifyIO Authentication Test Suite
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive testing of the Supabase authentication system integration.
          </p>
        </div>

        {/* Test Summary */}
        {testResults && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              📊 Test Summary
            </h2>
            <div className={`text-lg font-medium ${
              testResults.passed === testResults.total 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {testResults.passed}/{testResults.total} tests passed
            </div>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {testResults.passed === testResults.total 
                ? '🎉 All authentication systems are working correctly!'
                : '⚠️ Some authentication components need attention.'
              }
            </div>
          </div>
        )}

        {/* Manual Authentication Test */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            🧪 Manual Authentication Test
          </h2>
          
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="text-green-800 dark:text-green-200">
                  <strong>✅ Authenticated as:</strong> {user.email}
                </div>
                <div className="text-sm text-green-600 dark:text-green-300 mt-1">
                  Plan: {user.planType} | Searches: {user.searchCount}/{user.monthlySearchLimit}
                </div>
              </div>
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
              >
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="text-yellow-800 dark:text-yellow-200">
                  <strong>⚠️ Not authenticated</strong>
                </div>
                <div className="text-sm text-yellow-600 dark:text-yellow-300 mt-1">
                  Test authentication by signing in below
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="text-red-800 dark:text-red-200">
                    <strong>❌ Error:</strong> {error}
                  </div>
                </div>
              )}

              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password"
                    required
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In with Email'}
                  </button>

                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In with Google'}
                  </button>
                </div>
              </form>

              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>💡 Test Credentials:</strong> Try using one of the existing user emails from the database
              </div>
            </div>
          )}
        </div>

        {/* Automated Test Component */}
        <AuthTest onTestComplete={handleTestComplete} />
      </div>
    </div>
  );
}

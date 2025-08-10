import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const AuthTest: React.FC = () => {
  const { user, isLoading, signOut } = useAuth();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 text-xs font-mono z-50 max-w-xs">
      <div className="font-semibold mb-2 text-gray-900 dark:text-white">
        🔐 Auth Status
      </div>
      
      <div className="space-y-1 text-gray-600 dark:text-gray-400">
        <div>
          <strong>Loading:</strong> {isLoading ? '🔄 Yes' : '✅ No'}
        </div>
        
        <div>
          <strong>User:</strong> {user ? `✅ ${user.email}` : '❌ None'}
        </div>
        
        {user && (
          <>
            <div>
              <strong>Plan:</strong> {user.planType}
            </div>
            <div>
              <strong>Searches:</strong> {user.searchCount}/{user.monthlySearchLimit}
            </div>
            <div className="pt-2">
              <button
                onClick={signOut}
                className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
              >
                Sign Out
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthTest;

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const AuthStatus: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-2 rounded text-xs font-mono z-50">
        <div>Auth Status:</div>
        <div>Loading: {isLoading ? '🔄' : '✅'}</div>
        <div>User: {user ? '✅ ' + user.email : '❌ None'}</div>
      </div>
    );
  }

  return null;
};

export default AuthStatus;

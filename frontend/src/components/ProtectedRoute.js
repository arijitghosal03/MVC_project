import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

/**
 * Protects a route by redirecting unauthenticated users to the login page.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to login...");
    console.log('auth:', localStorage.getItem('auth'));
    return <Navigate to="/login" replace state={{ from: location }} />;
   
  }

  console.log("User authenticated, rendering protected route.");
  return children;
};

export default ProtectedRoute;

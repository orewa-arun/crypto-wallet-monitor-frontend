import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log('ProtectedRoute - User:', user, 'Loading:', loading);
  
  // Show loading while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Authenticating...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to landing page if not authenticated
  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to landing page');
    return <Navigate to="/" replace />;
  }
  
  // User is authenticated, render the protected component
  return <>{children}</>;
};

export default ProtectedRoute;
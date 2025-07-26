import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import NotificationSubscription from "./pages/NotificationSubscription";
import ContactBook from "./pages/ContactBook";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";

const App: React.FC = () => {
  const { user, loading, authMethod } = useAuth();

  // Debug: Log auth state changes
  console.log('App: Auth state changed - user:', user ? 'authenticated' : 'not authenticated', 'method:', authMethod, 'loading:', loading);
  if (user) {
    console.log('App: User details:', user);
  }

  // Show loading screen while authentication state is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notification-settings"
        element={
          <ProtectedRoute>
            <NotificationSubscription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contact-book"
        element={
          <ProtectedRoute>
            <ContactBook />
          </ProtectedRoute>
        }
      />
      {/* Catch all route - redirect to landing page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
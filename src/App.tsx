import React, { useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import NotificationSubscription from "./pages/NotificationSubscription";
import ContactBook from "./pages/ContactBook";
import { useAuth } from "./hooks/useAuth";

const App: React.FC = () => {
  const { user, loading, authMethod } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Debug: Log auth state changes
  console.log('App: Auth state changed - user:', user ? 'authenticated' : 'not authenticated', 'method:', authMethod, 'loading:', loading);
  if (user) {
    console.log('App: User details:', user);
  }

  // Force redirect when user becomes authenticated and we're on the landing page
  useEffect(() => {
    if (user && location.pathname === '/') {
      console.log('App: User authenticated on landing page, redirecting to dashboard...');
      navigate('/dashboard', { replace: true });
    }
  }, [user, location.pathname, navigate]);

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
        element={user ? <Dashboard /> : <Navigate to="/" replace />}
      />
      <Route
        path="/notification-settings"
        element={user ? <NotificationSubscription /> : <Navigate to="/" replace />}
      />
      <Route
        path="/contact-book"
        element={user ? <ContactBook /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import Navigation from './components/layout/Navigation';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import AuthCallback from './components/auth/AuthCallback';
import Dashboard from './components/dashboard/Dashboard';
import Friends from './components/friends/Friends';
import ProgressBoard from './components/progressboard/ProgressBoard';
import Settings from './components/settings/Settings';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  console.log('🔍 ProtectedRoute: isAuthenticated =', isAuthenticated, 'loading =', loading);
  
  if (loading) {
    console.log('🔍 ProtectedRoute: Showing loading state');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('🔍 ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  console.log('🔍 ProtectedRoute: Authenticated, rendering children');
  return children;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// Placeholder components for routes we haven't built yet

const LeetCodeProfile = () => (
  <div className="px-4 sm:px-6">
    <div className="text-center py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">LeetCode Profile</h1>
      <p className="text-gray-600">LeetCode profile management coming soon...</p>
    </div>
  </div>
);

// App Routes Component
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <LoginForm />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <RegisterForm />
        </PublicRoute>
      } />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      {/* Protected Routes - Specific routes first */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Navigation>
            <Dashboard />
          </Navigation>
        </ProtectedRoute>
      } />
      <Route path="/friends" element={
        <ProtectedRoute>
          <Navigation>
            <Friends />
          </Navigation>
        </ProtectedRoute>
      } />
      <Route path="/progress-board" element={
        <ProtectedRoute>
          <Navigation>
            <ProgressBoard />
          </Navigation>
        </ProtectedRoute>
      } />
      <Route path="/leetcode" element={
        <ProtectedRoute>
          <Navigation>
            <LeetCodeProfile />
          </Navigation>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Navigation>
            <Settings />
          </Navigation>
        </ProtectedRoute>
      } />
      
      {/* Root route redirect - must be last */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* 404 Route */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
            <p className="text-gray-600 mb-4">Page not found</p>
            <a href="/dashboard" className="btn-primary">
              Go to Dashboard
            </a>
          </div>
        </div>
      } />
    </Routes>
  );
};

// Main App Component
const App = () => {
  // Force cache refresh for debugging
  console.log('🚀 App version: 1.0.1 - Navigation fix');
  
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your-google-client-id'}>
      <AuthProvider>
        <Router>
          <div className="App">
            <AppRoutes />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: '#4ade80',
                  },
                },
                error: {
                  duration: 4000,
                  theme: {
                    primary: '#ef4444',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
};

export default App;

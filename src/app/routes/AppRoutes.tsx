import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Import Pages
import AuthPage from '../pages/AuthPage';
import Onboarding from '../pages/Onboarding';
import { Settings } from '../pages/Settings';
import { Memberships } from '../pages/Memberships';
import Dashboard from '../pages/Dashboard';
import RewardsHub from '../pages/RewardsHub';

// ─── Protected Route Wrapper ───
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#e9e9e9] flex items-center justify-center text-[#000000] font-sans">
        <div className="flex flex-col items-center gap-3">
          {/* DailyStack Brand Loader (Lime theme) */}
          <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm font-semibold tracking-wider text-[#000000]/50">Verifying session...</span>
        </div>
      </div>
    );
  }

  return session ? <>{children}</> : <Navigate to="/auth" replace />;
};

// ─── Public Only Route Wrapper ───
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session, loading } = useAuth();

  if (loading) return null;
  return session ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Dynamic Root Redirection */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Public Authentication Gate */}
        <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        
        {/* Protected Application Routes */}
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/memberships" element={<ProtectedRoute><Memberships /></ProtectedRoute>} />
        <Route path="/rewards" element={<ProtectedRoute><RewardsHub /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        
        {/* Fallback Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
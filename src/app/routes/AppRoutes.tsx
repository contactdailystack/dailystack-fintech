import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { AuthService } from '../services/authService';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const SignUpPage = lazy(() => import('../pages/SignUpPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const Onboarding = lazy(() => import('../pages/Onboarding'));
const HomeDashboard = lazy(() => import('../pages/HomeDashboard'));
const ValuePage = lazy(() => import('../pages/ValuePage'));
const Settings = lazy(() => import('../pages/Settings').then(module => ({ default: module.Settings })));
const TodoPage = lazy(() => import('../pages/TodoPage').then(module => ({ default: module.TodoPage })));
const Dating = lazy(() => import('../pages/Dating'));
const DatingDashboard = lazy(() => import('../screens/dating/DatingDashboard'));
const MatchScreen = lazy(() => import('../screens/dating/MatchScreen'));
const MatchesList = lazy(() => import('../screens/dating/MatchesList'));
const DatingChat = lazy(() => import('../screens/dating/ChatScreen'));
const CompatibilityReport = lazy(() => import('../screens/dating/CompatibilityReport'));

// Silent redirect checker for the root path
const AuthRedirect: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    AuthService.autoLogin().then((user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-[var(--surface-bg)]" />;
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
};

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--surface-bg)]">
    <div className="ds-spinner"></div>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<AuthRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          
          <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><HomeDashboard /></ProtectedRoute>} />
          <Route path="/todo" element={<ProtectedRoute><TodoPage /></ProtectedRoute>} />
          <Route path="/value" element={<ProtectedRoute><ValuePage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* ── Dating Routes ─────────────────────────────────────────── */}
          <Route path="/dating" element={<ProtectedRoute><Dating /></ProtectedRoute>} />
          <Route path="/dating/discover" element={<ProtectedRoute><DatingDashboard /></ProtectedRoute>} />
          <Route path="/dating/matches" element={<ProtectedRoute><MatchesList /></ProtectedRoute>} />
          <Route path="/dating/match/:matchId" element={<ProtectedRoute><MatchScreen /></ProtectedRoute>} />
          <Route path="/dating/chat/:chatId" element={<ProtectedRoute><DatingChat /></ProtectedRoute>} />
          <Route path="/dating/compatibility/:userId" element={<ProtectedRoute><CompatibilityReport /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default AppRoutes;

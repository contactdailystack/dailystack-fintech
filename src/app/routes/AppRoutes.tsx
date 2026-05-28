import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import Onboarding from '../pages/Onboarding';
import Dashboard from '../pages/Dashboard';
import { Memberships } from '../pages/Memberships';
import { Settings } from '../pages/Settings';
import Dating from '../pages/Dating';
import DatingDashboard from '../screens/dating/DatingDashboard';
import MatchScreen from '../screens/dating/MatchScreen';
import MatchesList from '../screens/dating/MatchesList';
import DatingChat from '../screens/dating/ChatScreen';
import CompatibilityReport from '../screens/dating/CompatibilityReport';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/memberships" element={<Memberships />} />
        <Route path="/settings" element={<Settings />} />
        
        {/* ── Dating Routes ─────────────────────────────────────────── */}
        <Route path="/dating" element={<Dating />} />
        <Route path="/dating/discover" element={<DatingDashboard />} />
        <Route path="/dating/matches" element={<MatchesList />} />
        <Route path="/dating/match/:matchId" element={<MatchScreen />} />
        <Route path="/dating/chat/:chatId" element={<DatingChat />} />
        <Route path="/dating/compatibility/:userId" element={<CompatibilityReport />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
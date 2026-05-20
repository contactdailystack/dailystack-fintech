import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';
import Onboarding from '../pages/Onboarding';
import Dashboard from '../pages/Dashboard';
import { Memberships } from '../pages/Memberships';
import { Settings } from '../pages/Settings';

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/memberships" element={<Memberships />} /> {/* เพิ่ม Route นี้ครับ */}
        <Route path="/settings" element={<Settings />} />       {/* เพิ่ม Route นี้ครับ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
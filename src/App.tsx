import React, { useEffect } from 'react';
import { LanguageProvider } from './app/context/LanguageContext';
import { AuthProvider } from './app/context/AuthContext';
import AppRoutes from './app/routes/AppRoutes';

const App: React.FC = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/push-sw.js').then(
        (registration) => {
          console.debug('[DailyStack] Service Worker registered:', registration.scope);
        },
        (error) => {
          console.error('[DailyStack] Service Worker registration failed:', error);
        }
      );
    }
  }, []);

  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[#0B0F0A] text-white">
          <AppRoutes />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
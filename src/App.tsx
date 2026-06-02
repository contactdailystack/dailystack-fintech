import React from 'react';
import { LanguageProvider } from './app/context/LanguageContext';
import { AuthProvider } from './app/context/AuthContext';
import AppRoutes from './app/routes/AppRoutes';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="min-h-screen bg-[#e9e9e9] text-black">
          <AppRoutes />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
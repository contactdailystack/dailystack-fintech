import React from 'react';
import { LanguageProvider } from './app/context/LanguageContext';
import AppRoutes from './app/routes/AppRoutes';

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-[#1c232a] text-white">
        <AppRoutes />
      </div>
    </LanguageProvider>
  );
};

export default App;
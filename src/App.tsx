import React from 'react';
import { ThemeProvider } from './app/providers/ThemeProvider';
import { LanguageProvider } from './app/context/LanguageContext';
import AppRoutes from './app/routes/AppRoutes';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-[var(--semantic-bg)] text-[var(--semantic-text)] feature-marketplace">
          <AppRoutes />
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
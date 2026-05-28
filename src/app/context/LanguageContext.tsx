/**
 * DailyStack — Language Context
 * Global language state management for EN / TH
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

type Language = 'en' | 'th';

interface LanguageContextType {
  lang: Language;
  language: Language;
  setLang: React.Dispatch<React.SetStateAction<Language>>;
  setLanguage: React.Dispatch<React.SetStateAction<Language>>;
  toggleLang: () => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─── Default Translations (fallback) ──────────────────────────────────────────
const defaultTranslations: Record<string, Record<Language, string>> = {
  // Add common translations here as fallback
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('en');

  const setLang = useCallback<React.Dispatch<React.SetStateAction<Language>>>((newLang) => {
    setLangState((prevLang) => typeof newLang === 'function' ? newLang(prevLang) : newLang);
  }, []);

  const toggleLang = useCallback(() => {
    setLangState(prev => prev === 'en' ? 'th' : 'en');
  }, []);

  const t = useCallback((key: string): string => {
    return defaultTranslations[key]?.[lang] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{
      lang,
      language: lang,
      setLang,
      setLanguage: setLang,
      toggleLang,
      toggleLanguage: toggleLang,
      t,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    // Return default values if context not available
    return {
      lang: 'en',
      language: 'en',
      setLang: () => {},
      setLanguage: () => {},
      toggleLang: () => {},
      toggleLanguage: () => {},
      t: (key: string) => key,
    };
  }
  return context;
};

export default LanguageContext;

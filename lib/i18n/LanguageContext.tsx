'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations, dynamicTextDictionary } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('adrconnect_language') as Language | null;
    if (['en', 'hi', 'bn', 'gu', 'ta', 'kn'].includes(savedLang as string)) {
      setLanguageState(savedLang!);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('adrconnect_language', lang);
  };

  const t = (key: string, fallback?: string): string => {
    if (!key) return fallback || '';

    // 1. Primary translation dictionary check
    const langDict = translations[language] as Record<string, string>;
    if (langDict && langDict[key]) {
      return langDict[key];
    }

    // 2. Dynamic text dictionary check (for clinical notes, ward names, notice titles/messages, raw text)
    const dynDict = dynamicTextDictionary[language] as Record<string, string>;
    if (dynDict) {
      if (dynDict[key]) return dynDict[key];
      if (fallback && dynDict[fallback]) return dynDict[fallback];
    }

    // 3. Fallback to English dictionary
    const enDict = translations.en as Record<string, string>;
    if (enDict && enDict[key]) {
      return enDict[key];
    }

    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

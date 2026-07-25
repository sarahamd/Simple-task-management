import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, translations, TranslationKeys } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKeys) => string;
}

const getInitialLang = (): Language => {
  if (typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem('lang');
    if (saved === 'en' || saved === 'ar') return saved;
  }
  return 'en';
};

const applyLangToDOM = (lang: Language) => {
  if (typeof document === 'undefined') return;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.dir = dir;
  document.documentElement.lang = lang;
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('lang', lang);
  }
};

// Sync DOM on module evaluation
applyLangToDOM(getInitialLang());

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLang);
  const dir: 'ltr' | 'rtl' = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    applyLangToDOM(language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    applyLangToDOM(lang);
  };

  const toggleLanguage = () => {
    setLanguageState((prev) => {
      const next = prev === 'en' ? 'ar' : 'en';
      applyLangToDOM(next);
      return next;
    });
  };

  const t = (key: TranslationKeys): string => {
    const dict = translations[language] as Record<string, string> | undefined;
    const fallback = translations.en as Record<string, string>;
    return dict?.[key] || fallback[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, dir, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    const currentLang = getInitialLang();
    const dict = translations[currentLang] as Record<string, string> | undefined;
    const fallback = translations.en as Record<string, string>;
    return {
      language: currentLang,
      dir: currentLang === 'ar' ? 'rtl' : 'ltr',
      setLanguage: (l) => applyLangToDOM(l),
      toggleLanguage: () => {
        const next = getInitialLang() === 'en' ? 'ar' : 'en';
        applyLangToDOM(next);
      },
      t: (key) => dict?.[key] || fallback[key] || key,
    };
  }
  return context;
};

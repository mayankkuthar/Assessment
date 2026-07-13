import React, { createContext, useContext, useState, useCallback } from 'react';
import { DEFAULT_LANGUAGE, LANGUAGES } from '../constants/languages';

// App-wide preferred language. Set during Sign-Up (and changeable from the
// user dashboard), persisted to localStorage so it survives reloads and is
// shared by every component that renders translatable content.
const STORAGE_KEY = 'preferredLanguage';

const readStoredLanguage = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  languages: LANGUAGES,
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(readStoredLanguage);

  const setLanguage = useCallback((lang) => {
    const next = lang || DEFAULT_LANGUAGE;
    setLanguageState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore write failures (e.g. private mode) — in-memory state still works */
    }
  }, []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

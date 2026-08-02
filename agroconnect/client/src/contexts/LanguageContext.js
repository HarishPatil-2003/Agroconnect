import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../locales/en.json';
import hi from '../locales/hi.json';
import mr from '../locales/mr.json';

const translations = { en, hi, mr };

const LanguageContext = createContext(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      language: 'en',
      changeLanguage: () => {},
      t: (path) => path || ''
    };
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('ag_language') || 'en';
    } catch (e) {
      console.warn('localStorage is not accessible in LanguageContext:', e);
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ag_language', language);
    } catch (e) {
      console.warn('localStorage write failed in LanguageContext:', e);
    }
  }, [language]);

  const changeLanguage = (lang) => {
    if (lang === language) return;
    const rootEl = document.getElementById('root');
    
    // Smooth transition without page reload
    if (rootEl) {
      rootEl.style.transition = 'opacity 150ms cubic-bezier(0.16, 1, 0.3, 1)';
      rootEl.style.opacity = '0';
    }
    
    setTimeout(() => {
      setLanguage(lang);
      if (rootEl) {
        rootEl.style.opacity = '1';
        setTimeout(() => {
          rootEl.style.transition = '';
        }, 150);
      }
    }, 150);
  };

  const t = (path) => {
    if (!path) return '';
    const keys = path.split('.');
    let current = translations[language];
    
    for (let key of keys) {
      if (!current || current[key] === undefined) {
        // Fallback to English
        let fallback = translations['en'];
        for (let k of keys) {
          if (!fallback || fallback[k] === undefined) return path;
          fallback = fallback[k];
        }
        return fallback;
      }
      current = current[key];
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

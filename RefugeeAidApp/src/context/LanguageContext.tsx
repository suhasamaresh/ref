import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { translations } from '../locales';

export type SupportedLanguage = 'en' | 'es' | 'ar' | 'fr';

interface Translation {
  [key: string]: string | Translation;
}

interface LanguageContextValue {
  language: SupportedLanguage;
  translations: Translation;
  availableLanguages: { code: SupportedLanguage; name: string; nativeName: string }[];
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  isRTL: boolean;
}

const availableLanguages = [
  { code: 'en' as SupportedLanguage, name: 'English', nativeName: 'English' },
  { code: 'es' as SupportedLanguage, name: 'Spanish', nativeName: 'Español' },
  { code: 'ar' as SupportedLanguage, name: 'Arabic', nativeName: 'العربية' },
  { code: 'fr' as SupportedLanguage, name: 'French', nativeName: 'Français' },
];

const rtlLanguages = ['ar'];

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (savedLanguage && translations[savedLanguage as SupportedLanguage]) {
        setLanguageState(savedLanguage as SupportedLanguage);
      }
    } catch (error) {
      console.error('Error loading language preference:', error);
    }
  };

  const setLanguage = async (lang: SupportedLanguage) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        console.warn(`Translation key not found: ${key}`);
        return key;
      }
    }
    
    // If the resolved value isn't a string, try falling back to English
    if (typeof value !== 'string') {
      console.warn(`Translation value is not a string for '${key}' in '${language}', attempting English fallback.`);
      // attempt English fallback
      try {
        let fallback: any = translations.en as any;
        for (const k of keys) {
          if (fallback && typeof fallback === 'object') {
            fallback = fallback[k];
          } else {
            fallback = undefined;
            break;
          }
        }
        if (typeof fallback === 'string') {
          value = fallback;
        } else {
          // final fallback: return the key so it's obvious in UI
          return key;
        }
      } catch (e) {
        return key;
      }
    }
    
    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, replacement]) => {
        const placeholder = new RegExp(`{{${param}}}`, 'g');
        value = value.replace(placeholder, replacement.toString());
      });
    }
    
    return value;
  };

  const isRTL = rtlLanguages.includes(language);

  return (
    <LanguageContext.Provider value={{
      language,
      translations: translations[language],
      availableLanguages,
      setLanguage,
      t,
      isRTL,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

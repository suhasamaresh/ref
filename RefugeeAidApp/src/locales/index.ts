import en from './en.json';
import es from './es.json';
import ar from './ar.json';
import fr from './fr.json';

export const translations = {
  en,
  es,
  ar,
  fr,
} as const;

export type SupportedLanguage = keyof typeof translations;

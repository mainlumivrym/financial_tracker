import en from './en';
import es from './es';

export type Language = 'en' | 'es';

export const translations = {
  en,
  es,
};

export type TranslationKeys = typeof en;

// Helper function to get nested translation keys
export function getTranslation(
  locale: Language,
  key: string
): string {
  const keys = key.split('.');
  let value: any = translations[locale];

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  return typeof value === 'string' ? value : key;
}

export { en, es };

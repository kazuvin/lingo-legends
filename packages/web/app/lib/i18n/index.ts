import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { resources, defaultNS, fallbackLng } from '~/locales';
import type { Resources, Language, Namespace } from '~/locales';
import { useState, useEffect, useCallback } from 'react';

// Custom language detection function
const detectLanguage = (): Language => {
  const browserLanguages = navigator.languages || [navigator.language];

  // Check if any of the browser languages include Japanese
  const hasJapanese = browserLanguages.some((lang) => lang.toLowerCase().includes('ja'));

  return hasJapanese ? 'ja-JP' : 'en-US';
};

i18n.use(LanguageDetector).init({
  resources,
  defaultNS,
  fallbackLng,
  lng: detectLanguage(),
  debug: process.env.NODE_ENV === 'development',
  interpolation: {
    escapeValue: false,
  },
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    caches: ['localStorage'],
  },
});

type FlattenKeys<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, unknown>
    ? `${K}.${FlattenKeys<T[K]>}`
    : K
  : never;

type TranslationKey<NS extends Namespace = 'common'> = FlattenKeys<Resources['en-US'][NS]>;

interface UseI18nReturn {
  t: <NS extends Namespace = 'common'>(
    key: TranslationKey<NS>,
    options?: {
      ns?: NS;
      count?: number;
      context?: string;
      replace?: Record<string, string | number>;
      defaultValue?: string;
    },
  ) => string;
  language: Language;
  changeLanguage: (lng: Language) => Promise<void>;
  ready: boolean;
}

export function useI18n(): UseI18nReturn {
  const [language, setLanguage] = useState<Language>(i18n.language as Language);
  const [ready, setReady] = useState(i18n.isInitialized);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLanguage(lng as Language);
    };

    const handleInitialized = () => {
      setReady(true);
    };

    i18n.on('languageChanged', handleLanguageChanged);
    i18n.on('initialized', handleInitialized);

    if (i18n.isInitialized) {
      setReady(true);
      setLanguage(i18n.language as Language);
    }

    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
      i18n.off('initialized', handleInitialized);
    };
  }, []);

  const t = useCallback(
    <NS extends Namespace = 'common'>(
      key: TranslationKey<NS>,
      options?: {
        ns?: NS;
        count?: number;
        context?: string;
        replace?: Record<string, string | number>;
        defaultValue?: string;
      },
    ): string => {
      const { ns = 'common' as NS, replace, ...restOptions } = options || {};
      const translationKey = `${ns}:${key}`;

      return i18n.t(translationKey, {
        ...restOptions,
        ...(replace && { replace }),
      });
    },
    [],
  );

  const changeLanguage = useCallback(async (lng: Language) => {
    await i18n.changeLanguage(lng);
  }, []);

  return {
    t,
    language,
    changeLanguage,
    ready,
  };
}

export default i18n;


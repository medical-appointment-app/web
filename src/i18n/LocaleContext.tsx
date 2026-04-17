import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
  type ReactNode,
} from 'react';
import type { Locale as AntdLocale } from 'antd/es/locale';
import enUS from 'antd/locale/en_US';
import trTR from 'antd/locale/tr_TR';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/tr';

import { dictionaries, type Locale, type TranslationKey } from './locales';

const STORAGE_KEY = 'appLocale';
const DEFAULT_LOCALE: Locale = 'en';

const ANTD_LOCALES: Record<Locale, AntdLocale> = { en: enUS, tr: trTR };

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  antdLocale: AntdLocale;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

const isLocale = (value: unknown): value is Locale => value === 'en' || value === 'tr';

const readInitialLocale = (): Locale => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // Ignore unavailable localStorage (e.g. private mode).
  }
  const browser = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : '';
  if (browser.startsWith('tr')) return 'tr';
  return DEFAULT_LOCALE;
};

const interpolate = (template: string, vars?: Record<string, string | number>): string => {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    Object.prototype.hasOwnProperty.call(vars, key) ? String(vars[key]) : match,
  );
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readInitialLocale);

  useEffect(() => {
    dayjs.locale(locale);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore persistence errors.
    }
  }, []);

  const value = useMemo<LocaleContextValue>(() => {
    const table = dictionaries[locale];
    return {
      locale,
      setLocale,
      antdLocale: ANTD_LOCALES[locale],
      t: (key, vars) => interpolate(table[key] ?? key, vars),
    };
  }, [locale, setLocale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used inside <LocaleProvider>');
  }
  return ctx;
}

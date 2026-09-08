"use client";

import { NextIntlClientProvider } from "next-intl";
import {
  createContext,
  ReactNode,
  useContext,
  useSyncExternalStore,
} from "react";

import en from "../../messages/en.json";
import pl from "../../messages/pl.json";

export type Locale = "pl" | "en";

const messages = { pl, en };

export const DEFAULT_LOCALE: Locale = "en";
const LOCALE_STORAGE_KEY = "routines-locale";

function isLocale(value: unknown): value is Locale {
  return value === "pl" || value === "en";
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

// Tiny external store (mirrors src/lib/use-store.ts): the server snapshot is the
// default so the first client render matches the server HTML, and the stored
// preference is picked up after hydration without a hydration mismatch.
const listeners = new Set<() => void>();
let localeSnapshot: Locale | null = null;

function getLocaleSnapshot(): Locale {
  if (localeSnapshot === null) {
    localeSnapshot = readStoredLocale();
  }
  return localeSnapshot;
}

function getServerLocaleSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function setStoredLocale(next: Locale): void {
  localeSnapshot = next;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next);
  } catch {
    // Ignore storage failures (private mode, blocked storage) — the choice
    // simply won't persist across reloads.
  }
  for (const listener of listeners) {
    listener();
  }
}

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(
    subscribe,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale: setStoredLocale }}>
      <NextIntlClientProvider locale={locale} messages={messages[locale]}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export function useI18n(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}

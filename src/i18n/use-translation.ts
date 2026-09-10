import { useSyncExternalStore } from "react";

import { LOCALE_KEY } from "@/lib/storage-keys";

import en from "./en.json";
import pl from "./pl.json";

export type Locale = "pl" | "en";
export type MessageKey = keyof typeof en;

const catalogs = { en, pl } satisfies Record<
  Locale,
  Record<MessageKey, string>
>;

export const DEFAULT_LOCALE: Locale = "en";

function isLocale(value: unknown): value is Locale {
  return value === "pl" || value === "en";
}

// First launch only: no stored preference yet, so fall back to the device's
// language (navigator.language, e.g. "pl-PL") instead of always defaulting to
// English. Once a value is stored — including this detected one — it always
// wins; this never overrides a choice the user already made.
function detectLocale(): Locale {
  const language = window.navigator?.language ?? "";
  return language.toLowerCase().startsWith("pl") ? "pl" : DEFAULT_LOCALE;
}

function readStoredLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }
  try {
    const stored = window.localStorage.getItem(LOCALE_KEY);
    if (isLocale(stored)) {
      return stored;
    }
    const detected = detectLocale();
    window.localStorage.setItem(LOCALE_KEY, detected);
    return detected;
  } catch {
    return DEFAULT_LOCALE;
  }
}

// Tiny external store: no provider needed, since the store itself is a
// module-level singleton — every component reads/writes the same locale via
// useSyncExternalStore.
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
    window.localStorage.setItem(LOCALE_KEY, next);
  } catch {
    // Ignore storage failures (private mode, blocked storage) — the choice
    // simply won't persist across reloads.
  }
  for (const listener of listeners) {
    listener();
  }
}

// Hoisted: `t()` calls this on every render of every visible string, so the
// pattern is compiled once rather than on each call. Safe to share across
// calls — String.replace resets a global regex's lastIndex before each use.
const placeholderPattern = /\{(\w+)\}/g;

function format(
  message: string,
  params?: Record<string, string | number>,
): string {
  if (!params) return message;
  return message.replace(placeholderPattern, (match, token: string) =>
    token in params ? String(params[token]) : match,
  );
}

export type UseTranslationResult = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, params?: Record<string, string | number>) => string;
};

export function useTranslation(): UseTranslationResult {
  const locale = useSyncExternalStore(
    subscribe,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );

  return {
    locale,
    setLocale: setStoredLocale,
    t: (key, params) => format(catalogs[locale][key], params),
  };
}

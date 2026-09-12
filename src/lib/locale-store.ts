import { LOCALE_KEY } from "@/lib/storage-keys";

// The non-React half of the i18n store: a module-level singleton so it can be
// read/written from plain lib code (e.g. backup import) as well as from
// src/i18n/use-translation.ts's useSyncExternalStore-backed hook. Kept here,
// not in i18n/, so lib/ stays free of react/react-dom imports per CLAUDE.md.

export type Locale = "pl" | "en";

export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
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

const listeners = new Set<() => void>();
let localeSnapshot: Locale | null = null;

export function getLocaleSnapshot(): Locale {
  if (localeSnapshot === null) {
    localeSnapshot = readStoredLocale();
  }
  return localeSnapshot;
}

export function getServerLocaleSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

export function subscribeToLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setStoredLocale(next: Locale): void {
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

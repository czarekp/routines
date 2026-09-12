import { useSyncExternalStore } from "react";

import {
  getLocaleSnapshot,
  getServerLocaleSnapshot,
  setStoredLocale,
  subscribeToLocale,
  type Locale,
} from "@/lib/locale-store";

import en from "./en.json";
import pl from "./pl.json";

export type { Locale };
export type MessageKey = keyof typeof en;

const catalogs = { en, pl } satisfies Record<
  Locale,
  Record<MessageKey, string>
>;

export { DEFAULT_LOCALE } from "@/lib/locale-store";

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

// Tiny external store: no provider needed, since the store itself is a
// module-level singleton (src/lib/locale-store.ts) — every component
// reads/writes the same locale via useSyncExternalStore.
export function useTranslation(): UseTranslationResult {
  const locale = useSyncExternalStore(
    subscribeToLocale,
    getLocaleSnapshot,
    getServerLocaleSnapshot,
  );

  return {
    locale,
    setLocale: setStoredLocale,
    t: (key, params) => format(catalogs[locale][key], params),
  };
}

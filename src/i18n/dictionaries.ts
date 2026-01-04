/**
 * Dictionary loading utilities for i18n
 * 
 * Dictionaries are loaded statically to ensure they're available at build time
 * for static page generation.
 */

import type { Locale } from "./config";

// Import dictionaries statically for SSG compatibility
import en from "./dictionaries/en.json";
import it from "./dictionaries/it.json";
import es from "./dictionaries/es.json";
import ja from "./dictionaries/ja.json";
import ko from "./dictionaries/ko.json";
import zhHans from "./dictionaries/zh-Hans.json";
import zhHant from "./dictionaries/zh-Hant.json";
import id from "./dictionaries/id.json";
import vi from "./dictionaries/vi.json";

export type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  it,
  es,
  ja,
  ko,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
  id,
  vi,
};

/**
 * Get dictionary for a locale (sync, for server components)
 */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? dictionaries.en;
}

/**
 * Get dictionary for a locale (async, for potential future dynamic loading)
 */
export async function getDictionaryAsync(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale] ?? dictionaries.en;
}


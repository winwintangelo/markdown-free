/**
 * Internationalization Configuration
 * 
 * Supported locales and default settings for multi-language support.
 */

export const locales = ["en", "it", "es", "ja", "ko", "zh-Hans", "zh-Hant", "id", "vi"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
  es: "Español",
  ja: "日本語",
  ko: "한국어",
  "zh-Hans": "简体中文",
  "zh-Hant": "繁體中文",
  id: "Bahasa Indonesia",
  vi: "Tiếng Việt",
};

// Locale metadata for SEO
export const localeMetadata: Record<Locale, {
  hreflang: string;
  ogLocale: string;
  htmlLang: string;
}> = {
  en: { hreflang: "en", ogLocale: "en_US", htmlLang: "en" },
  it: { hreflang: "it", ogLocale: "it_IT", htmlLang: "it" },
  es: { hreflang: "es", ogLocale: "es_ES", htmlLang: "es" },
  ja: { hreflang: "ja", ogLocale: "ja_JP", htmlLang: "ja" },
  ko: { hreflang: "ko", ogLocale: "ko_KR", htmlLang: "ko" },
  "zh-Hans": { hreflang: "zh-Hans", ogLocale: "zh_CN", htmlLang: "zh-Hans" },
  "zh-Hant": { hreflang: "zh-Hant", ogLocale: "zh_TW", htmlLang: "zh-Hant" },
  id: { hreflang: "id", ogLocale: "id_ID", htmlLang: "id" },
  vi: { hreflang: "vi", ogLocale: "vi_VN", htmlLang: "vi" },
};

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get locale from pathname
 */
export function getLocaleFromPath(pathname: string): Locale {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && isValidLocale(firstSegment)) {
    return firstSegment;
  }
  
  return defaultLocale;
}

/**
 * Get path without locale prefix
 */
export function getPathWithoutLocale(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const firstSegment = segments[0];
  
  if (firstSegment && isValidLocale(firstSegment)) {
    return "/" + segments.slice(1).join("/") || "/";
  }
  
  return pathname;
}

/**
 * Get localized path
 */
export function getLocalizedPath(pathname: string, locale: Locale): string {
  const pathWithoutLocale = getPathWithoutLocale(pathname);
  
  if (locale === defaultLocale) {
    return pathWithoutLocale;
  }
  
  return `/${locale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
}


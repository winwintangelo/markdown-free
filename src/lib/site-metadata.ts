import type { Viewport } from "next";

/**
 * Shared root-layout constants.
 *
 * The app has TWO root layouts (build plan Phase −1, "Option B"):
 *   - src/app/(en)/layout.tsx      → <html lang="en">, English pages at the URL root
 *   - src/app/[locale]/layout.tsx  → <html lang={locale}>, prefixed locale pages
 *
 * Splitting the root layouts lets every page prerender statically with the
 * correct server-side <html lang>, instead of reading request headers in a
 * single root layout (which forced the whole site into dynamic rendering).
 */

export const siteUrl = "https://www.markdown.free";

export const siteViewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

/** hreflang map shared by both root layouts' metadata. */
export const localeAlternates: Record<string, string> = {
  en: "/",
  it: "/it",
  es: "/es",
  ja: "/ja",
  ko: "/ko",
  "zh-Hans": "/zh-Hans",
  "zh-Hant": "/zh-Hant",
  id: "/id",
  vi: "/vi",
  hi: "/hi",
  "x-default": "/",
};

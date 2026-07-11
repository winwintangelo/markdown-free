import type { MetadataRoute } from "next";

/**
 * Dynamic sitemap (replaces the hand-maintained public/sitemap.xml).
 *
 * WHY: the old static sitemap had 91/101 URLs with no <lastmod> and the rest
 * frozen at 2026-05-09, so Bing/Google had no freshness signal and stopped
 * re-fetching it. This route stamps the build date on every deploy and keeps
 * URLs + hreflang in one typed source of truth.
 *
 * hreflang: reciprocal alternate groups are emitted for the homepage, FAQ, and
 * the readme/word/epub/image/comparison clusters. The PDF cluster's English
 * member is the homepage ("/"), so a clean reciprocal group isn't possible in a
 * sitemap (a URL can only belong to one group) — those locale PDF pages are
 * emitted without sitemap-level hreflang (their <head> hreflang still applies).
 */

const SITE = "https://www.markdown.free";
const lastModified = new Date();

const abs = (path: string) => (path === "/" ? `${SITE}/` : `${SITE}${path}`);

/**
 * One reciprocal hreflang group. Every locale path is emitted as its own URL,
 * all sharing the same `alternates.languages` map (+ x-default = English).
 */
function group(map: Record<string, string>): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const [locale, path] of Object.entries(map)) languages[locale] = abs(path);
  languages["x-default"] = abs(map.en);
  return Object.values(map).map((path) => ({
    url: abs(path),
    lastModified,
    alternates: { languages },
  }));
}

/** Standalone URLs with no localized siblings (or where sitemap hreflang is intentionally omitted). */
function plain(paths: string[]): MetadataRoute.Sitemap {
  return paths.map((path) => ({ url: abs(path), lastModified }));
}

const homepages = group({
  en: "/", es: "/es", it: "/it", ja: "/ja", ko: "/ko",
  "zh-Hans": "/zh-Hans", "zh-Hant": "/zh-Hant", id: "/id", vi: "/vi", hi: "/hi",
});

const faq = group({
  en: "/faq", es: "/es/faq", it: "/it/faq", ja: "/ja/faq", ko: "/ko/faq",
  "zh-Hans": "/zh-Hans/faq", "zh-Hant": "/zh-Hant/faq", id: "/id/faq", vi: "/vi/faq", hi: "/hi/faq",
});

const readme = group({
  en: "/readme-to-pdf", es: "/es/convertir-readme-pdf", it: "/it/convertire-readme-pdf",
  ja: "/ja/readme-pdf-henkan", ko: "/ko/readme-pdf-byeonhwan",
  "zh-Hans": "/zh-Hans/readme-pdf-zhuanhuan", "zh-Hant": "/zh-Hant/readme-pdf-zhuanhuan-tw",
  id: "/id/konversi-readme-pdf", vi: "/vi/chuyen-doi-readme-pdf",
});

const word = group({
  en: "/markdown-to-word", es: "/es/markdown-a-word", it: "/it/markdown-in-word",
  ja: "/ja/markdown-word-henkan", ko: "/ko/markdown-word-byeonhwan",
  "zh-Hans": "/zh-Hans/markdown-zhuanhuan-word", "zh-Hant": "/zh-Hant/markdown-word-zhuanhuan",
  id: "/id/markdown-ke-word", vi: "/vi/markdown-sang-word",
});

const epub = group({
  en: "/markdown-to-epub", es: "/es/convertir-markdown-epub", it: "/it/markdown-epub-gratis",
  ja: "/ja/markdown-epub-henkan", ko: "/ko/markdown-epub-byeonhwan",
  "zh-Hans": "/zh-Hans/markdown-epub-zhuanhuan", "zh-Hant": "/zh-Hant/markdown-epub-zhuanhuan-tw",
  id: "/id/konversi-markdown-epub", vi: "/vi/chuyen-doi-markdown-epub",
});

const image = group({
  en: "/markdown-to-png", es: "/es/markdown-a-png", it: "/it/markdown-in-png",
  ja: "/ja/markdown-gazou-henkan", ko: "/ko/markdown-imiji-byeonhwan",
  "zh-Hans": "/zh-Hans/markdown-zhuan-tupian", "zh-Hant": "/zh-Hant/markdown-zhuan-tupian-tw",
  id: "/id/markdown-ke-gambar", vi: "/vi/markdown-sang-anh",
});

const comparison = group({
  en: "/best-markdown-to-pdf-converter-2026", es: "/es/comparacion-convertidores-markdown",
  it: "/it/confronto-convertitori-markdown", ja: "/ja/markdown-henkan-hikaku",
  ko: "/ko/markdown-byeonhwan-bigyo", "zh-Hans": "/zh-Hans/markdown-zhuanhuanqi-bijiao",
  "zh-Hant": "/zh-Hant/markdown-zhuanhuanqi-bijiao-tw", id: "/id/perbandingan-konverter-markdown",
  vi: "/vi/so-sanh-cong-cu-markdown", hi: "/hi/markdown-pdf-tulna-2026",
});

const standalone = plain([
  // Static
  "/about", "/privacy",
  // PDF cluster locale pages (en = "/", so no clean sitemap hreflang group)
  "/es/convertir-markdown-pdf", "/it/convertire-markdown-pdf", "/ja/markdown-pdf-henkan",
  "/ko/markdown-pdf-byeonhwan", "/zh-Hans/markdown-pdf-zhuanhuan", "/zh-Hant/markdown-pdf-zhuanhuan-tw",
  "/id/konversi-markdown-pdf", "/vi/chuyen-doi-markdown-pdf",
  // "No signup / no watermark" pages
  "/markdown-to-pdf-no-watermark", "/es/markdown-pdf-sin-registro", "/it/markdown-pdf-senza-registrazione",
  "/ja/markdown-pdf-touroku-fuyou", "/ko/markdown-pdf-hoewon-gaibeop-eobs-i", "/zh-Hans/markdown-pdf-wuxu-zhuce",
  "/zh-Hant/markdown-pdf-mianzhuce", "/id/markdown-pdf-tanpa-daftar", "/vi/markdown-pdf-khong-dang-ky",
  // DOCX synonym pages (the word cluster uses the -word-/-a-word slugs)
  "/markdown-to-docx", "/ja/markdown-docx-henkan", "/zh-Hant/markdown-docx-zhuanhuan",
  // English-only tool/landing pages
  "/github-readme-to-pdf", "/chatgpt-to-pdf", "/claude-artifacts-to-pdf", "/notion-export-to-pdf",
  "/typora-to-pdf", "/obsidian-markdown-to-pdf", "/markdown-to-pdf-online-free",
  // zh-Hant long-tail intent pages
  "/zh-Hant/github-wenjiian-pdf", "/zh-Hant/api-wendang-pdf", "/zh-Hant/buluoge-wenzhang-pdf",
  "/zh-Hant/huiyi-jilu-pdf", "/zh-Hant/jishu-biji-pdf", "/zh-Hant/xueshu-biji-pdf",
]);

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...homepages,
    ...faq,
    ...readme,
    ...word,
    ...epub,
    ...image,
    ...comparison,
    ...standalone,
  ];
}

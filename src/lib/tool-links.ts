import type { Locale } from "@/i18n/config";

/**
 * Cross-linking manifest for the converter tool suite.
 *
 * Single source of truth for the per-locale "related tools" hub rendered in the
 * footer (site-wide) and as in-content sections on intent pages. Every href is a
 * canonical, published route (cross-checked against public/sitemap.xml).
 *
 * Format tokens (PDF / Word / EPUB / README) are loanwords and read correctly in
 * every supported language; the heading and the comparison label are localized.
 */

export type ToolKey = "pdf" | "readme" | "docx" | "epub" | "comparison";

export interface ToolLink {
  key: ToolKey;
  href: string;
  label: string;
}

/** Localized heading for the related-tools section. */
export const RELATED_HEADING: Record<Locale, string> = {
  en: "Related tools",
  es: "Herramientas relacionadas",
  it: "Strumenti correlati",
  ja: "関連ツール",
  ko: "관련 도구",
  "zh-Hans": "相关工具",
  "zh-Hant": "相關工具",
  id: "Alat terkait",
  vi: "Công cụ liên quan",
  hi: "संबंधित टूल",
};

const COMPARISON_LABEL: Record<Locale, string> = {
  en: "Converter comparison",
  es: "Comparativa de conversores",
  it: "Confronto convertitori",
  ja: "変換ツール比較",
  ko: "변환기 비교",
  "zh-Hans": "转换器对比",
  "zh-Hant": "轉換器比較",
  id: "Perbandingan konverter",
  vi: "So sánh công cụ",
  hi: "कन्वर्टर तुलना",
};

/** Builds the standard 5-tool list for a locale from its route slugs. */
function suite(
  locale: Locale,
  hrefs: { pdf: string; readme: string; docx: string; epub: string; comparison: string }
): ToolLink[] {
  return [
    { key: "pdf", href: hrefs.pdf, label: "Markdown → PDF" },
    { key: "readme", href: hrefs.readme, label: "README → PDF" },
    { key: "docx", href: hrefs.docx, label: "Markdown → Word" },
    { key: "epub", href: hrefs.epub, label: "Markdown → EPUB" },
    { key: "comparison", href: hrefs.comparison, label: COMPARISON_LABEL[locale] },
  ];
}

/**
 * Per-locale tool suite. `hi` only has a comparison page published, so it carries
 * a single entry; locales absent here render no hub.
 */
export const TOOL_LINKS: Partial<Record<Locale, ToolLink[]>> = {
  en: suite("en", {
    pdf: "/",
    readme: "/readme-to-pdf",
    docx: "/markdown-to-docx",
    epub: "/markdown-to-epub",
    comparison: "/best-markdown-to-pdf-converter-2026",
  }),
  es: suite("es", {
    pdf: "/es/convertir-markdown-pdf",
    readme: "/es/convertir-readme-pdf",
    docx: "/es/markdown-a-word",
    epub: "/es/convertir-markdown-epub",
    comparison: "/es/comparacion-convertidores-markdown",
  }),
  it: suite("it", {
    pdf: "/it/convertire-markdown-pdf",
    readme: "/it/convertire-readme-pdf",
    docx: "/it/markdown-in-word",
    epub: "/it/markdown-epub-gratis",
    comparison: "/it/confronto-convertitori-markdown",
  }),
  ja: suite("ja", {
    pdf: "/ja/markdown-pdf-henkan",
    readme: "/ja/readme-pdf-henkan",
    docx: "/ja/markdown-docx-henkan",
    epub: "/ja/markdown-epub-henkan",
    comparison: "/ja/markdown-henkan-hikaku",
  }),
  ko: suite("ko", {
    pdf: "/ko/markdown-pdf-byeonhwan",
    readme: "/ko/readme-pdf-byeonhwan",
    docx: "/ko/markdown-word-byeonhwan",
    epub: "/ko/markdown-epub-byeonhwan",
    comparison: "/ko/markdown-byeonhwan-bigyo",
  }),
  "zh-Hans": suite("zh-Hans", {
    pdf: "/zh-Hans/markdown-pdf-zhuanhuan",
    readme: "/zh-Hans/readme-pdf-zhuanhuan",
    docx: "/zh-Hans/markdown-zhuanhuan-word",
    epub: "/zh-Hans/markdown-epub-zhuanhuan",
    comparison: "/zh-Hans/markdown-zhuanhuanqi-bijiao",
  }),
  "zh-Hant": suite("zh-Hant", {
    pdf: "/zh-Hant/markdown-pdf-zhuanhuan-tw",
    readme: "/zh-Hant/readme-pdf-zhuanhuan-tw",
    docx: "/zh-Hant/markdown-docx-zhuanhuan",
    epub: "/zh-Hant/markdown-epub-zhuanhuan-tw",
    comparison: "/zh-Hant/markdown-zhuanhuanqi-bijiao-tw",
  }),
  id: suite("id", {
    pdf: "/id/konversi-markdown-pdf",
    readme: "/id/konversi-readme-pdf",
    docx: "/id/markdown-ke-word",
    epub: "/id/konversi-markdown-epub",
    comparison: "/id/perbandingan-konverter-markdown",
  }),
  vi: suite("vi", {
    pdf: "/vi/chuyen-doi-markdown-pdf",
    readme: "/vi/chuyen-doi-readme-pdf",
    docx: "/vi/markdown-sang-word",
    epub: "/vi/chuyen-doi-markdown-epub",
    comparison: "/vi/so-sanh-cong-cu-markdown",
  }),
  hi: [{ key: "comparison", href: "/hi/markdown-pdf-tulna-2026", label: COMPARISON_LABEL.hi }],
};

/** Tool links for a locale, excluding the page's own tool. Empty if none. */
export function relatedTools(locale: Locale, current?: ToolKey): ToolLink[] {
  return (TOOL_LINKS[locale] ?? []).filter((t) => t.key !== current);
}

"use client";

import Link from "next/link";
import { useSectionVisibility } from "@/hooks/use-engagement-tracking";
import { trackNavClick } from "@/lib/analytics";
import type { Locale, Dictionary } from "@/i18n";

interface FooterProps {
  locale?: Locale;
  dict?: Dictionary;
}

// Default dictionary values for backward compatibility
const defaultDict = {
  footer: {
    copyright: "© 2026 Markdown Free. Built for simple, fast, free exports.",
    privacyNote: "No tracking cookies • HTTPS only"
  }
};

// Locale links for crawlability — helps search engines discover all locale homepages
const localeLinks = [
  { code: "en", label: "English", href: "/" },
  { code: "ja", label: "日本語", href: "/ja" },
  { code: "ko", label: "한국어", href: "/ko" },
  { code: "zh-Hans", label: "简体中文", href: "/zh-Hans" },
  { code: "zh-Hant", label: "繁體中文", href: "/zh-Hant" },
  { code: "es", label: "Español", href: "/es" },
  { code: "it", label: "Italiano", href: "/it" },
  { code: "id", label: "Bahasa", href: "/id" },
  { code: "vi", label: "Tiếng Việt", href: "/vi" },
] as const;

export function Footer({ locale, dict = defaultDict as Dictionary }: FooterProps) {
  const sectionRef = useSectionVisibility("footer");

  // Get correct path prefix
  const pathPrefix = locale && locale !== "en" ? `/${locale}` : "";

  return (
    <footer ref={sectionRef} className="mt-4 flex flex-col items-center gap-2 text-[11px] text-slate-400">
      {/* Language links for SEO crawlability */}
      <nav aria-label="Language" className="flex flex-wrap justify-center gap-x-2 gap-y-1">
        {localeLinks.map((l) => (
          <Link
            key={l.code}
            href={l.href}
            className={`transition-colors ${l.code === (locale || "en") ? "text-slate-500" : "hover:text-slate-600"}`}
            hrefLang={l.code}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="flex flex-col items-center justify-between gap-2 w-full sm:flex-row">
        <p>{dict.footer.copyright}</p>
        <p>
          <Link
            href={`${pathPrefix}/privacy`}
            onClick={() => trackNavClick("privacy")}
            className="hover:text-slate-600 transition-colors"
          >
            Privacy
          </Link>
          {" • "}
          {dict.footer.privacyNote}
        </p>
      </div>
    </footer>
  );
}

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

export function Footer({ locale, dict = defaultDict as Dictionary }: FooterProps) {
  const sectionRef = useSectionVisibility("footer");
  
  // Get correct path prefix
  const pathPrefix = locale && locale !== "en" ? `/${locale}` : "";
  
  return (
    <footer ref={sectionRef} className="mt-4 flex flex-col items-center justify-between gap-2 text-[11px] text-slate-400 sm:flex-row">
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
    </footer>
  );
}

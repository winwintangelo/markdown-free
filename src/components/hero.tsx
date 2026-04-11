"use client";

import { useSectionVisibility } from "@/hooks/use-engagement-tracking";
import type { Locale, Dictionary } from "@/i18n";

interface HeroProps {
  locale?: Locale;
  dict?: Dictionary;
}

// Default dictionary values for backward compatibility
const defaultDict = {
  hero: {
    badge: "Free • No signup • Instant export",
    title: "Free Markdown to PDF, DOCX & EPUB Converter",
    subtitle: "Upload or paste your .md file, preview it instantly, then export to PDF, DOCX, EPUB or HTML in one click. Free, private and secure — your files are never stored."
  }
};

export function Hero({ locale: _locale, dict = defaultDict as Dictionary }: HeroProps) {
  const sectionRef = useSectionVisibility("hero");

  return (
    <section ref={sectionRef} className="text-center md:mt-0 -mt-4">
      {/* Badge */}
      <div className="mb-1 md:mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {dict.hero.badge}
      </div>

      {/* Headline - hidden on mobile to save space, visible on desktop for SEO */}
      <h1 className="hidden text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl md:block">
        {dict.hero.title}
      </h1>

      {/* Subheadline - hidden on mobile (paste area is self-explanatory), visible on desktop */}
      <p className="mx-auto mt-3 hidden max-w-2xl text-sm text-slate-600 sm:text-base md:block">
        {dict.hero.subtitle}
      </p>
    </section>
  );
}

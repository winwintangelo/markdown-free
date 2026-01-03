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
    title: "Free Markdown to PDF, TXT & HTML Converter",
    subtitle: "Upload or paste your .md file, preview it instantly, then export to PDF, TXT or HTML in one click. Free, private and secure — your files are never stored."
  }
};

export function Hero({ locale: _locale, dict = defaultDict as Dictionary }: HeroProps) {
  const sectionRef = useSectionVisibility("hero");
  
  return (
    <section ref={sectionRef} className="text-center">
      {/* Badge */}
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {dict.hero.badge}
      </div>

      {/* Headline - SEO optimized H1 */}
      <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        {dict.hero.title}
      </h1>

      {/* Subheadline with privacy promise */}
      <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
        {dict.hero.subtitle}
      </p>
    </section>
  );
}

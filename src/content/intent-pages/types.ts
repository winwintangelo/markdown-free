import type { Locale } from "@/i18n/config";
import type { ToolKey } from "@/lib/tool-links";

/**
 * Long-tail intent pages (build plan Phase 1).
 *
 * Every page is data: the manifest (manifest.json) lists group/locale/slug and
 * the per-locale files hold the prose. `IntentPage` (components/intent-page.tsx)
 * renders them; scripts/generate-intent-pages.mjs writes the route stubs.
 */

export type IntentFamily = "math" | "table" | "source" | "generic";

/** Sample document loaded by the live demo (public/samples/<id>.md) */
export type SampleId = "math" | "table" | "mermaid" | "chat";

export interface IntentManifestEntry {
  group: string;
  locale: Locale;
  slug: string;
  family: IntentFamily;
  sample: SampleId;
  related: ToolKey;
}

export interface IntentSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: { title: string; text: string }[];
}

export interface IntentFaq {
  q: string;
  a: string;
}

/** The prose for one page, keyed in the locale file by `slug`. */
export interface IntentPageContent {
  /** <title> without the site suffix (kept ≤ 65 chars incl. suffix) */
  title: string;
  description: string;
  keywords: string[];
  h1: string;
  lead: string;
  ctaTop: string;
  ctaBottom: string;
  sections: IntentSection[];
  faqHeading: string;
  faq: IntentFaq[];
  demo: {
    heading: string;
    hint: string;
    readyHint: string;
    sampleLabel: string;
    /** One line under the demo explaining what to look for */
    note: string;
  };
}

export type IntentPageData = IntentManifestEntry & IntentPageContent;

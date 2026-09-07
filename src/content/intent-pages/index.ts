import manifest from "./manifest.json";
import { en } from "./en";
import { zhHans } from "./zh-Hans";
import { zhHant } from "./zh-Hant";
import { ja } from "./ja";
import { ko } from "./ko";
import type { Locale } from "@/i18n/config";
import type { IntentManifestEntry, IntentPageContent, IntentPageData } from "./types";

const CONTENT: Partial<Record<Locale, Record<string, IntentPageContent>>> = {
  en,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
  ja,
  ko,
};

const entries = manifest.pages as IntentManifestEntry[];
const externalGroupMembers = manifest.externalGroupMembers as Record<string, Partial<Record<Locale, string>>>;

/** Every page, manifest + prose merged. Throws at import time if prose is missing. */
export const INTENT_PAGES: IntentPageData[] = entries.map((entry) => {
  const content = CONTENT[entry.locale]?.[entry.slug];
  if (!content) {
    throw new Error(`intent-pages: no content for ${entry.locale}/${entry.slug} (add it to src/content/intent-pages/${entry.locale}.ts)`);
  }
  return { ...entry, ...content };
});

// Duplicate slug guard (per locale)
{
  const seen = new Set<string>();
  for (const p of INTENT_PAGES) {
    const key = `${p.locale}/${p.slug}`;
    if (seen.has(key)) throw new Error(`intent-pages: duplicate page ${key}`);
    seen.add(key);
  }
}

export function intentPagePath(page: Pick<IntentPageData, "locale" | "slug">): string {
  return page.locale === "en" ? `/${page.slug}` : `/${page.locale}/${page.slug}`;
}

export function findIntentPage(locale: Locale, slug: string): IntentPageData | undefined {
  return INTENT_PAGES.find((p) => p.locale === locale && p.slug === slug);
}

/** Pages by hreflang group. */
export const INTENT_GROUPS: Record<string, IntentPageData[]> = INTENT_PAGES.reduce<Record<string, IntentPageData[]>>(
  (acc, page) => {
    (acc[page.group] ||= []).push(page);
    return acc;
  },
  {}
);

/**
 * `alternates.languages` for a group: every sibling (generated or existing
 * hand-written page) plus x-default = the English member, else the first.
 */
export function intentGroupAlternates(group: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const [locale, path] of Object.entries(externalGroupMembers[group] ?? {})) {
    if (path) languages[locale] = path;
  }
  for (const page of INTENT_GROUPS[group] ?? []) {
    languages[page.locale] = intentPagePath(page);
  }
  languages["x-default"] = languages.en ?? Object.values(languages)[0];
  return languages;
}

export interface IntentSitemapGroup {
  /** Generated member URLs to emit (existing hand-written members have their own entries) */
  paths: string[];
  /** Full reciprocal hreflang map, including any existing hand-written member */
  languages: Record<string, string>;
}

/** Sitemap helper: reciprocal groups (≥ 2 members) and standalone pages. */
export function intentSitemapEntries(): { groups: IntentSitemapGroup[]; standalone: string[] } {
  const groups: IntentSitemapGroup[] = [];
  const standalone: string[] = [];
  for (const [group, pages] of Object.entries(INTENT_GROUPS)) {
    const languages = intentGroupAlternates(group);
    const memberCount = Object.keys(languages).filter((k) => k !== "x-default").length;
    if (memberCount >= 2) {
      groups.push({ paths: pages.map(intentPagePath), languages });
    } else {
      standalone.push(...pages.map(intentPagePath));
    }
  }
  return { groups, standalone };
}

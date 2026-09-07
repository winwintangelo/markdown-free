import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { RootShell } from "@/components/root-shell";
import { LanguageBanner } from "@/components/language-banner";
import { LocaleTracker } from "@/components/locale-tracker";
import { ConverterProvider } from "@/hooks/use-converter";
import { localeAlternates, siteUrl, siteViewport } from "@/lib/site-metadata";
import {
  locales,
  isValidLocale,
  localeMetadata,
  getDictionary,
  type Locale,
} from "@/i18n";
import "../globals.css";

/**
 * Root layout for prefixed locale pages (/it, /ja/…, /zh-Hans/…).
 *
 * This is one of two root layouts — see src/lib/site-metadata.ts. `lang` comes
 * from the static route param, so every locale page prerenders with the correct
 * server-side <html lang> (no request headers, no client-side patching).
 */

// Prerender every locale. Unknown first segments (/xx, /wp-admin, …) fall
// through to notFound() below — an explicit 404 rather than
// `dynamicParams = false`, which 404s too but logs an internal
// NoFallbackError for every bot probe.
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = siteViewport;

// Generate metadata for each locale
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = isValidLocale(localeParam) ? localeParam : "en";
  const dict = getDictionary(locale);
  const meta = localeMetadata[locale];

  return {
    title: dict.meta.title,
    description: dict.meta.description,
    authors: [{ name: "Markdown Free" }],
    creator: "Markdown Free",
    publisher: "Markdown Free",
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: locale === "en" ? "/" : `/${locale}`,
      languages: localeAlternates,
    },
    openGraph: {
      type: "website",
      locale: meta.ogLocale,
      url: locale === "en" ? siteUrl : `${siteUrl}/${locale}`,
      siteName: "Markdown Free",
      title: dict.meta.title,
      description: dict.meta.description,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "Markdown Free - Convert Markdown to PDF, Word, Image (PNG), EPUB",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/favicon.svg" }],
    },
  };
}

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  if (!isValidLocale(localeParam)) {
    notFound();
  }
  const locale: Locale = localeParam;
  const dict = getDictionary(locale);

  // Note: Header is NOT included here - pages that need it (homepage, about, privacy) add it themselves
  // Intent/landing pages intentionally skip the header for a focused experience
  // LocaleTracker sends locale-aware pageview events to Umami
  return (
    <RootShell lang={localeMetadata[locale].htmlLang}>
      <ConverterProvider>
        <LocaleTracker locale={locale} />
        {children}
        <LanguageBanner currentLocale={locale} dict={dict} />
      </ConverterProvider>
    </RootShell>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LanguageBanner } from "@/components/language-banner";
import { HtmlLangUpdater } from "@/components/html-lang-updater";
import { LocaleTracker } from "@/components/locale-tracker";
import { ConverterProvider } from "@/hooks/use-converter";
import { 
  locales, 
  isValidLocale, 
  localeMetadata, 
  getDictionary,
  type Locale 
} from "@/i18n";

const siteUrl = "https://www.markdown.free";

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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
    title: {
      default: dict.meta.title,
      template: "%s | Markdown Free",
    },
    description: dict.meta.description,
    authors: [{ name: "Markdown Free" }],
    creator: "Markdown Free",
    publisher: "Markdown Free",
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: locale === "en" ? "/" : `/${locale}`,
      languages: {
        "en": "/",
        "it": "/it",
        "es": "/es",
        "ja": "/ja",
        "ko": "/ko",
        "zh-Hans": "/zh-Hans",
        "zh-Hant": "/zh-Hant",
        "id": "/id",
        "vi": "/vi",
        "x-default": "/",
      },
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
          url: "/og-image.svg",
          width: 1200,
          height: 630,
          alt: "Markdown Free - Convert Markdown to PDF, HTML, TXT",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
      images: ["/og-image.svg"],
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

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  
  // Validate locale
  if (!isValidLocale(localeParam)) {
    notFound();
  }
  
  const locale = localeParam as Locale;
  const dict = getDictionary(locale);

  // This is a nested layout - it inherits html/body from root layout
  // We provide locale-specific components here
  // HtmlLangUpdater updates the html lang attribute on the client
  // LocaleTracker sends locale-aware pageview events to Umami
  // Note: Header is NOT included here - pages that need it (homepage, about, privacy) add it themselves
  // Intent/landing pages intentionally skip the header for a focused experience
  return (
    <ConverterProvider>
      <HtmlLangUpdater locale={locale} />
      <LocaleTracker locale={locale} />
      {children}
      <LanguageBanner currentLocale={locale} dict={dict} />
    </ConverterProvider>
  );
}

import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { UploadCard } from "@/components/upload-card";
import { PasteArea } from "@/components/paste-area";
import { ExportRow } from "@/components/export-row";
import { PreviewCard } from "@/components/preview-card";
import { Footer } from "@/components/footer";
import { EngagementTracker } from "@/components/engagement-tracker";
import { 
  isValidLocale, 
  getDictionary,
  locales,
  type Locale 
} from "@/i18n";

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// JSON-LD Schema for SEO (localized)
function getJsonLd(locale: Locale, dict: ReturnType<typeof getDictionary>) {
  const siteUrl = "https://www.markdown.free";
  const url = locale === "en" ? siteUrl : `${siteUrl}/${locale}`;
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "Markdown Free",
        url,
        description: dict.meta.description,
        applicationCategory: "UtilityApplication",
        operatingSystem: "Any (Web Browser)",
        browserRequirements: "Requires JavaScript",
        inLanguage: locale,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Convert Markdown to PDF",
          "Convert Markdown to HTML",
          "Convert Markdown to TXT",
          "100% free, no signup required",
          "Privacy-friendly: files never stored",
          "Client-side preview rendering",
          "HTTPS-only, XSS-sanitized output",
          "GitHub Flavored Markdown support",
        ],
        softwareVersion: "1.0",
        creator: {
          "@type": "Organization",
          name: "Markdown Free",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: dict.faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  
  // Validate locale
  if (!isValidLocale(localeParam)) {
    notFound();
  }
  
  const locale = localeParam as Locale;
  const dict = getDictionary(locale);
  const jsonLd = getJsonLd(locale, dict);

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Header */}
      <Header locale={locale} dict={dict} />
      {/* Engagement tracking (scroll depth, time on page, drag intent) */}
      <EngagementTracker />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-10">
        {/* Hero Section */}
        <Hero locale={locale} dict={dict} />

        {/* Main Content */}
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {/* Upload Card */}
          <UploadCard locale={locale} dict={dict} />

          {/* Paste Area (collapsible) */}
          <PasteArea locale={locale} dict={dict} />

          {/* Export Buttons Row */}
          <ExportRow locale={locale} dict={dict} />

          {/* Preview Card */}
          <PreviewCard locale={locale} dict={dict} />
        </section>

        {/* Footer */}
        <Footer locale={locale} dict={dict} />
      </main>
    </>
  );
}


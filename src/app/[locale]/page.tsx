import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { UploadCard } from "@/components/upload-card";
import { PasteArea } from "@/components/paste-area";
import { ExportRow } from "@/components/export-row";
import { PreviewCard } from "@/components/preview-card";
import { Footer } from "@/components/footer";
import { EngagementTracker } from "@/components/engagement-tracker";
import { AIReferralTracker } from "@/components/ai-referral-tracker";
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

// JSON-LD Schema for SEO (WebApplication + SoftwareApplication for LLM discoverability)
function getJsonLd(locale: Locale, dict: ReturnType<typeof getDictionary>) {
  const siteUrl = "https://www.markdown.free";
  const url = locale === "en" ? siteUrl : `${siteUrl}/${locale}`;
  
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebApplication", "SoftwareApplication"],
        "@id": `${url}/#app`,
        name: "Markdown Free",
        alternateName: "Markdown to PDF Converter",
        url,
        description: dict.meta.description,
        applicationCategory: ["DeveloperApplication", "UtilityApplication"],
        operatingSystem: "Any (Web Browser)",
        browserRequirements: "Requires JavaScript",
        inLanguage: locale,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
        featureList: [
          "Markdown to PDF conversion",
          "Markdown to DOCX conversion",
          "Markdown to HTML conversion",
          "Markdown to TXT conversion",
          "No account required",
          "Client-side processing (privacy-friendly)",
          "Files never stored on servers",
          "GitHub Flavored Markdown support",
          "Code syntax highlighting",
          "Multiple languages: English, Chinese, Japanese, Korean, Spanish, Italian, Indonesian, Vietnamese",
        ],
        softwareVersion: "1.0",
        creator: {
          "@type": "Organization",
          name: "Markdown Free",
          url: siteUrl,
        },
        screenshot: `${siteUrl}/og-image.svg`,
        softwareHelp: {
          "@type": "WebPage",
          url: `${siteUrl}/faq`,
        },
        keywords: "markdown, pdf, docx, converter, free, online, no signup, privacy",
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
      // HowTo schema — derived from same dictionary data as visible UI to avoid cloaking
      ...(() => {
        const d = dict as Record<string, unknown>;
        if ((locale !== "ja" && locale !== "ko") || !d.usageExample) return [];
        const ex = d.usageExample as { title: string; steps: string[] };
        return [
          {
            "@type": "HowTo",
            name: ex.title,
            step: ex.steps.map((text, i) => ({
              "@type": "HowToStep",
              position: i + 1,
              text,
            })),
          },
        ];
      })(),
    ],
  };
}

// Character support showcase for CJK locales (visible proof that Japanese/Korean renders correctly)
function CharacterSupportSection({ data }: { data: { title: string; description: string; examples: { label: string; text: string }[] } }) {
  return (
    <section className="mx-auto w-full max-w-4xl rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-2 text-lg font-semibold text-slate-800">{data.title}</h2>
      <p className="mb-4 text-sm text-slate-500">{data.description}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.examples.map((ex, i) => (
          <div key={i} className="rounded-md bg-slate-50 px-4 py-3">
            <p className="mb-1 text-xs font-medium text-slate-400">{ex.label}</p>
            <p className="text-sm text-slate-700">{ex.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// How-to section for locale-specific SEO content (e.g., Google Japan loves How-to)
function UsageExampleSection({ data }: { data: { title: string; steps: string[]; useCases: string } }) {
  return (
    <section className="mx-auto w-full max-w-4xl rounded-lg border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">{data.title}</h2>
      <ol className="mb-4 list-inside list-decimal space-y-2 text-sm text-slate-600">
        {data.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
      <p className="text-sm text-slate-500">{data.useCases}</p>
    </section>
  );
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
      {/* AI referral tracking (ChatGPT, Claude, Perplexity, etc.) */}
      <AIReferralTracker />
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

        {/* Locale-specific SEO content (character support, usage examples) */}
        {(locale === "ja" || locale === "ko") && (() => {
          const d = dict as Record<string, unknown>;
          return (
            <>
              {d.characterSupport && (
                <CharacterSupportSection data={d.characterSupport as { title: string; description: string; examples: { label: string; text: string }[] }} />
              )}
              {d.usageExample && (
                <UsageExampleSection data={d.usageExample as { title: string; steps: string[]; useCases: string }} />
              )}
            </>
          );
        })()}

        {/* Footer */}
        <Footer locale={locale} dict={dict} />
      </main>
    </>
  );
}


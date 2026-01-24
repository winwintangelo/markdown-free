import { Hero } from "@/components/hero";
import { UploadCard } from "@/components/upload-card";
import { PasteArea } from "@/components/paste-area";
import { ExportRow } from "@/components/export-row";
import { PreviewCard } from "@/components/preview-card";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LanguageBanner } from "@/components/language-banner";
import { LocaleTracker } from "@/components/locale-tracker";
import { EngagementTracker } from "@/components/engagement-tracker";
import { ConverterProvider } from "@/hooks/use-converter";
import { getDictionary } from "@/i18n";

// JSON-LD Schema for SEO (WebApplication + SoftwareApplication for LLM discoverability)
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["WebApplication", "SoftwareApplication"],
      "@id": "https://www.markdown.free/#app",
      name: "Markdown Free",
      alternateName: "Markdown to PDF Converter",
      url: "https://www.markdown.free",
      description:
        "Free online tool to convert Markdown files to PDF, DOCX, HTML, and TXT. No signup required, privacy-friendly, runs in browser.",
      applicationCategory: ["DeveloperApplication", "UtilityApplication"],
      operatingSystem: "Any (Web Browser)",
      browserRequirements: "Requires JavaScript",
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
        url: "https://www.markdown.free",
      },
      screenshot: "https://www.markdown.free/og-image.svg",
      softwareHelp: {
        "@type": "WebPage",
        url: "https://www.markdown.free/faq",
      },
      keywords: "markdown, pdf, docx, converter, free, online, no signup, privacy",
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Is this Markdown to PDF converter really free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes, Markdown Free is 100% free with no hidden costs, premium tiers, or signup requirements.",
          },
        },
        {
          "@type": "Question",
          name: "Do you store or log my Markdown files?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Your files are processed temporarily in memory during conversion and immediately discarded. We never store your content on disk or in any database.",
          },
        },
        {
          "@type": "Question",
          name: "Do you track me or use cookies?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "We don't use advertising trackers, sell your data, or track you across websites. We may use privacy-respecting analytics but never log file contents or personal information.",
          },
        },
        {
          "@type": "Question",
          name: "Which formats does Markdown Free support?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Input: .md, .markdown, .txt files (up to 5MB). Output: PDF, HTML, TXT. Supports GitHub Flavored Markdown.",
          },
        },
        {
          "@type": "Question",
          name: "Is the conversion secure?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. All connections use HTTPS. Markdown preview renders client-side. PDF generation is server-side but content is never persisted. All HTML is XSS-sanitized.",
          },
        },
      ],
    },
  ],
};

export default function Home() {
  const dict = getDictionary("en");
  
  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <Header locale="en" dict={dict} />
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Engagement tracking (scroll depth, time on page, drag intent) */}
      <EngagementTracker />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-10">
        {/* Hero Section */}
        <Hero locale="en" dict={dict} />

        {/* Main Content */}
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {/* Upload Card */}
          <UploadCard locale="en" dict={dict} />

          {/* Paste Area (collapsible) */}
          <PasteArea locale="en" dict={dict} />

          {/* Export Buttons Row */}
          <ExportRow locale="en" dict={dict} />

          {/* Preview Card */}
          <PreviewCard locale="en" dict={dict} />
        </section>

        {/* Footer */}
        <Footer locale="en" dict={dict} />
      </main>
      <LanguageBanner currentLocale="en" dict={dict} />
    </ConverterProvider>
  );
}

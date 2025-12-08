import { Hero } from "@/components/hero";
import { UploadCard } from "@/components/upload-card";
import { PasteArea } from "@/components/paste-area";
import { ExportRow } from "@/components/export-row";
import { PreviewCard } from "@/components/preview-card";
import { Footer } from "@/components/footer";

// JSON-LD Schema for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Markdown Free",
      url: "https://www.markdown.free",
      description:
        "Free, privacy-friendly Markdown to PDF, HTML and TXT converter. No signup, no ad trackers, files never stored.",
      applicationCategory: "UtilityApplication",
      operatingSystem: "Any (Web Browser)",
      browserRequirements: "Requires JavaScript",
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
  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pb-16 pt-10">
        {/* Hero Section */}
        <Hero />

        {/* Main Content */}
        <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
          {/* Upload Card */}
          <UploadCard />

          {/* Paste Area (collapsible) */}
          <PasteArea />

          {/* Export Buttons Row */}
          <ExportRow />

          {/* Preview Card */}
          <PreviewCard />
        </section>

        {/* Footer */}
        <Footer />
      </main>
    </>
  );
}


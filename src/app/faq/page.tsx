import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { getDictionary } from "@/i18n";

const siteUrl = "https://www.markdown.free";

export const metadata: Metadata = {
  title: "FAQ - Frequently Asked Questions | Markdown Free",
  description:
    "Common questions about Markdown Free: How to convert Markdown to PDF, DOCX, HTML. Is it free? Is it secure? File formats, privacy, and more.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "FAQ - Frequently Asked Questions | Markdown Free",
    description:
      "Common questions about Markdown Free: How to convert Markdown to PDF, DOCX, HTML. Is it free? Is it secure?",
    url: `${siteUrl}/faq`,
    type: "website",
  },
};

// Extended FAQ with more natural language questions for SEO/LLM discoverability
const extendedFaq = [
  {
    question: "How do I convert a README.md to PDF?",
    answer:
      "Simply drag and drop your README.md file onto the upload area, or click 'choose file' to select it. Once uploaded, click the 'To PDF' button to download your converted PDF. The entire process takes seconds.",
  },
  {
    question: "Is this Markdown to PDF converter really free?",
    answer:
      "Yes, Markdown Free is 100% free with no hidden costs, premium tiers, or signup requirements. You can convert unlimited files without creating an account.",
  },
  {
    question: "Can I convert Markdown to Word document (DOCX)?",
    answer:
      "Yes! Markdown Free supports exporting to DOCX format. Upload your Markdown file and click 'To DOCX' to get a Word-compatible document that preserves formatting, headings, and code blocks.",
  },
  {
    question: "Do you store or log my Markdown files?",
    answer:
      "No. Your files are processed temporarily in memory during conversion and immediately discarded. We never store your content on disk or in any database. Your documents remain private.",
  },
  {
    question: "What file formats does Markdown Free support?",
    answer:
      "Input formats: .md, .markdown, .txt files (up to 5MB). Output formats: PDF, DOCX (Microsoft Word), HTML, and plain TXT. We support GitHub Flavored Markdown including tables, task lists, and code blocks.",
  },
  {
    question: "Is the conversion secure?",
    answer:
      "Yes. All connections use HTTPS encryption. Markdown preview renders in your browser (client-side). PDF and DOCX generation happens on secure servers, but content is never stored. All HTML output is XSS-sanitized for security.",
  },
  {
    question: "Do you track me or use cookies?",
    answer:
      "We don't use advertising trackers, sell your data, or track you across websites. We use privacy-respecting analytics (Umami) that doesn't use cookies and never logs file contents or personal information.",
  },
  {
    question: "Can I convert multiple files at once?",
    answer:
      "Currently, Markdown Free processes one file at a time. For multiple files, simply upload and convert each one individually. Each conversion is instant, so batch processing is quick.",
  },
  {
    question: "What is GitHub Flavored Markdown?",
    answer:
      "GitHub Flavored Markdown (GFM) extends standard Markdown with extra features commonly used on GitHub: tables, task lists with checkboxes, strikethrough text, fenced code blocks with syntax highlighting, and automatic URL linking.",
  },
  {
    question: "Does the PDF preserve code syntax highlighting?",
    answer:
      "Yes! Code blocks in your Markdown are properly formatted in the PDF output with appropriate styling. While the PDF uses a clean, readable style rather than colorful syntax highlighting, code is clearly distinguished from regular text.",
  },
  {
    question: "What's the maximum file size I can upload?",
    answer:
      "The maximum file size is 5MB. This is more than enough for most Markdown documents, README files, and documentation. If you have a larger file, consider splitting it into smaller sections.",
  },
  {
    question: "Can I use this on mobile devices?",
    answer:
      "Yes! Markdown Free is fully responsive and works on smartphones and tablets. You can upload files, paste Markdown, and download converted files on any device with a modern web browser.",
  },
  {
    question: "Is there an API for programmatic conversion?",
    answer:
      "Currently, Markdown Free is a web-based tool without a public API. For programmatic Markdown conversion, consider tools like Pandoc or markdown-pdf. Our tool is optimized for quick, manual conversions.",
  },
  {
    question: "Why use Markdown Free instead of other converters?",
    answer:
      "Markdown Free is completely free with no signup, respects your privacy by not storing files, supports multiple output formats (PDF, DOCX, HTML, TXT), and works in multiple languages. Many alternatives require accounts, have conversion limits, or store your data.",
  },
];

// JSON-LD for FAQ page
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: extendedFaq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function FAQPage() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <Header locale="en" dict={dict} />
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-10">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/" className="hover:text-emerald-600">
            Home
          </Link>
          <span className="mx-2">›</span>
          <span className="text-slate-900">FAQ</span>
        </nav>

        {/* Page Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Everything you need to know about converting Markdown to PDF, DOCX,
            HTML, and TXT with Markdown Free.
          </p>
        </header>

        {/* FAQ List */}
        <section className="space-y-6">
          {extendedFaq.map((item, index) => (
            <article
              key={index}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-900">
                {item.question}
              </h2>
              <p className="mt-3 text-slate-600 leading-relaxed">
                {item.answer}
              </p>
            </article>
          ))}
        </section>

        {/* CTA Section */}
        <section className="mt-12 rounded-xl bg-emerald-50 p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            Ready to convert your Markdown?
          </h2>
          <p className="mt-2 text-slate-600">
            No signup required. Just drag, drop, and download.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700 transition-colors"
          >
            Start Converting
          </Link>
        </section>

        {/* Footer */}
        <div className="mt-12">
          <Footer locale="en" dict={dict} />
        </div>
      </main>
    </ConverterProvider>
  );
}

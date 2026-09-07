import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Markdown to HTML Converter – Free & Instant | Markdown Free",
  description:
    "Convert Markdown to clean HTML right in your browser — instant, styled, self-contained. Free, no signup, and your file is never uploaded.",
  keywords: [
    "convert markdown to html",
    "markdown to html",
    "md to html",
    "markdown to html online",
    "markdown html converter",
    "markdown to html free",
  ],
  alternates: {
    canonical: "https://www.markdown.free/markdown-to-html",
  },
  openGraph: {
    title: "Markdown to HTML Converter – Free & Instant",
    description:
      "Turn your .md file into a clean, self-contained HTML page — entirely in your browser. Free, private, instant download.",
    url: "https://www.markdown.free/markdown-to-html",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Markdown Free — Convert Markdown to PDF, Word (DOCX), Image (PNG), EPUB, HTML",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown to HTML Converter – Free & Instant",
    description:
      "Turn your .md file into a clean, self-contained HTML page — entirely in your browser. Free, private, instant download.",
    images: ["/og-image.png"],
  },
};

const faq = [
  {
    question: "Is this Markdown to HTML converter free?",
    answer:
      "Yes! Markdown Free is 100% free with no hidden costs, premium tiers, credit packs, or signup requirements.",
  },
  {
    question: "Does my Markdown get uploaded to a server?",
    answer:
      "No. HTML conversion runs entirely in your browser — your Markdown never leaves your device. That's also why the download is instant.",
  },
  {
    question: "What kind of HTML do I get?",
    answer:
      "A single self-contained .html file with clean embedded styling that matches the preview. Open it in any browser, attach it to an email, or copy the markup into your own site or CMS.",
  },
  {
    question: "Are tables, code blocks, and task lists supported?",
    answer:
      "Yes. GitHub Flavored Markdown is fully supported — tables, fenced code blocks, task-list checkboxes, blockquotes, and links all convert to proper HTML elements.",
  },
  {
    question: "Is the generated HTML safe to publish?",
    answer:
      "Yes. All output is sanitized with GitHub's HTML schema (rehype-sanitize), so script tags and other dangerous markup are stripped before the file is generated.",
  },
  {
    question: "Is there a file size limit?",
    answer:
      "Documents up to 1MB of Markdown are supported — that covers virtually any real-world README, article, or documentation file.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "en",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function MarkdownToHtmlPage() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Convert Markdown to HTML – Free Online Tool
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Turn your Markdown into a clean, self-contained HTML page — rendered
            entirely in your browser, downloaded instantly. Perfect for
            publishing a README as a web page, pasting formatted content into a
            CMS, or sharing a document anyone can open.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-sky-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-800"
          >
            Start Converting <span aria-hidden="true">&rarr;</span>
          </Link>
        </section>

        {/* Why HTML Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Why Convert Markdown to HTML?
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-sky-600">&#10003;</span>
              <span><strong>Publish anywhere</strong> – HTML is the web&apos;s native format. Drop the output into any website, blog engine, or CMS that accepts markup.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sky-600">&#10003;</span>
              <span><strong>Self-contained file</strong> – styles are embedded, so the .html file looks right on its own: no external CSS, no build step, no dependencies.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sky-600">&#10003;</span>
              <span><strong>Instant &amp; private</strong> – conversion happens 100% in your browser. Nothing is uploaded, and the download is immediate.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-sky-600">&#10003;</span>
              <span><strong>Sanitized output</strong> – the HTML is cleaned with GitHub&apos;s sanitization schema, so it&apos;s safe to publish as-is.</span>
            </li>
          </ul>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            How to Convert Markdown to HTML
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">1</span>
              <div>
                <h3 className="font-medium text-slate-900">Upload or Paste</h3>
                <p className="text-sm text-slate-600">Drag and drop your .md file, or paste Markdown text directly.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">2</span>
              <div>
                <h3 className="font-medium text-slate-900">Preview</h3>
                <p className="text-sm text-slate-600">See your formatted document in real-time before converting.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-700">3</span>
              <div>
                <h3 className="font-medium text-slate-900">Export to HTML</h3>
                <p className="text-sm text-slate-600">Open <strong>More formats</strong> and click &ldquo;To HTML&rdquo; — your .html file downloads instantly.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Use Cases */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Perfect For
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Blogs &amp; CMS Content</h3>
              <p className="text-sm text-slate-600">Write in Markdown, then paste clean HTML into WordPress, Ghost, or any editor that accepts markup.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">READMEs as Web Pages</h3>
              <p className="text-sm text-slate-600">Turn project documentation into a standalone page you can host anywhere — no static-site generator needed.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Email-friendly Documents</h3>
              <p className="text-sm text-slate-600">Send a formatted document as an attachment that opens in any browser on any device.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Quick Snippet Markup</h3>
              <p className="text-sm text-slate-600">Convert a table or formatted section to HTML elements without hand-writing tags.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faq.map((item) => (
              <details key={item.question} className="rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-slate-900">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* All-formats hub cross-link */}
        <section className="mb-12 rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <h2 className="mb-2 text-xl font-semibold text-slate-900">
            Need a different format?
          </h2>
          <p className="text-slate-600">
            The same converter also exports PDF, Word (DOCX), PNG/JPG images,
            EPUB, and plain text. See the{" "}
            <Link href="/markdown-converter" className="font-medium text-sky-700 hover:text-sky-800 hover:underline">
              full Markdown converter overview
            </Link>{" "}
            for what each format preserves.
          </p>
        </section>

        {/* Related tool suite cross-links */}
        <RelatedTools locale="en" />

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-sky-700 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-sky-800"
          >
            Convert Markdown to HTML Now <span aria-hidden="true">&rarr;</span>
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Free &bull; No signup &bull; Nothing uploaded
          </p>
        </section>
      </main>
      <Footer locale="en" dict={dict} />
    </ConverterProvider>
  );
}

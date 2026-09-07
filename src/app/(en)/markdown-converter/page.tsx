import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Markdown Converter – PDF, Word, Image, HTML | Markdown Free",
  description:
    "Convert Markdown to PDF, Word (DOCX), PNG image, EPUB, HTML, or TXT — genuinely free. No signup, no credit packs, no watermarks, files never stored.",
  keywords: [
    "markdown converter",
    "markdown converter online",
    "free markdown converter",
    "markdown converter to pdf",
    "markdown converter to word",
    "markdown file converter",
    "md converter",
  ],
  alternates: {
    canonical: "https://www.markdown.free/markdown-converter",
  },
  openGraph: {
    title: "Markdown Converter – PDF, Word, Image, EPUB, HTML & TXT",
    description:
      "One genuinely free Markdown converter for every format you need. No signup, no credits, no watermarks — files are never stored.",
    url: "https://www.markdown.free/markdown-converter",
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
    title: "Markdown Converter – PDF, Word, Image, EPUB, HTML & TXT",
    description:
      "One genuinely free Markdown converter for every format you need. No signup, no credits, no watermarks — files are never stored.",
    images: ["/og-image.png"],
  },
};

// The honest conversion matrix — the page's information gain. Every claim is
// verifiable in the product (client vs server split matches src/lib/export-*.ts
// + src/app/api/convert/*; the 1MB limit is MAX_FILE_SIZE in src/lib/utils.ts).
const formats = [
  {
    name: "PDF",
    href: "/",
    label: "Markdown to PDF",
    where: "On our server (in-memory, discarded right after)",
    bestFor: "Sharing final documents: reports, READMEs, homework, contracts",
  },
  {
    name: "Word (DOCX)",
    href: "/markdown-to-word",
    label: "Markdown to Word",
    where: "On our server (in-memory, discarded right after)",
    bestFor: "Documents someone else needs to edit — opens in Word, Google Docs, LibreOffice",
  },
  {
    name: "Image (PNG / JPG)",
    href: "/markdown-to-png",
    label: "Markdown to PNG",
    where: "100% in your browser — nothing uploaded",
    bestFor: "Chat apps, social posts, slides — formatted text as a crisp image",
  },
  {
    name: "EPUB",
    href: "/markdown-to-epub",
    label: "Markdown to EPUB",
    where: "On our server (in-memory, discarded right after)",
    bestFor: "Reading long documents on e-readers and phones",
  },
  {
    name: "HTML",
    href: "/markdown-to-html",
    label: "Markdown to HTML",
    where: "100% in your browser — nothing uploaded",
    bestFor: "Publishing to a website, blog, or CMS; self-contained web pages",
  },
  {
    name: "Plain text (TXT)",
    href: "/",
    label: "Markdown to TXT",
    where: "100% in your browser — nothing uploaded",
    bestFor: "Stripping formatting for pasting into plain-text systems",
  },
];

const faq = [
  {
    question: "Is this Markdown converter really free?",
    answer:
      "Yes — genuinely free. No signup, no credit packs, no daily conversion caps, no watermarks, and no premium tier hiding the useful features. Many “free” markdown converters meter you after a couple of files; this one doesn't.",
  },
  {
    question: "Which output formats are supported?",
    answer:
      "Six: PDF, Word (DOCX), PNG or JPG image, EPUB, HTML, and plain text (TXT). Each format has its own export button on the converter.",
  },
  {
    question: "Do my files get uploaded to a server?",
    answer:
      "HTML, TXT, and PNG/JPG conversions run entirely in your browser — nothing is uploaded at all. PDF, Word, and EPUB conversions are processed on our server in memory and immediately discarded; your content is never stored.",
  },
  {
    question: "Can I convert other formats into Markdown?",
    answer:
      "No — this tool converts one direction: from Markdown to other formats. If you need HTML-to-Markdown or Word-to-Markdown, a tool like Pandoc covers the reverse direction.",
  },
  {
    question: "Will my tables, code blocks, and checklists survive conversion?",
    answer:
      "Yes. GitHub Flavored Markdown — tables, fenced code blocks, task lists, blockquotes, links — is preserved with proper formatting in every output format.",
  },
  {
    question: "Does the Word output open in Microsoft Word?",
    answer:
      "Yes. The converter produces standard .docx files that open in Microsoft Word, Google Docs, and LibreOffice with headings, tables, and lists mapped to proper Word styles.",
  },
  {
    question: "What's the file size limit?",
    answer:
      "Documents up to 1MB of Markdown are supported — roughly 150,000 words, which covers virtually any real-world document.",
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

export default function MarkdownConverterPage() {
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
            Free Online Markdown Converter
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            One converter, six formats: turn any Markdown file into PDF, Word
            (DOCX), PNG/JPG image, EPUB, HTML, or plain text. No signup, no
            credit packs, no watermarks — and your files are never stored.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Start Converting <span aria-hidden="true">&rarr;</span>
          </Link>
        </section>

        {/* The conversion matrix */}
        <section className="mb-12">
          <h2 className="mb-2 text-xl font-semibold text-slate-900">
            Every Format, Honestly Explained
          </h2>
          <p className="mb-4 text-slate-600">
            Where each conversion actually runs, and what each format is best at:
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="px-4 py-3 font-semibold">Format</th>
                  <th className="px-4 py-3 font-semibold">Where it converts</th>
                  <th className="px-4 py-3 font-semibold">Best for</th>
                </tr>
              </thead>
              <tbody>
                {formats.map((f) => (
                  <tr key={f.name} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <Link href={f.href} className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline">
                        {f.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{f.where}</td>
                    <td className="px-4 py-3 text-slate-600">{f.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* What's preserved — and what isn't (the honesty section) */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            What&apos;s Preserved — and What Isn&apos;t
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium text-slate-900">Converts correctly in every format</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>&#10003; GFM tables</li>
                <li>&#10003; Fenced code blocks</li>
                <li>&#10003; Headings, bold, italic, links</li>
                <li>&#10003; Ordered &amp; unordered lists</li>
                <li>&#10003; Task-list checkboxes</li>
                <li>&#10003; Blockquotes</li>
                <li>&#10003; Images with absolute URLs</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-medium text-slate-900">Not supported (yet) — so you know upfront</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li>&#9888;&#65039; LaTeX math — rendered as plain text</li>
                <li>&#9888;&#65039; Mermaid diagrams — rendered as code blocks</li>
                <li>&#9888;&#65039; Obsidian [[wikilinks]] — rendered as plain text</li>
                <li>&#9888;&#65039; Local relative image paths — use absolute URLs</li>
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                Most &ldquo;universal&rdquo; converters have the same gaps — they just don&apos;t say so.
              </p>
            </div>
          </div>
        </section>

        {/* Actually free */}
        <section className="mb-12 rounded-2xl border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Free the Boring Way
          </h2>
          <p className="mb-4 text-slate-600">
            Plenty of &ldquo;free markdown converters&rdquo; meter you: signup walls,
            credit packs, daily caps, watermarked output. This one is just free:
          </p>
          <ul className="grid gap-2 text-slate-700 sm:grid-cols-2">
            <li>&#10003; No account or signup</li>
            <li>&#10003; No credit packs or daily limits</li>
            <li>&#10003; No watermarks on any format</li>
            <li>&#10003; Files never stored anywhere</li>
            <li>&#10003; Works on any device with a browser</li>
            <li>&#10003; Documents up to 1MB (~150,000 words)</li>
          </ul>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            How It Works
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">1</span>
              <div>
                <h3 className="font-medium text-slate-900">Upload or Paste</h3>
                <p className="text-sm text-slate-600">Drag and drop your .md file, or paste Markdown text directly.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">2</span>
              <div>
                <h3 className="font-medium text-slate-900">Preview</h3>
                <p className="text-sm text-slate-600">See your formatted document in real-time — what you preview is what every format exports.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">3</span>
              <div>
                <h3 className="font-medium text-slate-900">Pick Your Format</h3>
                <p className="text-sm text-slate-600">To PDF, To DOCX, To Image — or open More formats for EPUB, HTML, and TXT. Downloads start immediately.</p>
              </div>
            </li>
          </ol>
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

        {/* Related tool suite cross-links */}
        <RelatedTools locale="en" />

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Convert Your Markdown Now <span aria-hidden="true">&rarr;</span>
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Free &bull; No signup &bull; Six formats
          </p>
        </section>
      </main>
      <Footer locale="en" dict={dict} />
    </ConverterProvider>
  );
}

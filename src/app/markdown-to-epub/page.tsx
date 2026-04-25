import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Markdown to EPUB Converter – Free, Private, No Signup | Markdown Free",
  description: "Convert Markdown files to EPUB ebooks instantly. 100% free, no signup required, no ads. Perfect for reading on Kindle, Apple Books, Kobo, and other e-readers.",
  alternates: {
    canonical: "https://www.markdown.free/markdown-to-epub",
  },
  openGraph: {
    title: "Markdown to EPUB Converter – Free Ebook Export",
    description: "Convert your .md files to EPUB ebook format. Free, private, instant download. Read on any e-reader.",
    url: "https://www.markdown.free/markdown-to-epub",
    type: "website",
    locale: "en_US",
  },
};

export default function MarkdownToEpubPage() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Convert Markdown to EPUB – Free Online Tool
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Transform your Markdown files into EPUB ebooks. Perfect for reading
            documentation on your Kindle, Apple Books, Kobo, or any e-reader.
            Auto-generates table of contents and chapters from your headings.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
          >
            Start Converting <span aria-hidden="true">&rarr;</span>
          </Link>
        </section>

        {/* Why EPUB Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Why Convert Markdown to EPUB?
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-purple-500">&#10003;</span>
              <span><strong>Read anywhere</strong> – EPUB works on Kindle, Apple Books, Kobo, Google Play Books, and all major e-readers.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-500">&#10003;</span>
              <span><strong>Reflowable text</strong> – Unlike PDF, EPUB content adapts to screen size, font preferences, and reading modes.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-500">&#10003;</span>
              <span><strong>Auto-generated chapters</strong> – Your Markdown headings become navigable chapters with a table of contents.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-purple-500">&#10003;</span>
              <span><strong>Offline reading</strong> – Download once, read anywhere without an internet connection.</span>
            </li>
          </ul>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            How to Convert Markdown to EPUB
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">1</span>
              <div>
                <h3 className="font-medium text-slate-900">Upload or Paste</h3>
                <p className="text-sm text-slate-600">Drag and drop your .md file, or paste Markdown text directly.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">2</span>
              <div>
                <h3 className="font-medium text-slate-900">Preview</h3>
                <p className="text-sm text-slate-600">See your formatted document in real-time before converting.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">3</span>
              <div>
                <h3 className="font-medium text-slate-900">Export to EPUB</h3>
                <p className="text-sm text-slate-600">Click &ldquo;To EPUB&rdquo; and download your ebook instantly.</p>
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
              <h3 className="font-medium text-slate-900">Technical Documentation</h3>
              <p className="text-sm text-slate-600">Read API docs, README files, and technical guides on your e-reader during commutes.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Obsidian & Notion Notes</h3>
              <p className="text-sm text-slate-600">Export your note vault to EPUB for comfortable offline reading.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Blog Posts & Articles</h3>
              <p className="text-sm text-slate-600">Compile Markdown blog posts into an ebook for distribution.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Course Material</h3>
              <p className="text-sm text-slate-600">Convert lecture notes and study materials into portable ebooks.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Is this Markdown to EPUB converter free?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Yes! Markdown Free is 100% free with no hidden costs, premium tiers, or signup requirements.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Will my EPUB work on Kindle?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Yes. Modern Kindle devices support EPUB natively. For older models, you can use the &ldquo;Send to Kindle&rdquo; feature or Calibre to convert EPUB to MOBI.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                How are chapters generated?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Markdown Free automatically splits your document into chapters at H1 headings (or H2 if no H1 exists) and generates a navigable table of contents.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Are my files stored on your servers?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                No. Your files are processed in memory and immediately discarded after conversion. We never store your content.
              </p>
            </details>
          </div>
        </section>

        {/* Related Tools */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-slate-900">Related Tools</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="text-emerald-700 hover:text-emerald-800 hover:underline">
              Markdown to PDF
            </Link>
            <Link href="/markdown-to-docx" className="text-emerald-700 hover:text-emerald-800 hover:underline">
              Markdown to DOCX
            </Link>
            <Link href="/readme-to-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
              README to PDF
            </Link>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-purple-700"
          >
            Convert Markdown to EPUB Now <span aria-hidden="true">&rarr;</span>
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Free &bull; No signup &bull; Instant download
          </p>
        </section>
      </main>
      <Footer locale="en" dict={dict} />
    </ConverterProvider>
  );
}

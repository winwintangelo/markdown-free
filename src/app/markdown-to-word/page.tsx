import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";

export const metadata: Metadata = {
  title: "Markdown to Word (DOCX) Converter – Free Online Tool | Markdown Free",
  description: "Convert Markdown to Word documents (DOCX) instantly. 100% free, no signup required, no ads. Your files are processed securely and never stored.",
  keywords: [
    "markdown to word",
    "markdown to docx",
    "md to word",
    "convert markdown to word",
    "markdown word converter",
    "md to docx online",
    "free markdown to word",
  ],
  alternates: {
    canonical: "https://www.markdown.free/markdown-to-word",
    languages: {
      "en": "/markdown-to-word",
      "id": "/id/markdown-ke-word",
      "ja": "/ja/markdown-word-henkan",
      "es": "/es/markdown-a-word",
      "ko": "/ko/markdown-word-byeonhwan",
      "vi": "/vi/markdown-sang-word",
      "zh-Hans": "/zh-Hans/markdown-zhuanhuan-word",
      "zh-Hant": "/zh-Hant/markdown-word-zhuanhuan",
      "it": "/it/markdown-in-word",
      "x-default": "/markdown-to-word",
    },
  },
  openGraph: {
    title: "Markdown to Word (DOCX) Converter – Free Online Tool",
    description: "Convert your .md files to Microsoft Word format. Free, private, instant download.",
    url: "https://www.markdown.free/markdown-to-word",
    type: "website",
    locale: "en_US",
  },
};

export default function MarkdownToWordPage() {
  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Convert Markdown to Word (DOCX) – Free Online Tool
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Transform your Markdown files into professional Microsoft Word documents.
            Perfect for sharing documentation with non-technical colleagues, submitting
            reports, or creating editable documents from your notes.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Start Converting →
          </Link>
        </section>

        {/* Why Word/DOCX Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Why Convert Markdown to Word?
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Universal compatibility</strong> – Word documents (.docx) work everywhere, from Microsoft Office to Google Docs to LibreOffice.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Editable output</strong> – Unlike PDF, Word/DOCX files can be easily edited by recipients.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Professional formatting</strong> – Tables, code blocks, and headings are preserved as proper Word styles.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Business ready</strong> – Perfect for submitting documentation, reports, or proposals in corporate environments.</span>
            </li>
          </ul>
        </section>

        {/* Who It's For */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Who Uses Markdown to Word Conversion?
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Students</h3>
              <p className="text-sm text-slate-600">Convert thesis drafts and assignments from Markdown to Word for submission.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Developers</h3>
              <p className="text-sm text-slate-600">Turn README files and technical docs into Word specs for non-technical stakeholders.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Writers</h3>
              <p className="text-sm text-slate-600">Export drafts written in Markdown to Word for editing and collaboration.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Teams</h3>
              <p className="text-sm text-slate-600">Share Markdown documentation as Word files with colleagues who prefer Office.</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            How to Convert Markdown to Word (DOCX)
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">1</span>
              <div>
                <h3 className="font-medium text-slate-900">Upload or Paste</h3>
                <p className="text-sm text-slate-600">Drag and drop your .md file, or paste Markdown text directly.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">2</span>
              <div>
                <h3 className="font-medium text-slate-900">Preview</h3>
                <p className="text-sm text-slate-600">See your formatted document in real-time before converting.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">3</span>
              <div>
                <h3 className="font-medium text-slate-900">Export to Word</h3>
                <p className="text-sm text-slate-600">Click "To DOCX" and download your Word document instantly.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Privacy & Security */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Privacy & Security
          </h2>
          <ul className="space-y-2 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Files processed temporarily in memory</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>Never stored on our servers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>HTTPS encrypted connection</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-emerald-500">✓</span>
              <span>No account required</span>
            </li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Is this Markdown to Word converter free?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Yes! Markdown Free is 100% free with no hidden costs, premium tiers, or signup requirements.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                What's the difference between Word and DOCX?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                DOCX is the file format used by Microsoft Word since 2007. When we say "Word document," we mean a .docx file that opens in Word, Google Docs, LibreOffice, and other word processors.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Will my converted file open in Microsoft Word?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Yes, the generated DOCX files are compatible with Microsoft Word 2007 and later, Google Docs, LibreOffice, and other word processors that support the .docx format.
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
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Does it preserve formatting like tables and code blocks?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Yes! Tables, code blocks, headings, lists, and other Markdown formatting are converted to proper Word styles.
              </p>
            </details>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Convert Markdown to Word Now →
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Free • No signup • Instant download
          </p>
        </section>
      </main>
      <Footer locale="en" />
    </ConverterProvider>
  );
}

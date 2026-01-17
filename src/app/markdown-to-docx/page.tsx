import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";

export const metadata: Metadata = {
  title: "Markdown to DOCX Converter – Free, Private, No Signup | Markdown Free",
  description: "Convert Markdown files to Word DOCX documents instantly. 100% free, no signup required, no ads. Your files are processed securely and never stored.",
  alternates: {
    canonical: "https://www.markdown.free/markdown-to-docx",
  },
  openGraph: {
    title: "Markdown to DOCX Converter – Free Word Document Export",
    description: "Convert your .md files to Microsoft Word DOCX format. Free, private, instant download.",
    url: "https://www.markdown.free/markdown-to-docx",
    type: "website",
    locale: "en_US",
  },
};

export default function MarkdownToDocxPage() {
  return (
    <ConverterProvider>
      <Header locale="en" />
      <LocaleTracker locale="en" />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Convert Markdown to DOCX (Word) – Free Online Tool
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

        {/* Why DOCX Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Why Convert Markdown to DOCX?
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Universal compatibility</strong> – Word documents work everywhere, from Microsoft Office to Google Docs to LibreOffice.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-500">✓</span>
              <span><strong>Editable output</strong> – Unlike PDF, DOCX files can be easily edited by recipients.</span>
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

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            How to Convert Markdown to Word DOCX
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
                <h3 className="font-medium text-slate-900">Export to DOCX</h3>
                <p className="text-sm text-slate-600">Click "To DOCX" and download your Word document instantly.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Features */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            What Gets Converted
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Text Formatting</h3>
              <p className="text-sm text-slate-600">Bold, italic, strikethrough, inline code</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Headings</h3>
              <p className="text-sm text-slate-600">H1-H6 mapped to Word heading styles</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Lists</h3>
              <p className="text-sm text-slate-600">Ordered, unordered, and nested lists</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Tables</h3>
              <p className="text-sm text-slate-600">GitHub-style markdown tables</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Code Blocks</h3>
              <p className="text-sm text-slate-600">Fenced code blocks with syntax hints</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Links & Blockquotes</h3>
              <p className="text-sm text-slate-600">Hyperlinks and quoted text</p>
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
                Is this Markdown to DOCX converter free?
              </summary>
              <p className="mt-2 text-sm text-slate-600">
                Yes! Markdown Free is 100% free with no hidden costs, premium tiers, or signup requirements.
              </p>
            </details>
            <details className="rounded-xl border border-slate-200 bg-white p-4">
              <summary className="cursor-pointer font-medium text-slate-900">
                Will my converted DOCX open in Microsoft Word?
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
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Convert Markdown to DOCX Now →
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

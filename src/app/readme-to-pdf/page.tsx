import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "README.md to PDF — Free, No Signup (2026) | Markdown Free",
  description:
    "Convert any GitHub README.md to a polished PDF in seconds. Drag-and-drop .md, download PDF — free, no signup, no install, no watermark. GFM tables, checklists, and code blocks preserved. Updated for 2026.",
  keywords: [
    "readme to pdf",
    "readme.md to pdf",
    "github readme to pdf",
    "convert readme to pdf",
    "download github readme as pdf",
    "how to download github readme as pdf",
    "readme file to pdf",
    "markdown readme pdf",
  ],
  alternates: {
    canonical: "/readme-to-pdf",
  },
  openGraph: {
    title: "README.md to PDF — Free, No Signup (2026)",
    description:
      "Free GitHub README→PDF converter. Drag-and-drop .md, download PDF. No signup, no install.",
    locale: "en_US",
  },
};

const faq = [
  { q: "How do I convert a GitHub README to PDF?", a: "Open Markdown Free, drag the README.md file into the upload area (or paste its contents), preview the rendered output, then click Export PDF. No signup, no install, takes about 10 seconds." },
  { q: "How do I download a GitHub README as PDF?", a: "Open the repo's README.md on GitHub, click \"Raw\", save the page as a .md file, then upload it to Markdown Free and export to PDF. The whole flow stays in your browser." },
  { q: "Is the README to PDF converter free?", a: "Yes. Markdown Free is 100% free with no premium tier, no signup, no usage caps, and no watermark on the exported PDF." },
  { q: "Can I convert README.md to PDF without signing up?", a: "Yes. Markdown Free does not require an account. Files are processed in your browser (HTML/TXT) or in serverless memory (PDF/DOCX/EPUB) and never stored." },
  { q: "Are images from my README included in the PDF?", a: "Yes for absolute URLs (https://...). Relative image paths from a repo (./images/foo.png) won't resolve outside GitHub — replace them with the raw.githubusercontent.com URL before converting." },
  { q: "Can I convert CHANGELOG.md, CONTRIBUTING.md, or other Markdown files?", a: "Yes. Any .md or .markdown file works — README.md, CHANGELOG.md, CONTRIBUTING.md, /docs files, all of them." },
  { q: "Is there a file size limit for README to PDF conversion?", a: "Yes — 5MB per file, which covers virtually every real-world README and documentation file (~750,000 words of plain Markdown)." },
  { q: "Are my README files stored on your servers?", a: "No. PDFs are generated in serverless memory and discarded immediately. HTML and TXT exports are processed entirely in your browser and never leave your machine." },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "en",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function ReadmeToPdfPage() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>Convert README to PDF</h1>

        <p className="lead text-lg text-slate-600">
          Have a GitHub project with a README.md? Turn it into a polished PDF
          for documentation, portfolios, or presentations.
        </p>

        {/* CTA Button */}
        <div className="not-prose my-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Convert Your README
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <h2>Why Convert README to PDF?</h2>
        <ul>
          <li>
            <strong>Offline Documentation</strong> — Share project docs without
            needing internet access
          </li>
          <li>
            <strong>Professional Portfolios</strong> — Showcase your projects in
            a polished format
          </li>
          <li>
            <strong>Presentations</strong> — Embed technical documentation in
            slides
          </li>
          <li>
            <strong>Archival</strong> — Preserve a static version of your
            documentation
          </li>
          <li>
            <strong>Print-ready</strong> — Physical handouts for meetings or
            reviews
          </li>
        </ul>

        <h2>Full GitHub Flavored Markdown Support</h2>
        <p>
          Markdown Free supports all GitHub Flavored Markdown (GFM) features:
        </p>
        <ul>
          <li>✓ Tables</li>
          <li>✓ Checklists / Task lists</li>
          <li>✓ Strikethrough text</li>
          <li>✓ Syntax highlighting for code blocks</li>
          <li>✓ Autolinks</li>
          <li>✓ Emoji shortcodes :smile:</li>
        </ul>

        <h2>How to Convert Your README</h2>
        <ol>
          <li>
            <strong>Download your README</strong> — Open README.md in your
            GitHub repo, click &quot;Raw&quot;, and save the file
          </li>
          <li>
            <strong>Upload to Markdown Free</strong> — Drag and drop the file
            into the upload area
          </li>
          <li>
            <strong>Preview</strong> — Check the live preview to ensure
            formatting is correct
          </li>
          <li>
            <strong>Export</strong> — Click &quot;Export PDF&quot; to download
          </li>
        </ol>

        <h2>Example: Typical README Structure</h2>
        <div className="not-prose my-6 rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-sm text-slate-100">
          <pre className="overflow-x-auto">{`# Project Name

A brief description of what this project does.

## Installation

\`\`\`bash
npm install project-name
\`\`\`

## Usage

\`\`\`javascript
import { myFunction } from 'project-name';
myFunction();
\`\`\`

## Features

- [x] Completed feature
- [ ] Work in progress

## License

MIT`}</pre>
        </div>
        <p>
          This README converts to a beautifully formatted PDF with proper
          headings, styled code blocks with syntax highlighting, and clean
          checklists.
        </p>

        <h2>Frequently Asked Questions</h2>

        {faq.map((item, i) => (
          <div key={i}>
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </div>
        ))}

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Turn your README into professional documentation
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
          >
            Try It Free — No Sign-up
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {/* Trust signals */}
        <div className="not-prose rounded-lg bg-slate-50 p-6">
          <h3 className="mb-3 text-lg font-semibold text-slate-700">
            Privacy First
          </h3>
          <ul className="space-y-2 text-slate-600">
            <li>✓ No account required</li>
            <li>✓ Files processed and immediately deleted</li>
            <li>✓ No data stored in any database</li>
            <li>✓ Secure HTTPS connection</li>
          </ul>
        </div>

        {/* Related Pages */}
        <div className="not-prose border-t border-slate-200 pt-8">
          <h2 className="mb-4 text-lg font-semibold text-slate-700">
            Related Tools
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/"
                className="text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Markdown to PDF — Free Online Converter
              </Link>
            </li>
            <li>
              <Link
                href="/best-markdown-to-pdf-converter-2026"
                className="text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Best Markdown→PDF Converter 2026 (8-tool comparison)
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                About Markdown Free
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale="en" dict={dict} />
    </main>
    </ConverterProvider>
  );
}

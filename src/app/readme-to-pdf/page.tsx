import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "README to PDF | Markdown Free",
  description:
    "Convert your GitHub README.md to a professional PDF. Perfect for documentation, portfolios, and presentations. Free, no sign-up required.",
  keywords: [
    "readme to pdf",
    "readme.pdf",
    "github readme pdf",
    "convert readme to pdf",
    "markdown readme pdf",
    "readme.md to pdf",
  ],
  alternates: {
    canonical: "/readme-to-pdf",
  },
  openGraph: {
    title: "README to PDF | Markdown Free",
    description:
      "Convert your GitHub README.md to a professional PDF. Free, no sign-up required.",
    locale: "en_US",
  },
};

export default function ReadmeToPdfPage() {
  const dict = getDictionary("en");

  return (
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
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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

        <h3>Are images from my README included?</h3>
        <p>
          Yes! Images with absolute URLs (like https://...) are included in the
          PDF. Relative image paths may not render correctly — we recommend
          using full URLs for images in your README.
        </p>

        <h3>Can I convert other Markdown files from my repo?</h3>
        <p>
          Absolutely. CHANGELOG.md, CONTRIBUTING.md, documentation files in
          /docs — any <code>.md</code> file works perfectly.
        </p>

        <h3>Can I customize the PDF styling?</h3>
        <p>
          The PDF uses a professional, readable layout optimized for
          documentation. Custom styling options may be added in future updates.
        </p>

        <h3>Is there a file size limit?</h3>
        <p>
          Yes, files up to 5MB are supported. This covers virtually all README
          files and documentation.
        </p>

        {/* Second CTA */}
        <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="mb-4 text-lg font-medium text-slate-700">
            Turn your README into professional documentation
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
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
                className="text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Markdown to PDF — Free Online Converter
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                About Markdown Free
              </Link>
            </li>
          </ul>
        </div>
      </article>

      <Footer locale="en" dict={dict} />
    </main>
  );
}

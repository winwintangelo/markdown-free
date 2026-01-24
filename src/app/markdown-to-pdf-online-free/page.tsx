import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Free Online Markdown to PDF Converter | Markdown Free",
  description:
    "Convert Markdown to PDF online for free. No installation, no sign-up, works in your browser. Supports GitHub Flavored Markdown, tables, and code blocks.",
  keywords: [
    "markdown to pdf online",
    "markdown to pdf free",
    "online markdown converter",
    "free md to pdf",
    "markdown pdf browser",
    "convert markdown online free",
    "markdown to pdf no download",
  ],
  alternates: {
    canonical: "/markdown-to-pdf-online-free",
  },
  openGraph: {
    title: "Free Online Markdown to PDF Converter | Markdown Free",
    description:
      "Convert Markdown to PDF online for free. No installation, no sign-up.",
    locale: "en_US",
  },
};

export default function OnlineFreePage() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Free Online Markdown to PDF Converter</h1>

          <p className="lead text-lg text-slate-600">
            Convert Markdown to PDF directly in your browser. No software to install,
            no account to create, no email required. Just upload and download.
          </p>

          {/* CTA Button */}
          <div className="not-prose my-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
            >
              Start Converting Now
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <h2>How It Works</h2>
          <ol>
            <li>
              <strong>Upload or paste</strong> — Drag and drop your .md file, or paste Markdown text
            </li>
            <li>
              <strong>Preview</strong> — See your formatted document instantly
            </li>
            <li>
              <strong>Download</strong> — Click &quot;To PDF&quot; and save your file
            </li>
          </ol>
          <p>That&apos;s it. Three steps, no friction.</p>

          <h2>Why Use an Online Converter?</h2>
          <ul>
            <li>
              <strong>No installation</strong> — Works on any device with a browser
            </li>
            <li>
              <strong>No dependencies</strong> — Don&apos;t need Node.js, Pandoc, or LaTeX
            </li>
            <li>
              <strong>Works anywhere</strong> — Windows, Mac, Linux, Chromebook, tablet
            </li>
            <li>
              <strong>Always up to date</strong> — No software updates to manage
            </li>
            <li>
              <strong>Privacy</strong> — Files are processed and immediately deleted
            </li>
          </ul>

          <h2>Features</h2>
          <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Multiple Formats</h3>
              <p className="mt-1 text-sm text-slate-600">
                Export to PDF, DOCX (Word), HTML, or plain text
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">GitHub Markdown</h3>
              <p className="mt-1 text-sm text-slate-600">
                Full GFM support: tables, task lists, strikethrough
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Code Blocks</h3>
              <p className="mt-1 text-sm text-slate-600">
                Formatted code with proper styling
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Live Preview</h3>
              <p className="mt-1 text-sm text-slate-600">
                See your formatted document before downloading
              </p>
            </div>
          </div>

          <h2>Compare: Online vs Desktop Tools</h2>
          <div className="not-prose my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Aspect</th>
                  <th className="px-4 py-3 text-center font-semibold text-emerald-600">Online (Markdown Free)</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-500">Desktop (Pandoc, etc.)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="px-4 py-3">Setup time</td>
                  <td className="px-4 py-3 text-center text-emerald-600">0 seconds</td>
                  <td className="px-4 py-3 text-center text-slate-500">10-30 min</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Works on Chromebook</td>
                  <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                  <td className="px-4 py-3 text-center text-red-500">✗</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Requires command line</td>
                  <td className="px-4 py-3 text-center text-emerald-600">No</td>
                  <td className="px-4 py-3 text-center text-slate-500">Usually</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Live preview</td>
                  <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                  <td className="px-4 py-3 text-center text-slate-500">Varies</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">Best for</td>
                  <td className="px-4 py-3 text-center text-emerald-600">Quick conversions</td>
                  <td className="px-4 py-3 text-center text-slate-500">Batch/automation</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Supported Input Formats</h2>
          <ul>
            <li><code>.md</code> — Standard Markdown files</li>
            <li><code>.markdown</code> — Alternative extension</li>
            <li><code>.txt</code> — Plain text with Markdown formatting</li>
            <li><strong>Paste</strong> — Direct text input</li>
          </ul>

          <h2>Frequently Asked Questions</h2>

          <h3>Is it really free?</h3>
          <p>
            Yes, completely free. No hidden costs, no premium tier, no watermarks.
          </p>

          <h3>Do you store my files?</h3>
          <p>
            No. Files are processed in memory and immediately discarded. 
            We don&apos;t store your documents in any database.
          </p>

          <h3>What&apos;s the file size limit?</h3>
          <p>
            Files up to 5MB are supported.
          </p>

          <h3>Does it work on mobile?</h3>
          <p>
            Yes! The tool is fully responsive and works on phones and tablets.
          </p>

          {/* Second CTA */}
          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">
              No download, no signup, no hassle
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
            >
              Convert Markdown to PDF Now
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
                  Markdown to PDF — Converter Home
                </Link>
              </li>
              <li>
                <Link
                  href="/markdown-to-docx"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Markdown to Word (DOCX)
                </Link>
              </li>
              <li>
                <Link
                  href="/github-readme-to-pdf"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  GitHub README to PDF
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Frequently Asked Questions
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

import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Convert Claude Artifacts to PDF | Export Claude Code | Markdown Free",
  description:
    "Export Claude AI artifacts, code blocks, and responses to PDF. Copy markdown from Claude, paste here, download as PDF. Free, no sign-up required.",
  keywords: [
    "claude artifacts to pdf",
    "export claude to pdf",
    "save claude conversation",
    "claude code to pdf",
    "claude artifacts export",
    "anthropic claude pdf",
    "claude response to pdf",
  ],
  alternates: {
    canonical: "/claude-artifacts-to-pdf",
  },
  openGraph: {
    title: "Convert Claude Artifacts to PDF | Markdown Free",
    description:
      "Export Claude AI artifacts and code blocks to PDF. Free, instant export.",
    locale: "en_US",
  },
};

export default function ClaudeArtifactsToPdfPage() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Convert Claude Artifacts to PDF</h1>

          <p className="lead text-lg text-slate-600">
            Export Claude&apos;s artifacts, code blocks, and markdown responses to PDF.
            Copy from Claude, paste here, and download your formatted document instantly.
          </p>

          {/* CTA Button */}
          <div className="not-prose my-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
            >
              Convert Claude Response Now
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <h2>How to Export Claude Artifacts to PDF</h2>
          <ol>
            <li>
              <strong>Copy the artifact or response</strong> — In Claude, click the copy button on any response or artifact
            </li>
            <li>
              <strong>Paste into Markdown Free</strong> — Go to the converter and paste the content
            </li>
            <li>
              <strong>Click &quot;To PDF&quot;</strong> — Download your formatted PDF
            </li>
          </ol>

          <div className="not-prose my-6 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4">
            <p className="font-medium text-slate-800">Works with Claude Artifacts</p>
            <p className="text-sm text-slate-600">
              Claude&apos;s artifacts (code, documents, diagrams) are often markdown-based.
              Copy the artifact content directly for best results.
            </p>
          </div>

          <h2>What Are Claude Artifacts?</h2>
          <p>
            Artifacts are Claude&apos;s way of generating standalone content like:
          </p>
          <ul>
            <li><strong>Code files</strong> — Complete scripts, functions, or applications</li>
            <li><strong>Documents</strong> — Reports, guides, and documentation</li>
            <li><strong>Markdown content</strong> — Formatted text with structure</li>
            <li><strong>Data structures</strong> — JSON, YAML, configuration files</li>
          </ul>

          <h2>What Gets Preserved</h2>
          <ul>
            <li>✓ <strong>Code blocks</strong> — Properly formatted with structure</li>
            <li>✓ <strong>Headers</strong> — Document hierarchy maintained</li>
            <li>✓ <strong>Lists and tables</strong> — Markdown structure preserved</li>
            <li>✓ <strong>Bold, italic, inline code</strong> — Text formatting</li>
            <li>✓ <strong>Links</strong> — URLs preserved in the PDF</li>
          </ul>

          <h2>Common Use Cases</h2>
          <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Save Code Artifacts</h3>
              <p className="mt-1 text-sm text-slate-600">
                Export Claude&apos;s code artifacts as PDF documentation.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Document Analysis</h3>
              <p className="mt-1 text-sm text-slate-600">
                Save Claude&apos;s analysis and research as permanent PDFs.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Export Guides</h3>
              <p className="mt-1 text-sm text-slate-600">
                Turn Claude-generated guides and tutorials into shareable PDFs.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Archive Conversations</h3>
              <p className="mt-1 text-sm text-slate-600">
                Create permanent records of important Claude interactions.
              </p>
            </div>
          </div>

          <h2>Claude vs ChatGPT Export</h2>
          <p>
            Both Claude and ChatGPT output markdown-formatted responses. Our converter 
            works with both:
          </p>
          <ul>
            <li><strong>Claude artifacts</strong> — Often cleaner markdown structure</li>
            <li><strong>Claude responses</strong> — Regular chat responses work too</li>
            <li><strong>ChatGPT responses</strong> — Same process, same great results</li>
          </ul>

          <h2>Frequently Asked Questions</h2>

          <h3>Do I need Claude Pro to use this?</h3>
          <p>
            No. Our converter works with any Claude response, whether you&apos;re using 
            the free tier or Claude Pro.
          </p>

          <h3>Can I export SVG or image artifacts?</h3>
          <p>
            This tool is optimized for text and code. For SVG artifacts, you can 
            copy the SVG code itself, but the PDF will show the code rather than 
            the rendered image.
          </p>

          <h3>What about React/HTML artifacts?</h3>
          <p>
            Code artifacts (React, HTML, etc.) are exported as formatted code blocks.
            The PDF shows the source code, not a rendered preview.
          </p>

          <h3>Can I also export to Word (DOCX)?</h3>
          <p>
            Yes! After pasting your Claude content, you can export to PDF, DOCX, 
            HTML, or plain text.
          </p>

          {/* Second CTA */}
          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">
              Export your Claude artifacts as professional PDFs
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
              <li>✓ Your conversations stay private</li>
              <li>✓ Content processed and immediately deleted</li>
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
                  href="/chatgpt-to-pdf"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Convert ChatGPT to PDF
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
                  href="/"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Markdown to PDF — Free Converter
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

import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Obsidian Markdown to PDF Converter | Markdown Free",
  description:
    "Convert Obsidian notes to PDF. Handles standard markdown formatting, code blocks, and tables. Free, private, no plugins required.",
  keywords: [
    "obsidian to pdf",
    "obsidian markdown pdf",
    "convert obsidian notes pdf",
    "obsidian export pdf",
    "obsidian pdf converter",
    "obsidian notes to pdf free",
  ],
  alternates: {
    canonical: "/obsidian-markdown-to-pdf",
  },
  openGraph: {
    title: "Obsidian Markdown to PDF Converter | Markdown Free",
    description:
      "Convert Obsidian notes to PDF. Free, private, no plugins required.",
    locale: "en_US",
  },
};

export default function ObsidianToPdfPage() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Convert Obsidian Notes to PDF</h1>

          <p className="lead text-lg text-slate-600">
            Export your Obsidian markdown notes to PDF without installing plugins.
            Works with standard markdown formatting — just upload and convert.
          </p>

          {/* CTA Button */}
          <div className="not-prose my-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
            >
              Convert Obsidian Notes
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <h2>How to Export Obsidian Notes to PDF</h2>
          <ol>
            <li>
              <strong>Find your note file</strong> — Open your Obsidian vault folder on your computer
            </li>
            <li>
              <strong>Locate the .md file</strong> — Each note is a .md file in your vault
            </li>
            <li>
              <strong>Upload to Markdown Free</strong> — Drag and drop the .md file
            </li>
            <li>
              <strong>Download PDF</strong> — Click &quot;To PDF&quot; to get your formatted document
            </li>
          </ol>

          <h2>What Works Well</h2>
          <ul>
            <li>✓ <strong>Standard Markdown</strong> — Headers, bold, italic, lists</li>
            <li>✓ <strong>Code blocks</strong> — With proper formatting</li>
            <li>✓ <strong>Tables</strong> — GFM table syntax</li>
            <li>✓ <strong>Task lists</strong> — Checkboxes render correctly</li>
            <li>✓ <strong>Block quotes</strong> — Styled callout boxes</li>
            <li>✓ <strong>Links</strong> — External URLs preserved</li>
          </ul>

          <h2>Limitations (Obsidian-Specific Features)</h2>
          <p>
            Some Obsidian-specific syntax is not supported, as it&apos;s proprietary to Obsidian:
          </p>
          <ul>
            <li>⚠️ <strong>[[Wikilinks]]</strong> — Rendered as plain text</li>
            <li>⚠️ <strong>![[Embeds]]</strong> — Not resolved (linked files not included)</li>
            <li>⚠️ <strong>Callouts</strong> — Rendered as block quotes (no icons)</li>
            <li>⚠️ <strong>Dataview queries</strong> — Not executed</li>
            <li>⚠️ <strong>Local images</strong> — Use absolute URLs or embed base64</li>
          </ul>
          <p className="text-sm text-slate-600">
            For notes using Obsidian-specific features, consider exporting with 
            Obsidian&apos;s built-in export first, or use standard markdown syntax.
          </p>

          <h2>Best Practices for Obsidian → PDF</h2>
          <div className="not-prose my-6 space-y-3">
            <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4">
              <p className="font-medium text-slate-800">Use standard markdown links</p>
              <p className="text-sm text-slate-600">
                Instead of <code>[[Page]]</code>, use <code>[Page](./page.md)</code>
              </p>
            </div>
            <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4">
              <p className="font-medium text-slate-800">Use absolute image URLs</p>
              <p className="text-sm text-slate-600">
                Host images online or use <code>data:</code> URLs for embedded images
              </p>
            </div>
            <div className="rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4">
              <p className="font-medium text-slate-800">Keep notes self-contained</p>
              <p className="text-sm text-slate-600">
                Notes that don&apos;t rely on embeds convert best
              </p>
            </div>
          </div>

          <h2>Why Use This Instead of Obsidian Export?</h2>
          <ul>
            <li>
              <strong>No plugins needed</strong> — Works without Obsidian Publish or Pandoc
            </li>
            <li>
              <strong>Quick one-off exports</strong> — No setup required
            </li>
            <li>
              <strong>Privacy</strong> — Files processed locally, never stored
            </li>
            <li>
              <strong>Works anywhere</strong> — Use from any device with a browser
            </li>
          </ul>

          <h2>Frequently Asked Questions</h2>

          <h3>Can I convert multiple notes at once?</h3>
          <p>
            Currently, notes are converted one at a time. For batch conversion, 
            consider Pandoc or Obsidian&apos;s export plugin.
          </p>

          <h3>Do frontmatter/YAML headers appear in the PDF?</h3>
          <p>
            YAML frontmatter (the <code>---</code> block at the top) is stripped 
            and does not appear in the PDF output.
          </p>

          <h3>What about Obsidian themes/CSS?</h3>
          <p>
            The PDF uses a clean, professional style. Custom Obsidian theme 
            styles are not applied.
          </p>

          {/* Second CTA */}
          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">
              Convert your Obsidian notes to PDF
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
              <li>✓ Your notes stay private</li>
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

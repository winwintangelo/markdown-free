import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Notion Export to PDF | Markdown Free",
  description:
    "Convert your Notion markdown export to PDF — no paid plan required. Upload, preview, download. Free, private, no signup.",
  keywords: [
    "notion to pdf",
    "notion export pdf",
    "notion markdown pdf",
    "convert notion to pdf",
    "notion page pdf free",
    "notion md to pdf",
  ],
  alternates: {
    canonical: "/notion-export-to-pdf",
  },
  openGraph: {
    title: "Notion Export to PDF | Markdown Free",
    description:
      "Convert Notion markdown exports to PDF — no paid plan required. Free, private.",
    locale: "en_US",
  },
};

export default function NotionExportToPdfPage() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Convert Notion Export to PDF</h1>

          <p className="lead text-lg text-slate-600">
            Notion lets every user export to Markdown, but PDF export is locked
            behind a paid plan. Drop your <code>.md</code> export here and get a
            clean PDF in seconds — no subscription required.
          </p>

          <div className="not-prose my-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
            >
              Convert Your Notion Export
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <h2>Why People Convert Notion to PDF</h2>
          <ul>
            <li>
              <strong>Share with non-Notion users</strong> — Send a clean,
              readable document anyone can open
            </li>
            <li>
              <strong>Archive pages</strong> — Keep a static snapshot of meeting
              notes, specs, or wiki pages
            </li>
            <li>
              <strong>Print and review</strong> — Hand out physical copies for
              workshops or stakeholder reviews
            </li>
            <li>
              <strong>Skip the paywall</strong> — Free users can&apos;t export
              to PDF natively, but Markdown export is always allowed
            </li>
          </ul>

          <h2>How to Export from Notion as Markdown</h2>
          <ol>
            <li>
              <strong>Open the page</strong> — In Notion desktop or web, click
              the <code>•••</code> menu in the top-right
            </li>
            <li>
              <strong>Choose Export</strong> — Select <em>Export</em> from the
              menu
            </li>
            <li>
              <strong>Pick Markdown &amp; CSV</strong> — In the format dropdown,
              choose <em>Markdown &amp; CSV</em>
            </li>
            <li>
              <strong>Download the .zip</strong> — Notion bundles your page as a
              <code>.md</code> file (plus any database CSVs and images)
            </li>
            <li>
              <strong>Upload the .md to Markdown Free</strong> — Drag and drop
              the markdown file here
            </li>
            <li>
              <strong>Click To PDF</strong> — Your Notion page is now a clean
              PDF
            </li>
          </ol>

          <h2>What Converts Cleanly</h2>
          <ul>
            <li>✓ <strong>Headings, paragraphs, and lists</strong> — All standard formatting</li>
            <li>✓ <strong>Code blocks</strong> — With proper indentation</li>
            <li>✓ <strong>Tables</strong> — Notion tables exported as GFM tables</li>
            <li>✓ <strong>Checkboxes / to-do lists</strong> — Render as task lists</li>
            <li>✓ <strong>Quotes and callouts</strong> — Become block quotes</li>
            <li>✓ <strong>Links</strong> — External URLs preserved</li>
          </ul>

          <h2>Notion-Specific Caveats</h2>
          <p>
            A few Notion features don&apos;t survive the markdown export — these
            are limitations of Notion&apos;s exporter, not Markdown Free:
          </p>
          <ul>
            <li>
              <strong>Linked databases</strong> — Exported as a separate CSV,
              not embedded in the page
            </li>
            <li>
              <strong>Synced blocks</strong> — Exported once at the source,
              referenced as plain markdown
            </li>
            <li>
              <strong>Toggle blocks</strong> — Become regular headings + content
              (no folding in PDF)
            </li>
            <li>
              <strong>Local images</strong> — Notion bundles them in the .zip;
              for the PDF, host the images online or use absolute URLs in your
              markdown
            </li>
          </ul>

          <h2>Frequently Asked Questions</h2>

          <h3>Do I need a paid Notion plan?</h3>
          <p>
            No. Markdown export is available on every Notion plan, including
            Free. Markdown Free converts that export to PDF without any
            subscription.
          </p>

          <h3>What about images from my Notion page?</h3>
          <p>
            Images with absolute URLs (https://...) render in the PDF. For local
            images that Notion bundled into the .zip, you&apos;ll need to host
            them online and update the markdown to use full URLs.
          </p>

          <h3>Can I convert a whole Notion workspace at once?</h3>
          <p>
            Markdown Free converts one file at a time. For a full-workspace
            export, convert each page&apos;s <code>.md</code> file individually
            — most users only need PDFs of specific pages anyway.
          </p>

          <h3>Is my page content stored anywhere?</h3>
          <p>
            No. Files are processed in memory during conversion and immediately
            discarded. Nothing is logged or persisted.
          </p>

          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">
              Turn your Notion pages into shareable PDFs
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
            >
              Try It Free — No Sign-up
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="not-prose rounded-lg bg-slate-50 p-6">
            <h3 className="mb-3 text-lg font-semibold text-slate-700">
              Privacy First
            </h3>
            <ul className="space-y-2 text-slate-600">
              <li>✓ No account required</li>
              <li>✓ Files processed and immediately deleted</li>
              <li>✓ Your Notion content stays private</li>
              <li>✓ Secure HTTPS connection</li>
            </ul>
          </div>

          <div className="not-prose border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">
              Related Tools
            </h2>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/obsidian-markdown-to-pdf"
                  className="text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Obsidian Markdown to PDF
                </Link>
              </li>
              <li>
                <Link
                  href="/markdown-to-docx"
                  className="text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Markdown to Word (DOCX)
                </Link>
              </li>
              <li>
                <Link
                  href="/"
                  className="text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Markdown to PDF — Free Online Converter
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

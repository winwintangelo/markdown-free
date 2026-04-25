import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Typora to PDF | Markdown Free",
  description:
    "Convert Typora markdown files to PDF online. No license needed, no install. Upload your .md and download a clean PDF — free, private, instant.",
  keywords: [
    "typora to pdf",
    "typora export pdf",
    "typora markdown pdf",
    "typora pdf online",
    "typora alternative pdf",
    "typora md to pdf free",
  ],
  alternates: {
    canonical: "/typora-to-pdf",
  },
  openGraph: {
    title: "Typora to PDF | Markdown Free",
    description:
      "Convert Typora markdown files to PDF online — no license, no install. Free and private.",
    locale: "en_US",
  },
};

export default function TyporaToPdfPage() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Convert Typora Markdown to PDF</h1>

          <p className="lead text-lg text-slate-600">
            Wrote your notes in Typora and need a PDF without launching the app?
            Drop the <code>.md</code> file here — Markdown Free converts it
            online, no license or install required.
          </p>

          <div className="not-prose my-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
            >
              Convert Your Typora File
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <h2>When to Use This Instead of Typora&apos;s Export</h2>
          <ul>
            <li>
              <strong>You&apos;re on a different machine</strong> — Typora
              isn&apos;t installed, but you have the <code>.md</code> file
            </li>
            <li>
              <strong>You want to share without sending the source</strong> —
              PDF is friendlier for recipients than raw markdown
            </li>
            <li>
              <strong>You want a consistent style</strong> — Markdown Free uses
              one clean default theme regardless of which Typora theme you use
              locally
            </li>
            <li>
              <strong>Quick mobile/web export</strong> — Convert from a phone or
              browser without the desktop app
            </li>
          </ul>

          <h2>How to Convert</h2>
          <ol>
            <li>
              <strong>Find your file</strong> — Open the folder where Typora
              saved your <code>.md</code>
            </li>
            <li>
              <strong>Drag &amp; drop into Markdown Free</strong> — Or click to
              choose the file
            </li>
            <li>
              <strong>Preview</strong> — Make sure formatting looks right
            </li>
            <li>
              <strong>Click To PDF</strong> — Download a clean, printable PDF
            </li>
          </ol>

          <h2>What Works</h2>
          <ul>
            <li>✓ <strong>Standard markdown</strong> — Headers, lists, links, emphasis</li>
            <li>✓ <strong>GitHub Flavored Markdown</strong> — Tables, task lists, strikethrough, autolinks</li>
            <li>✓ <strong>Code blocks</strong> — With syntax highlighting</li>
            <li>✓ <strong>Block quotes</strong> — Cleanly styled</li>
            <li>✓ <strong>YAML frontmatter</strong> — Stripped from the PDF (so titles/metadata don&apos;t leak)</li>
          </ul>

          <h2>Typora Features That Need Adjustment</h2>
          <p>
            A few Typora-specific behaviours rely on local rendering and
            don&apos;t survive a portable markdown export:
          </p>
          <ul>
            <li>
              <strong>Math (KaTeX/MathJax)</strong> — Inline <code>$...$</code>
              and block <code>$$...$$</code> appear as raw text. If you need
              rendered math in the PDF, export from Typora directly.
            </li>
            <li>
              <strong>Mermaid diagrams</strong> — The fenced code is preserved
              but not rendered as a diagram
            </li>
            <li>
              <strong>Local image paths</strong> — Use absolute URLs (or the
              <code>data:</code> scheme) so images appear in the PDF
            </li>
            <li>
              <strong>Custom themes</strong> — The PDF uses Markdown Free&apos;s
              default theme, not your Typora theme
            </li>
          </ul>

          <h2>Frequently Asked Questions</h2>

          <h3>Do I need a Typora license to use this?</h3>
          <p>
            No. Markdown Free is a separate online tool. As long as you have
            the <code>.md</code> file from Typora, you can convert it here for
            free without any Typora subscription or license.
          </p>

          <h3>Will my Typora theme carry over?</h3>
          <p>
            No. Markdown Free renders with its own clean default style. If you
            need pixel-perfect Typora theming, use Typora&apos;s built-in PDF
            export.
          </p>

          <h3>What about images embedded in the markdown?</h3>
          <p>
            Images with absolute URLs (https://...) render in the PDF. Relative
            paths like <code>./img/diagram.png</code> won&apos;t resolve —
            either host the images online or embed them as data URLs.
          </p>

          <h3>Is my content stored?</h3>
          <p>
            No. Files are processed in memory and discarded immediately after
            the PDF is generated. Nothing is logged.
          </p>

          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">
              Convert Typora notes to PDF in seconds
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
              <li>✓ Your notes stay private</li>
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
                  href="/notion-export-to-pdf"
                  className="text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  Notion Export to PDF
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

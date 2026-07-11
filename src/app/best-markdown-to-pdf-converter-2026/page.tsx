import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";
import { hreflangAlternates } from "@/lib/tool-links";

export const metadata: Metadata = {
  title: "Best Markdown to PDF Converter (2026 Comparison) | Markdown Free",
  description:
    "Compare 8 Markdown to PDF tools for 2026: markdown.free, Pandoc, Typora, Dillinger, StackEdit, md-to-pdf, Markdown PDF, Online2PDF. Browser-only? CLI? CJK support?",
  keywords: [
    "best markdown to pdf converter 2026",
    "markdown to pdf comparison",
    "free markdown converter",
    "markdown to pdf cjk",
    "browser markdown converter",
    "pandoc vs markdown free",
    "typora alternative",
    "markdown to pdf no install",
  ],
  alternates: {
    canonical: "/best-markdown-to-pdf-converter-2026",
    languages: hreflangAlternates("comparison"),
  },
  openGraph: {
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Markdown Free — Convert Markdown to PDF, Word (DOCX), Image (PNG), EPUB" }],
    title: "Best Markdown to PDF Converter (2026 Comparison)",
    description:
      "Honest comparison of 8 Markdown to PDF tools for 2026. Browser? CLI? CJK support? We say which tool wins for which case.",
    locale: "en_US",
  },
};

const PUBLISH_DATE = "2026-05-09";
const NEXT_REVIEW = "2026-11-09";

const faq = [
  {
    q: "Why does my Korean / Japanese / Chinese text turn into □□□ boxes in PDF?",
    a: "Most Markdown-to-PDF pipelines fall back to a Latin-only font (Helvetica, Times New Roman) which has no glyphs for non-Latin scripts. The fix is either (a) embedding a CJK-capable font like Noto Sans CJK in the rendering pipeline (Markdown Free does this automatically) or (b) configuring your converter to use one (Pandoc: --pdf-engine=xelatex -V mainfont=\"Noto Sans CJK JP\").",
  },
  {
    q: "Is there a free Markdown to PDF converter without ads?",
    a: "Yes — Markdown Free (no ads, no tracking, no signup), Pandoc (CLI), and the VS Code Markdown PDF extension are all free and ad-free. Hosted browser editors like Dillinger and Online2PDF are typically ad-supported.",
  },
  {
    q: "What's the best Markdown to PDF tool that doesn't require installation?",
    a: "Markdown Free runs entirely in the browser with no install. StackEdit and Dillinger also run browser-only but rely on system fonts, so non-Latin scripts may render as tofu boxes depending on the user's machine.",
  },
  {
    q: "Can I convert Markdown to DOCX (Word) without losing formatting?",
    a: "Yes. Markdown Free, Pandoc, and Typora all produce DOCX output that preserves headings, code blocks, tables, and task lists. Pandoc is the most thorough; Markdown Free is the fastest browser path.",
  },
  {
    q: "Is Pandoc still the best choice in 2026?",
    a: "Pandoc is still the most powerful Markdown converter for scripted use cases, but for non-technical users or anyone who doesn't want to install LaTeX (~1.5GB), browser-based tools like Markdown Free now offer comparable PDF quality without the setup cost.",
  },
  {
    q: "Which Markdown converter is safest for sensitive documents?",
    a: "Anything that runs locally — Pandoc, Typora, Markdown PDF (VS Code), md-to-pdf — keeps your file on your machine. Among browser tools, Markdown Free does HTML/TXT/DOCX entirely client-side and processes PDFs in serverless memory without storage. Tools that upload to a server (Online2PDF) carry the highest privacy risk.",
  },
  {
    q: "Does Markdown Free have a file size limit?",
    a: "Yes — currently 5MB per file. A 5MB Markdown file is roughly 750,000 words, which covers virtually all real-world documents. If you need to convert larger files, Pandoc on the command line has no built-in size limit.",
  },
];

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best Markdown to PDF Converter (2026 Comparison)",
  description:
    "Honest comparison of 8 Markdown to PDF tools for 2026: markdown.free, Pandoc, Typora, Dillinger, StackEdit, md-to-pdf, Markdown PDF, Online2PDF.",
  datePublished: PUBLISH_DATE,
  dateModified: PUBLISH_DATE,
  author: {
    "@type": "Organization",
    name: "Markdown Free team",
    url: "https://www.markdown.free/about",
  },
  publisher: {
    "@type": "Organization",
    name: "Markdown Free",
    url: "https://www.markdown.free",
  },
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": "https://www.markdown.free/best-markdown-to-pdf-converter-2026",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export default function BestMarkdownToPdfConverter2026Page() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }}
      />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Best Markdown to PDF Converter (2026 Comparison)</h1>

          <p className="text-sm text-slate-500">
            Published {PUBLISH_DATE} · Reviewed for accuracy at next refresh
            ({NEXT_REVIEW}) · By the Markdown Free team
          </p>

          <p className="lead text-lg text-slate-600">
            Picking a Markdown to PDF tool seems trivial — until you actually
            need one. Then you&apos;re choosing between a 1.5GB LaTeX install
            (Pandoc), a paid desktop app (Typora), a browser editor with ad
            banners (Dillinger), or a script you have to wire up yourself
            (md-to-pdf). Most work fine for English. They start failing the
            moment you add Korean, Japanese, Chinese, or Devanagari — that&apos;s
            where &quot;best&quot; actually splits.
          </p>

          <p>
            <strong>This guide compares 8 popular tools for 2026.</strong> The
            short answer:{" "}
            <Link href="/" className="text-emerald-700 hover:text-emerald-800 hover:underline">
              Markdown Free
            </Link>{" "}
            wins for browser-only no-setup use (especially with non-Latin
            scripts), Pandoc wins for scripted batch processing, Typora wins
            for offline polish.
          </p>

          {/* Quick comparison */}
          <h2>Quick comparison</h2>
          <div className="not-prose my-6 overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">Tool</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">Best for</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">Price</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">CJK / Devanagari</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">Outputs</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">Install</th>
                  <th className="px-3 py-3 text-left font-semibold text-slate-700">Privacy</th>
                </tr>
              </thead>
              <tbody className="text-slate-700">
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium">Markdown Free</td>
                  <td className="px-3 py-3">Browser, non-Latin scripts</td>
                  <td className="px-3 py-3">Free</td>
                  <td className="px-3 py-3">Yes — embedded Noto fonts, no setup</td>
                  <td className="px-3 py-3">PDF, DOCX, PNG, EPUB, HTML, TXT</td>
                  <td className="px-3 py-3">None</td>
                  <td className="px-3 py-3">Files in memory, not stored</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="px-3 py-3 font-medium">Pandoc</td>
                  <td className="px-3 py-3">Scripted batch conversion</td>
                  <td className="px-3 py-3">Free</td>
                  <td className="px-3 py-3">With config: <code>--pdf-engine=xelatex -V mainfont</code></td>
                  <td className="px-3 py-3">30+ formats</td>
                  <td className="px-3 py-3">LaTeX (~1.5GB) for PDF</td>
                  <td className="px-3 py-3">Local only</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium">Dillinger</td>
                  <td className="px-3 py-3">Quick browser editing (Latin)</td>
                  <td className="px-3 py-3">Free, ad-supported</td>
                  <td className="px-3 py-3">System fonts only</td>
                  <td className="px-3 py-3">PDF, HTML, MD</td>
                  <td className="px-3 py-3">None</td>
                  <td className="px-3 py-3">May sync to cloud services</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="px-3 py-3 font-medium">StackEdit</td>
                  <td className="px-3 py-3">Browser + Drive sync</td>
                  <td className="px-3 py-3">Free</td>
                  <td className="px-3 py-3">System fonts only</td>
                  <td className="px-3 py-3">PDF, HTML, MD</td>
                  <td className="px-3 py-3">None</td>
                  <td className="px-3 py-3">Optional cloud sync</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium">Markdown PDF (VS Code)</td>
                  <td className="px-3 py-3">VS Code workflows</td>
                  <td className="px-3 py-3">Free</td>
                  <td className="px-3 py-3">System fonts; configurable CSS</td>
                  <td className="px-3 py-3">PDF, HTML, PNG, JPEG</td>
                  <td className="px-3 py-3">VS Code + Chromium (~170MB)</td>
                  <td className="px-3 py-3">Local only</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="px-3 py-3 font-medium">md-to-pdf (npm)</td>
                  <td className="px-3 py-3">Custom build pipelines</td>
                  <td className="px-3 py-3">Free</td>
                  <td className="px-3 py-3">Configurable via CSS + Puppeteer</td>
                  <td className="px-3 py-3">PDF</td>
                  <td className="px-3 py-3">Node.js + Chromium</td>
                  <td className="px-3 py-3">Local only</td>
                </tr>
                <tr className="border-b border-slate-100">
                  <td className="px-3 py-3 font-medium">Typora</td>
                  <td className="px-3 py-3">Polished offline editor</td>
                  <td className="px-3 py-3">Paid one-time (unverified at time of writing)</td>
                  <td className="px-3 py-3">System fonts; theme-dependent</td>
                  <td className="px-3 py-3">PDF, HTML, DOCX</td>
                  <td className="px-3 py-3">Desktop app</td>
                  <td className="px-3 py-3">Local only</td>
                </tr>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <td className="px-3 py-3 font-medium">Online2PDF</td>
                  <td className="px-3 py-3">Generic file conversion</td>
                  <td className="px-3 py-3">Free, ad-supported</td>
                  <td className="px-3 py-3">Limited; not markdown-native</td>
                  <td className="px-3 py-3">PDF</td>
                  <td className="px-3 py-3">None</td>
                  <td className="px-3 py-3">Files uploaded to server</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tool sections */}
          <h2>Markdown Free</h2>
          <p>
            A browser-based Markdown converter that runs entirely client-side
            for HTML, TXT, and DOCX exports; PDF generation runs on serverless
            infrastructure with files processed in memory and immediately
            discarded. Built on the principle that adding signup, ads, or
            trackers makes a 30-second task miserable.
          </p>
          <p>
            <strong>How it handles non-Latin scripts:</strong> embeds Noto Sans
            CJK JP/KR/SC/TC and Noto Sans Devanagari directly in the PDF
            rendering pipeline. No font flag, no install, no tofu.
          </p>
          <p>
            <strong>Strengths:</strong> no signup, no tracking cookies,
            privacy-friendly analytics, 10 supported UI languages, strong DOCX
            output for converting AI-generated markdown into corporate Word
            documents.
            <br />
            <strong>Weaknesses:</strong> 5MB input file size cap, no offline
            mode (requires browser), no LaTeX/MathJax math rendering, no batch
            processing (one file at a time), no customizable PDF styling.
            <br />
            <strong>Best for:</strong> anyone who needs to convert Markdown to
            PDF, DOCX, or EPUB right now without installing anything,
            especially for non-Latin scripts.
          </p>
          <p>
            <Link href="/" className="text-emerald-700 hover:text-emerald-800 hover:underline">
              markdown.free
            </Link>{" "}
            (or jump straight to{" "}
            <Link href="/markdown-to-docx" className="text-emerald-700 hover:text-emerald-800 hover:underline">
              Markdown to DOCX
            </Link>
            ,{" "}
            <Link href="/readme-to-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
              README to PDF
            </Link>
            ,{" "}
            <Link href="/notion-export-to-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
              Notion Export to PDF
            </Link>
            )
          </p>

          <h2>Pandoc</h2>
          <p>
            A command-line universal document converter — the gold standard for
            batch and pipeline use. Converts between 30+ formats including
            Markdown, LaTeX, DOCX, EPUB, and PDF.
          </p>
          <p>
            <strong>How it handles non-Latin scripts:</strong> the default
            LaTeX engine (<code>pdflatex</code>) does not handle CJK,
            Devanagari, Arabic, or Hebrew. Readable output requires{" "}
            <code>--pdf-engine=xelatex</code> (or <code>lualatex</code>) with{" "}
            <code>-V mainfont=&quot;Noto Sans CJK JP&quot;</code> (or your script&apos;s
            font). The matching Noto font must also be installed on the
            system.
          </p>
          <p>
            <strong>Strengths:</strong> most powerful and flexible converter
            available; massive plugin/filter ecosystem; universally accepted in
            academic and technical writing.
            <br />
            <strong>Weaknesses:</strong> PDF generation requires installing
            LaTeX (TeX Live ~1.5GB on macOS, similar elsewhere); steep learning
            curve; CJK and other non-Latin scripts require explicit
            configuration that the first-time user won&apos;t know to set.
            <br />
            <strong>Best for:</strong> scripted conversion pipelines, academic
            publishing, technical writers comfortable with the command line.
          </p>
          <p>
            <a
              href="https://pandoc.org"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              pandoc.org
            </a>
          </p>

          <h2>Dillinger</h2>
          <p>
            A browser-based Markdown editor with live preview and basic export.
            Open source, with a hosted instance at dillinger.io.
          </p>
          <p>
            <strong>How it handles non-Latin scripts:</strong> inherits browser
            font fallbacks for preview; PDF export uses system-available fonts.
            Non-Latin scripts may render correctly in preview but fall back to
            default fonts on PDF export, depending on the user&apos;s system.
          </p>
          <p>
            <strong>Strengths:</strong> familiar split-pane editor; free;
            imports/exports from Dropbox, Google Drive, GitHub.
            <br />
            <strong>Weaknesses:</strong> ad-supported on the hosted instance;
            document state may sync to connected cloud services; limited
            control over PDF styling.
            <br />
            <strong>Best for:</strong> quick one-off edits and exports for
            Latin-script documents.
          </p>
          <p>
            <a
              href="https://dillinger.io"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              dillinger.io
            </a>
          </p>

          <h2>StackEdit</h2>
          <p>
            A browser-based Markdown editor with strong cloud sync (Google
            Drive, Dropbox, GitHub) and MathJax support for math rendering.
          </p>
          <p>
            <strong>How it handles non-Latin scripts:</strong> like Dillinger,
            relies on browser/system fonts for preview and PDF export. No
            bundled Noto fonts.
          </p>
          <p>
            <strong>Strengths:</strong> clean editor UI; math rendering; cloud
            sync for cross-device editing.
            <br />
            <strong>Weaknesses:</strong> PDF export goes through the browser
            print pipeline, so output styling is limited to print stylesheet
            conventions; cloud sync requires granting Google/Dropbox
            permissions.
            <br />
            <strong>Best for:</strong> writers who want a Markdown editor with
            cloud sync and need MathJax math.
          </p>
          <p>
            <a
              href="https://stackedit.io"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              stackedit.io
            </a>
          </p>

          <h2>Markdown PDF (VS Code extension)</h2>
          <p>
            A VS Code extension that exports the current Markdown file to PDF,
            HTML, PNG, or JPEG. Renders via a bundled Chromium instance
            (downloaded on first use, ~170MB).
          </p>
          <p>
            <strong>How it handles non-Latin scripts:</strong> uses Chromium&apos;s
            font system. CJK and Devanagari render if the operating system has
            fonts installed (most modern macOS / Windows / Linux desktops do
            for major scripts). Customizable via CSS — power users can specify{" "}
            <code>@font-face</code> rules to embed specific fonts.
          </p>
          <p>
            <strong>Strengths:</strong> fits naturally into a VS Code workflow;
            highly customizable via CSS; local-only — no network dependency
            once Chromium is downloaded.
            <br />
            <strong>Weaknesses:</strong> requires VS Code; first-run downloads
            ~170MB; slow first export while Chromium spins up.
            <br />
            <strong>Best for:</strong> developers who already live in VS Code
            and want a one-keystroke PDF export.
          </p>
          <p>
            <a
              href="https://marketplace.visualstudio.com/items?itemName=yzane.markdown-pdf"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              VS Code Marketplace
            </a>
          </p>

          <h2>md-to-pdf (npm)</h2>
          <p>
            A Node.js CLI/library that converts Markdown to PDF using
            Puppeteer (which embeds Chromium under the hood). Designed for
            build pipelines and custom workflows.
          </p>
          <p>
            <strong>How it handles non-Latin scripts:</strong> uses Chromium&apos;s
            font system. Customizable via CSS injection — power users can{" "}
            <code>@import</code> web fonts (including Noto) into the rendering
            CSS.
          </p>
          <p>
            <strong>Strengths:</strong> scriptable; themeable; fast for batch
            conversion once installed; open source.
            <br />
            <strong>Weaknesses:</strong> requires Node.js and Puppeteer&apos;s
            Chromium download (~170MB on first install); default styling needs
            CSS work for production-quality output.
            <br />
            <strong>Best for:</strong> custom build pipelines, CI/CD that
            produces PDFs from documentation.
          </p>
          <p>
            <a
              href="https://github.com/simonhaenisch/md-to-pdf"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              github.com/simonhaenisch/md-to-pdf
            </a>
          </p>

          <h2>Typora</h2>
          <p>
            A polished WYSIWYG Markdown editor for desktop (macOS, Windows,
            Linux). Free until 2021; now a paid one-time license (price
            unverified at time of writing — check the official site).
          </p>
          <p>
            <strong>How it handles non-Latin scripts:</strong> solid
            out-of-the-box for most scripts via system fonts. Theme-dependent —
            some themes ship CJK-optimized stacks.
          </p>
          <p>
            <strong>Strengths:</strong> best-in-class WYSIWYG editor; polished
            export; solid font handling; no ads or telemetry once licensed.
            <br />
            <strong>Weaknesses:</strong> paid; desktop only — no browser
            version; no team or cloud features.
            <br />
            <strong>Best for:</strong> solo writers who want a polished offline
            editor and don&apos;t mind a one-time license fee.
          </p>
          <p>
            <a
              href="https://typora.io"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              typora.io
            </a>{" "}
            (or jump to{" "}
            <Link href="/typora-to-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
              Typora to PDF
            </Link>{" "}
            for a no-install browser alternative)
          </p>

          <h2>Online2PDF</h2>
          <p>
            A generic web-based file converter that handles many formats (Word,
            Excel, PDF, images, etc.). Markdown is supported through generic
            conversion.
          </p>
          <p>
            <strong>How it handles non-Latin scripts:</strong> limited and
            unverified at time of writing. Not designed as a markdown-native
            tool, so behaviour with code blocks, tables, and CJK fonts is
            inconsistent.
          </p>
          <p>
            <strong>Strengths:</strong> handles many formats beyond Markdown;
            no install.
            <br />
            <strong>Weaknesses:</strong> files uploaded to server (privacy
            concern for sensitive content); ad-heavy interface; Markdown
            rendering is generic — code blocks, tables, and task lists may not
            render correctly; output styling not customizable.
            <br />
            <strong>Best for:</strong> one-off conversions where you have a
            mixed bag of file formats and Markdown is incidental.
          </p>
          <p>
            <a
              href="https://online2pdf.com"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              online2pdf.com
            </a>
          </p>

          {/* Decision tree */}
          <h2>How to choose</h2>
          <ul>
            <li>
              <strong>You need to convert a Markdown file to PDF/DOCX/EPUB
              right now in the browser, with no signup — especially with
              Korean/Japanese/Chinese/Hindi/Arabic content</strong> →{" "}
              <Link href="/" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                Markdown Free
              </Link>
            </li>
            <li>
              <strong>You&apos;re comfortable with the CLI, you have LaTeX
              installed (or can install it), and you want a scripted pipeline
              </strong> → Pandoc
            </li>
            <li>
              <strong>You live in VS Code and want a one-keystroke export
              </strong> → Markdown PDF (VS Code extension)
            </li>
            <li>
              <strong>You&apos;re building a CI/CD pipeline that produces PDFs
              from Markdown</strong> → md-to-pdf or Pandoc
            </li>
            <li>
              <strong>You want a polished offline WYSIWYG editor and don&apos;t
              mind paying</strong> → Typora
            </li>
            <li>
              <strong>You need cloud-synced Markdown with math support
              </strong> → StackEdit
            </li>
            <li>
              <strong>You&apos;re doing one-off edits in Latin scripts only
              </strong> → Dillinger or StackEdit
            </li>
          </ul>

          {/* FAQ */}
          <h2>Frequently asked questions</h2>
          {faq.map((item, i) => (
            <div key={i}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}

          {/* Disclosure */}
          <h2>Disclosure</h2>
          <p>
            This article is published by the team behind{" "}
            <Link href="/" className="text-emerald-700 hover:text-emerald-800 hover:underline">
              Markdown Free
            </Link>
            , one of the tools compared above. We tried to be specific about
            cases where other tools win — Pandoc for scripted pipelines, Typora
            for offline polish, VS Code Markdown PDF for in-editor workflows.
            Competitor links use <code>rel=&quot;nofollow&quot;</code> by
            convention. If you spot a factual error,{" "}
            <Link href="/about" className="text-emerald-700 hover:text-emerald-800 hover:underline">
              let us know
            </Link>{" "}
            and we&apos;ll fix it.
          </p>

          {/* CTA */}
          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">
              Try Markdown Free — no install, no signup, no tofu boxes
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
            >
              Open Markdown Free
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Related */}
          <div className="not-prose border-t border-slate-200 pt-8">
            <h2 className="mb-4 text-lg font-semibold text-slate-700">Related</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/markdown-to-docx" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                  Markdown to DOCX (Word)
                </Link>
              </li>
              <li>
                <Link href="/readme-to-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                  README to PDF
                </Link>
              </li>
              <li>
                <Link href="/notion-export-to-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                  Notion Export to PDF
                </Link>
              </li>
              <li>
                <Link href="/typora-to-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                  Typora to PDF
                </Link>
              </li>
              <li>
                <Link href="/obsidian-markdown-to-pdf" className="text-emerald-700 hover:text-emerald-800 hover:underline">
                  Obsidian Markdown to PDF
                </Link>
              </li>
            </ul>
          </div>
        </article>

        <Footer locale="en" dict={dict} />
              {/* Related tool suite cross-links */}
        <RelatedTools locale="en" current="comparison" />
      </main>
    </ConverterProvider>
  );
}

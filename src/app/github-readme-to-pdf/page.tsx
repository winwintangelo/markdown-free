import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "GitHub README to PDF — Free, No Signup (2026) | Markdown Free",
  description:
    "Convert any GitHub README.md to a polished PDF in seconds. Drag-and-drop the .md, download PDF — free, no signup, no install, no watermark. Code blocks, tables, badges, and shields.io links preserved. Updated for 2026.",
  keywords: [
    "github readme to pdf",
    "convert github readme to pdf",
    "download github readme as pdf",
    "how to download github readme as pdf",
    "readme.md to pdf",
    "github markdown pdf",
    "github documentation pdf",
    "export github readme to pdf",
  ],
  alternates: {
    canonical: "/github-readme-to-pdf",
  },
  openGraph: {
    title: "GitHub README to PDF — Free, No Signup (2026)",
    description:
      "Free GitHub README→PDF converter. Drag-and-drop .md, download PDF. No signup, no install.",
    locale: "en_US",
  },
};

const faq = [
  { q: "How do I convert a GitHub README to PDF?", a: "Open the repo's README.md on GitHub, click \"Raw\" and save the file, then drag-and-drop it into Markdown Free and click Export PDF. The whole flow takes ~10 seconds, no signup, no install." },
  { q: "How do I download a GitHub README as PDF?", a: "On the README.md page in GitHub, click \"Raw\", save the page as a .md file (Ctrl+S / Cmd+S), upload to Markdown Free, then export to PDF. Everything stays in your browser." },
  { q: "Is the GitHub README to PDF converter free?", a: "Yes. Markdown Free is 100% free with no premium tier, no signup, no usage caps, and no watermark on the exported PDF." },
  { q: "Do GitHub images and badges appear in the PDF?", a: "Yes for any image with an absolute URL — that includes shields.io badges, raw.githubusercontent.com images, and externally hosted assets. Relative repo paths (./images/foo.png) won't resolve outside GitHub; replace them with the raw.githubusercontent.com URL before converting." },
  { q: "Can I convert CHANGELOG.md, CONTRIBUTING.md, or LICENSE files too?", a: "Yes. Any .md or .markdown file works — README.md, CHANGELOG.md, CONTRIBUTING.md, /docs files, even GitHub Wiki .md exports." },
  { q: "Does it work for private repos or GitHub Enterprise?", a: "Markdown Free never connects to GitHub directly — it just converts a .md file you upload. So it works for any repo (public, private, GHE) as long as you can save the README.md to your machine." },
  { q: "Is there a file size limit?", a: "Yes — 5MB per file, which covers virtually every real-world README and documentation file (~750,000 words of plain Markdown)." },
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

export default function GitHubReadmeToPdfPage() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(faqJsonLd) }} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Convert GitHub README to PDF</h1>

          <p className="lead text-lg text-slate-600">
            Turn your GitHub repository README.md into a professional PDF document.
            Perfect for documentation, sharing with stakeholders, or archiving your project.
          </p>

          {/* CTA Button */}
          <div className="not-prose my-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-800"
            >
              Convert GitHub README Now
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <h2>How to Convert Your GitHub README</h2>
          <ol>
            <li>
              <strong>Go to your GitHub repository</strong> — Navigate to the README.md file
            </li>
            <li>
              <strong>Download the raw file</strong> — Click &quot;Raw&quot; button, then save the page (Ctrl+S / Cmd+S)
            </li>
            <li>
              <strong>Upload to Markdown Free</strong> — Drag and drop or click to upload
            </li>
            <li>
              <strong>Click &quot;To PDF&quot;</strong> — Download your formatted PDF
            </li>
          </ol>

          <h2>What Gets Preserved</h2>
          <p>
            Our converter handles all GitHub Flavored Markdown (GFM) features:
          </p>
          <ul>
            <li>✓ <strong>Code blocks</strong> with syntax highlighting</li>
            <li>✓ <strong>Tables</strong> with proper formatting</li>
            <li>✓ <strong>Task lists</strong> (checkboxes)</li>
            <li>✓ <strong>Images</strong> (with absolute URLs)</li>
            <li>✓ <strong>Badges</strong> and shields.io links</li>
            <li>✓ <strong>Strikethrough</strong> and other formatting</li>
            <li>✓ <strong>Headings</strong> hierarchy and anchors</li>
          </ul>

          <h2>Common Use Cases</h2>
          <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Project Documentation</h3>
              <p className="mt-1 text-sm text-slate-600">
                Share offline docs with team members or stakeholders who don&apos;t use GitHub.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Portfolio & Resume</h3>
              <p className="mt-1 text-sm text-slate-600">
                Include polished project documentation in job applications.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Client Deliverables</h3>
              <p className="mt-1 text-sm text-slate-600">
                Deliver professional documentation with your software projects.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Archival</h3>
              <p className="mt-1 text-sm text-slate-600">
                Preserve a point-in-time snapshot of your documentation.
              </p>
            </div>
          </div>

          <h2>Also Works With</h2>
          <ul>
            <li>CHANGELOG.md</li>
            <li>CONTRIBUTING.md</li>
            <li>LICENSE files</li>
            <li>Any /docs folder markdown</li>
            <li>GitHub Wiki pages (.md exports)</li>
          </ul>

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
              Turn your GitHub README into a professional PDF
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
                  href="/readme-to-pdf"
                  className="text-emerald-700 hover:text-emerald-800 hover:underline"
                >
                  README to PDF — General Guide
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

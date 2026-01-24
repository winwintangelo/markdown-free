import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Markdown to PDF Without Watermark | Markdown Free",
  description:
    "Convert Markdown to PDF with no watermarks, no branding, no limitations. Completely free, no sign-up required. Clean, professional output.",
  keywords: [
    "markdown to pdf no watermark",
    "markdown pdf free no watermark",
    "convert markdown pdf without watermark",
    "md to pdf no branding",
    "free markdown converter no watermark",
    "markdown pdf clean output",
  ],
  alternates: {
    canonical: "/markdown-to-pdf-no-watermark",
  },
  openGraph: {
    title: "Markdown to PDF Without Watermark | Markdown Free",
    description:
      "Convert Markdown to PDF with no watermarks, no branding. Completely free.",
    locale: "en_US",
  },
};

export default function NoWatermarkPage() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Markdown to PDF — No Watermark, No Limits</h1>

          <p className="lead text-lg text-slate-600">
            Convert your Markdown files to clean PDFs without watermarks, branding, 
            or &quot;created with...&quot; footers. What you write is what you get.
          </p>

          {/* CTA Button */}
          <div className="not-prose my-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
            >
              Convert Without Watermark
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <h2>Why We Don&apos;t Add Watermarks</h2>
          <p>
            Many &quot;free&quot; PDF converters add watermarks or branding to your output 
            unless you pay for a premium plan. We believe that&apos;s not really free.
          </p>
          <p>
            <strong>Markdown Free is truly free:</strong>
          </p>
          <ul>
            <li>✓ <strong>No watermarks</strong> on your PDF</li>
            <li>✓ <strong>No &quot;Created with...&quot;</strong> footer text</li>
            <li>✓ <strong>No page limits</strong> per day or month</li>
            <li>✓ <strong>No premium tier</strong> to unlock features</li>
            <li>✓ <strong>No sign-up required</strong> — just use it</li>
          </ul>

          <h2>Compare: Free vs &quot;Free&quot;</h2>
          <div className="not-prose my-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Feature</th>
                  <th className="px-4 py-3 text-center font-semibold text-emerald-600">Markdown Free</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-500">Others (Free Tier)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="px-4 py-3">No watermark</td>
                  <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                  <td className="px-4 py-3 text-center text-red-500">✗</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">No page limits</td>
                  <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                  <td className="px-4 py-3 text-center text-red-500">3-5/day</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">No account required</td>
                  <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                  <td className="px-4 py-3 text-center text-red-500">Email required</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">No upsell prompts</td>
                  <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                  <td className="px-4 py-3 text-center text-red-500">✗</td>
                </tr>
                <tr>
                  <td className="px-4 py-3">DOCX export</td>
                  <td className="px-4 py-3 text-center text-emerald-600">✓</td>
                  <td className="px-4 py-3 text-center text-red-500">Premium</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>What You Get</h2>
          <ul>
            <li>
              <strong>Clean PDF output</strong> — Professional formatting, readable fonts
            </li>
            <li>
              <strong>Full GFM support</strong> — Tables, code blocks, checklists
            </li>
            <li>
              <strong>Multiple exports</strong> — PDF, DOCX, HTML, TXT
            </li>
            <li>
              <strong>Instant download</strong> — No waiting, no queue
            </li>
          </ul>

          <h2>Use Cases</h2>
          <ul>
            <li>
              <strong>Professional documents</strong> — Reports, proposals, documentation
            </li>
            <li>
              <strong>Academic work</strong> — Papers, notes, study guides
            </li>
            <li>
              <strong>Client deliverables</strong> — Clean docs without third-party branding
            </li>
            <li>
              <strong>Personal projects</strong> — No one needs to know what tool you used
            </li>
          </ul>

          <h2>Frequently Asked Questions</h2>

          <h3>Is there really no catch?</h3>
          <p>
            No catch. We don&apos;t add watermarks, we don&apos;t limit conversions, 
            and we don&apos;t require sign-up. The tool is free because we believe 
            simple utilities should be free.
          </p>

          <h3>How do you make money?</h3>
          <p>
            Currently, this is a free tool with no monetization. We may explore 
            optional premium features in the future (like API access), but the 
            core converter will always be free and watermark-free.
          </p>

          <h3>What&apos;s the file size limit?</h3>
          <p>
            Files up to 5MB are supported, which covers virtually all Markdown documents.
          </p>

          {/* Second CTA */}
          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">
              Clean PDFs without watermarks or branding
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
            >
              Try It Free — Forever
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
                  Markdown to PDF — Free Converter
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
            </ul>
          </div>
        </article>

        <Footer locale="en" dict={dict} />
      </main>
    </ConverterProvider>
  );
}

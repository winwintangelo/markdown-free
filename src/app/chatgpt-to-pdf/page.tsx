import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Convert ChatGPT to PDF | Save ChatGPT Conversations | Markdown Free",
  description:
    "Save ChatGPT conversations and code blocks as PDF. Copy markdown from ChatGPT, paste here, download as PDF. Free, no sign-up, instant export.",
  keywords: [
    "chatgpt to pdf",
    "save chatgpt as pdf",
    "export chatgpt conversation",
    "chatgpt pdf download",
    "convert chatgpt to pdf",
    "chatgpt code to pdf",
    "save chatgpt response",
  ],
  alternates: {
    canonical: "/chatgpt-to-pdf",
  },
  openGraph: {
    title: "Convert ChatGPT to PDF | Markdown Free",
    description:
      "Save ChatGPT conversations and code blocks as PDF. Free, instant export.",
    locale: "en_US",
  },
};

export default function ChatGptToPdfPage() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Convert ChatGPT to PDF</h1>

          <p className="lead text-lg text-slate-600">
            Save your ChatGPT conversations, code blocks, and responses as clean PDF documents.
            Copy the markdown from ChatGPT, paste it here, and download instantly.
          </p>

          {/* CTA Button */}
          <div className="not-prose my-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-emerald-700"
            >
              Convert ChatGPT Response Now
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <h2>How to Save ChatGPT as PDF</h2>
          <ol>
            <li>
              <strong>Copy the response</strong> — In ChatGPT, click the copy button on any response (or select and copy the text)
            </li>
            <li>
              <strong>Paste here</strong> — Go to Markdown Free and paste into the text area
            </li>
            <li>
              <strong>Click &quot;To PDF&quot;</strong> — Download your formatted PDF
            </li>
          </ol>

          <div className="not-prose my-6 rounded-lg border-l-4 border-emerald-500 bg-emerald-50 p-4">
            <p className="font-medium text-slate-800">Pro tip: Use the copy button</p>
            <p className="text-sm text-slate-600">
              ChatGPT&apos;s copy button preserves markdown formatting (code blocks, lists, headers).
              This gives you the best PDF output.
            </p>
          </div>

          <h2>What Gets Preserved</h2>
          <ul>
            <li>✓ <strong>Code blocks</strong> — With proper formatting and styling</li>
            <li>✓ <strong>Headers and structure</strong> — H1, H2, H3 hierarchy</li>
            <li>✓ <strong>Lists</strong> — Numbered and bulleted lists</li>
            <li>✓ <strong>Tables</strong> — Markdown tables render correctly</li>
            <li>✓ <strong>Bold and italic</strong> — Text formatting preserved</li>
            <li>✓ <strong>Math expressions</strong> — If using LaTeX syntax</li>
          </ul>

          <h2>Common Use Cases</h2>
          <div className="not-prose my-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Save Code Explanations</h3>
              <p className="mt-1 text-sm text-slate-600">
                Keep ChatGPT&apos;s code tutorials and explanations as reference PDFs.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Document Research</h3>
              <p className="mt-1 text-sm text-slate-600">
                Save research summaries and analysis for offline reading.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Archive Important Chats</h3>
              <p className="mt-1 text-sm text-slate-600">
                Create permanent records of important AI conversations.
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="font-semibold text-slate-900">Share with Team</h3>
              <p className="mt-1 text-sm text-slate-600">
                Export ChatGPT responses to share with colleagues who don&apos;t use AI.
              </p>
            </div>
          </div>

          <h2>Why Not Just Screenshot?</h2>
          <ul>
            <li>
              <strong>Searchable text</strong> — PDFs contain real text, not images
            </li>
            <li>
              <strong>Copy-paste code</strong> — Code blocks remain copyable in the PDF
            </li>
            <li>
              <strong>Professional formatting</strong> — Clean, consistent styling
            </li>
            <li>
              <strong>Smaller file size</strong> — Text PDFs are much smaller than screenshots
            </li>
            <li>
              <strong>Print-friendly</strong> — Proper pagination for long responses
            </li>
          </ul>

          <h2>Frequently Asked Questions</h2>

          <h3>Can I convert an entire ChatGPT conversation?</h3>
          <p>
            Yes, but you&apos;ll need to copy each response individually and combine them.
            ChatGPT doesn&apos;t have a native &quot;export all&quot; feature, so our tool helps
            you save what matters most.
          </p>

          <h3>Does this work with ChatGPT Plus/GPT-4?</h3>
          <p>
            Yes! The converter works with any ChatGPT response, regardless of which 
            model generated it.
          </p>

          <h3>What about code with syntax highlighting?</h3>
          <p>
            Code blocks are formatted with proper styling. While the PDF won&apos;t have 
            colored syntax highlighting, the code structure and formatting are preserved.
          </p>

          <h3>Can I also export to Word (DOCX)?</h3>
          <p>
            Yes! After pasting your ChatGPT response, you can export to PDF, DOCX, 
            HTML, or plain text.
          </p>

          {/* Second CTA */}
          <div className="not-prose my-8 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
            <p className="mb-4 text-lg font-medium text-slate-700">
              Save your ChatGPT conversations as professional PDFs
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
                  href="/claude-artifacts-to-pdf"
                  className="text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Convert Claude Artifacts to PDF
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

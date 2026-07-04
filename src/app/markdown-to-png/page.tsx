import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { RelatedTools } from "@/components/related-tools";
import { ConverterProvider } from "@/hooks/use-converter";
import { LocaleTracker } from "@/components/locale-tracker";
import { getDictionary } from "@/i18n";
import { hreflangAlternates } from "@/lib/tool-links";
import { safeJsonLd } from "@/lib/json-ld";

export const metadata: Metadata = {
  title: "Markdown to PNG Image Converter – Free, Private, No Signup | Markdown Free",
  description:
    "Convert Markdown to a sharp PNG or JPG image right in your browser. Free, no signup, nothing uploaded. Long documents export as one tall image or a ZIP of parts.",
  keywords: [
    "markdown to png",
    "markdown to image",
    "markdown to jpg",
    "md to png",
    "convert markdown to picture",
    "markdown screenshot",
  ],
  alternates: {
    canonical: "https://www.markdown.free/markdown-to-png",
    languages: hreflangAlternates("image"),
  },
  openGraph: {
    title: "Markdown to PNG Image Converter – Free & Private",
    description:
      "Render your .md file as a crisp PNG or JPG image, entirely in your browser. Free, private, instant download.",
    url: "https://www.markdown.free/markdown-to-png",
    type: "website",
    locale: "en_US",
  },
};

const faq = [
  {
    question: "Is this Markdown to PNG converter free?",
    answer:
      "Yes! Markdown Free is 100% free with no hidden costs, premium tiers, or signup requirements.",
  },
  {
    question: "How are long documents handled?",
    answer:
      "Documents up to about ten screens always export as a single image. Longer ones let you choose: one tall image (easy to share) or a ZIP of screen-sized parts, which stays sharper for very long documents.",
  },
  {
    question: "Does my Markdown get uploaded to a server?",
    answer:
      "No. The image is rendered entirely in your browser — your Markdown never leaves your device. Only remote images referenced in your document may be fetched through our proxy so they can appear in the output.",
  },
  {
    question: "Will Chinese, Japanese or Korean text render correctly?",
    answer:
      "Yes. The image is rasterized with your device's own fonts, so CJK text comes out exactly as you see it in the preview — no tofu boxes, no garbled characters.",
  },
  {
    question: "Can I export JPG instead of PNG?",
    answer:
      "Yes. JPG export is available under the More formats menu. PNG is recommended for text content because it is lossless, so glyph edges stay perfectly sharp.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  inLanguage: "en",
  mainEntity: faq.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function MarkdownToPngPage() {
  const dict = getDictionary("en");

  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        {/* Hero Section */}
        <section className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Convert Markdown to PNG Image – Free Online Tool
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Turn your Markdown into a crisp PNG or JPG image, rendered entirely
            in your browser. Perfect for sharing notes in chat apps, posting
            formatted text on social media, or dropping rendered snippets into
            slides — no screenshots needed.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-800"
          >
            Start Converting <span aria-hidden="true">&rarr;</span>
          </Link>
        </section>

        {/* Why Image Section */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Why Convert Markdown to an Image?
          </h2>
          <ul className="space-y-3 text-slate-600">
            <li className="flex items-start gap-3">
              <span className="text-amber-600">&#10003;</span>
              <span><strong>Share anywhere</strong> – images work in every chat app, social platform, and slide deck, even where Markdown or PDFs don&apos;t.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-600">&#10003;</span>
              <span><strong>Retina-sharp text</strong> – rendering happens at your device&apos;s pixel density, so text stays crisp instead of looking like a blurry screenshot.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-600">&#10003;</span>
              <span><strong>Long-image support</strong> – export a whole article as one tall image, or split it into a ZIP of screen-sized parts.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-amber-600">&#10003;</span>
              <span><strong>100% in your browser</strong> – nothing is uploaded; your Markdown never leaves your device.</span>
            </li>
          </ul>
        </section>

        {/* How It Works */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            How to Convert Markdown to PNG
          </h2>
          <ol className="space-y-4">
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">1</span>
              <div>
                <h3 className="font-medium text-slate-900">Upload or Paste</h3>
                <p className="text-sm text-slate-600">Drag and drop your .md file, or paste Markdown text directly.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">2</span>
              <div>
                <h3 className="font-medium text-slate-900">Preview</h3>
                <p className="text-sm text-slate-600">See your formatted document in real-time before converting.</p>
              </div>
            </li>
            <li className="flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">3</span>
              <div>
                <h3 className="font-medium text-slate-900">Export to Image</h3>
                <p className="text-sm text-slate-600">Click &ldquo;To Image (PNG)&rdquo; and your image downloads instantly. JPG is under More formats.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Use Cases */}
        <section className="mb-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Perfect For
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Chat &amp; Messaging</h3>
              <p className="text-sm text-slate-600">Share formatted notes, code snippets, and checklists in Slack, WhatsApp, or WeChat as clean images.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Social Media Posts</h3>
              <p className="text-sm text-slate-600">Post articles as long images on platforms that don&apos;t support rich text formatting.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Slides &amp; Design Tools</h3>
              <p className="text-sm text-slate-600">Drop rendered Markdown into presentations and design tools that accept images but not documents.</p>
            </div>
            <div className="rounded-lg bg-slate-50 p-4">
              <h3 className="font-medium text-slate-900">Quick Documentation Shares</h3>
              <p className="text-sm text-slate-600">Send a README section or changelog as a single readable image — no file to open.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faq.map((item) => (
              <details key={item.question} className="rounded-xl border border-slate-200 bg-white p-4">
                <summary className="cursor-pointer font-medium text-slate-900">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related tool suite cross-links */}
        <RelatedTools locale="en" current="image" />

        {/* CTA */}
        <section className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-amber-700 px-8 py-4 text-lg font-semibold text-white shadow-sm transition hover:bg-amber-800"
          >
            Convert Markdown to PNG Now <span aria-hidden="true">&rarr;</span>
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            Free &bull; No signup &bull; Instant download
          </p>
        </section>
      </main>
      <Footer locale="en" dict={dict} />
    </ConverterProvider>
  );
}

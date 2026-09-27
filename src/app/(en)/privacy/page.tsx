import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LocaleTracker } from "@/components/locale-tracker";
import { ConverterProvider } from "@/hooks/use-converter";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "Privacy Policy | Markdown Free",
  description:
    "Privacy policy for Markdown Free. Learn how we handle your files and data. No accounts, no tracking, no stored content.",
};

export default function PrivacyPage() {
  const dict = getDictionary("en");
  
  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <Header locale="en" dict={dict} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>Privacy Policy</h1>
          <p className="lead">
            Your privacy matters. Here&apos;s exactly how Markdown Free handles
            your data.
          </p>

          <h2>The short version</h2>
          <ul>
            <li>
              <strong>No accounts</strong> — We collect no personal information,
              except an email address you choose to leave to hear about new
              features
            </li>
            <li>
              <strong>No tracking cookies</strong> — We don&apos;t use cookies or
              track your content
            </li>
            <li>
              <strong>No storage</strong> — Your files are never stored on our
              servers
            </li>
            <li>
              <strong>HTTPS only</strong> — All connections are encrypted
            </li>
          </ul>

          <h2>How files are processed</h2>

          <h3>Preview, HTML, TXT, image, EPUB and Excel export</h3>
          <p>
            When you upload a file for preview or export to HTML, TXT, PNG/JPG
            images, EPUB or Excel, everything happens entirely in your browser.
            Your file never leaves your device. We use client-side JavaScript
            to parse and render the Markdown. Remote images referenced by your
            document may be fetched through our image proxy so they can be
            embedded; the proxy sees the image URL, not your text.
          </p>

          <h3>PDF and Word (DOCX) export</h3>
          <p>
            For PDF and Word (DOCX) generation, your Markdown content is sent to
            our server, converted, and immediately returned to you. The content
            is:
          </p>
          <ul>
            <li>Processed in memory only</li>
            <li>Never written to disk</li>
            <li>Immediately discarded after the PDF is generated</li>
            <li>Not logged, analyzed, or stored in any way</li>
          </ul>

          <h2>Data we don&apos;t collect</h2>
          <ul>
            <li>Personal information (names, accounts)</li>
            <li>Document content or file contents</li>
            <li>File names</li>
            <li>Your IP address in logs</li>
            <li>Cookies for tracking</li>
          </ul>

          <h2>Analytics</h2>
          <p>
            We use <strong>Umami Cloud</strong> and <strong>Vercel Web
            Analytics</strong>, two privacy-focused, cookieless analytics
            services. They help us understand how many people use Markdown
            Free and which features are most useful.
          </p>
          <p>Neither uses cookies or collects personal information such as names, email addresses, or IP addresses. We only see aggregated data like:</p>
          <ul>
            <li>Page views and visitor counts</li>
            <li>Referrer information (where visitors come from)</li>
            <li>Counts of successful conversions (PDF, DOCX, PNG, EPUB, HTML, TXT)</li>
            <li>General device/browser information</li>
            <li>
              How often a browser converts, in broad ranges: conversions and
              active days in the last 30 days, the number of formats, time since
              its first conversion, and whether it happened during weekday
              working hours, outside them, or at the weekend
            </li>
            <li>
              Facts about a converted document, in broad ranges: its size, the
              number of images, whether it has formulas or diagrams, and whether
              it was converted before
            </li>
            <li>The size range of a file that was too large to upload</li>
          </ul>
          <p>
            <strong>We do not send your Markdown content, file names, or any text
            you paste to our analytics providers.</strong> Your browser works out
            the ranges above itself. To recognise a document you convert again,
            it keeps a one-way fingerprint of recent file names (or pasted text)
            for 30 days; the fingerprint never leaves your device. Analytics
            respects your browser&apos;s Do Not Track setting.
          </p>

          <h2>Third parties</h2>
          <p>
            We do not share your documents with anyone. Four service providers
            process limited data on our behalf: <strong>Umami Cloud</strong> and{" "}
            <strong>Vercel Web Analytics</strong> (cookieless analytics —
            aggregate counts and ranges only, never your content),{" "}
            <strong>Resend</strong> (delivers feedback messages to our inbox)
            and <strong>Supabase</strong> (stores, in the United States, the
            email address you leave to hear about upcoming features, with the
            features you picked, and any suggestion or answer you type into a
            feedback box; we delete an email address once its features have
            shipped or after 12 months, whichever comes first, and a suggestion
            after 12 months). The PDF
            generation runs on our own serverless infrastructure (Vercel). No
            external service sees your content.
          </p>

          <h2>Security</h2>
          <ul>
            <li>
              <strong>HTTPS everywhere</strong> — All traffic is encrypted
            </li>
            <li>
              <strong>XSS protection</strong> — User content is sanitized before
              rendering
            </li>
            <li>
              <strong>No document storage</strong> — Your documents are never
              stored, so there are none to breach
            </li>
          </ul>

          <h2>Changes to this policy</h2>
          <p>
            If we make changes to this privacy policy, we&apos;ll update the date
            below. Significant changes will be noted on the homepage.
          </p>
          <p className="text-sm text-slate-500">Last updated: September 2026</p>

          <h2>Contact</h2>
          <p>
            Questions about privacy? Send them through the feedback box that
            appears under the export buttons after any conversion.
          </p>
        </article>

        <Footer locale="en" dict={dict} />
      </main>
    </ConverterProvider>
  );
}

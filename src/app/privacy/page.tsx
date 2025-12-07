import type { Metadata } from "next";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Markdown Free. Learn how we handle your files and data. No accounts, no tracking, no stored content.",
};

export default function PrivacyPage() {
  return (
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
            <strong>No accounts</strong> — We don&apos;t collect any personal
            information
          </li>
          <li>
            <strong>No tracking</strong> — We don&apos;t track your content or
            document data
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

        <h3>Preview, HTML & TXT export</h3>
        <p>
          When you upload a file for preview or export to HTML/TXT, everything
          happens entirely in your browser. Your file never leaves your device.
          We use client-side JavaScript to parse and render the Markdown.
        </p>

        <h3>PDF export</h3>
        <p>
          For PDF generation, your Markdown content is sent to our server,
          converted to PDF, and immediately returned to you. The content is:
        </p>
        <ul>
          <li>Processed in memory only</li>
          <li>Never written to disk</li>
          <li>Immediately discarded after the PDF is generated</li>
          <li>Not logged, analyzed, or stored in any way</li>
        </ul>

        <h2>Data we don&apos;t collect</h2>
        <ul>
          <li>Personal information (names, emails, accounts)</li>
          <li>Document content or file contents</li>
          <li>File names or metadata</li>
          <li>Your IP address in logs</li>
          <li>Cookies for tracking</li>
        </ul>

        <h2>Analytics</h2>
        <p>
          We may use anonymous, privacy-respecting analytics to understand how
          the tool is used (e.g., page views, button clicks, export format
          preferences). This data:
        </p>
        <ul>
          <li>Contains no personal identifiers</li>
          <li>Does not include any document content</li>
          <li>Is aggregated and anonymized</li>
          <li>Helps us improve the service</li>
        </ul>

        <h2>Third parties</h2>
        <p>
          We do not share any data with third parties. The PDF generation runs
          on our own serverless infrastructure (Vercel). No external services
          see your content.
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
            <strong>No persistent storage</strong> — Nothing to breach
          </li>
        </ul>

        <h2>Changes to this policy</h2>
        <p>
          If we make changes to this privacy policy, we&apos;ll update the date
          below. Significant changes will be noted on the homepage.
        </p>
        <p className="text-sm text-slate-500">Last updated: December 2024</p>

        <h2>Contact</h2>
        <p>
          Questions about privacy? Click the Feedback button in the header to
          reach us.
        </p>
      </article>

      <Footer />
    </main>
  );
}

import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { LocaleTracker } from "@/components/locale-tracker";
import { ConverterProvider } from "@/hooks/use-converter";
import { getDictionary } from "@/i18n";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Markdown Free - a fast, free, web-based Markdown viewer and converter. No signup required.",
};

export default function AboutPage() {
  const dict = getDictionary("en");
  
  return (
    <ConverterProvider>
      <LocaleTracker locale="en" />
      <Header locale="en" dict={dict} />
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
        <article className="prose prose-slate max-w-none">
          <h1>About Markdown Free</h1>
          <p className="lead">
            A fast, free, web-based Markdown viewer and converter with an
            ultra-simple flow.
          </p>

          <h2>What is Markdown Free?</h2>
          <p>
            Markdown Free lets you upload a <code>.md</code> file, preview it
            instantly with beautiful formatting, then export to PDF, TXT, or HTML
            with a single click. No signup required, no complex interfaces—just
            drag, drop, and download.
          </p>

          <h2>Why we built this</h2>
          <p>
            We noticed that many people receive Markdown files but don&apos;t have
            an easy way to view or convert them. Existing tools often require
            sign-ups, have complex interfaces, or raise privacy concerns.
          </p>
          <p>
            Markdown Free solves this with a single-purpose tool that anyone can
            understand in under 3 seconds and complete their task in under 30
            seconds.
          </p>

          <h2>Our principles</h2>
          <ul>
            <li>
              <strong>Free forever</strong> — No accounts, no subscriptions, no
              hidden costs
            </li>
            <li>
              <strong>Privacy first</strong> — Files are processed temporarily and
              never stored on our servers
            </li>
            <li>
              <strong>Simple by design</strong> — One page, three buttons, done
            </li>
            <li>
              <strong>Open and transparent</strong> — What you see is what you get
            </li>
          </ul>

          <h2>How it works</h2>
          <ol>
            <li>
              <strong>Upload</strong> — Drag & drop your <code>.md</code>,{" "}
              <code>.markdown</code>, or <code>.txt</code> file
            </li>
            <li>
              <strong>Preview</strong> — See your formatted Markdown instantly
            </li>
            <li>
              <strong>Export</strong> — Click To PDF, To TXT, or To HTML to
              download
            </li>
          </ol>

          <h2>Technical details</h2>
          <ul>
            <li>
              <strong>Preview & HTML/TXT export:</strong> Processed entirely in
              your browser using modern web technologies
            </li>
            <li>
              <strong>PDF export:</strong> Generated server-side for high fidelity,
              then immediately discarded
            </li>
            <li>
              <strong>File size limit:</strong> Up to 5 MB per file
            </li>
            <li>
              <strong>Supported formats:</strong> GitHub Flavored Markdown (GFM)
              including tables, task lists, and strikethrough
            </li>
          </ul>

          <h2>Questions or feedback?</h2>
          <p>
            We&apos;d love to hear from you! Click the Feedback button in the
            header to share your thoughts, report issues, or suggest improvements.
          </p>
        </article>

        <Footer locale="en" dict={dict} />
      </main>
    </ConverterProvider>
  );
}

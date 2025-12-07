import { Footer } from "@/components/footer";

export default function PrivacyPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>Privacy Policy</h1>
        <p className="lead">
          Your privacy matters. Here&apos;s how Markdown Free handles your data.
        </p>

        <h2>What we collect</h2>
        <p>
          <strong>Nothing.</strong> We don&apos;t require accounts, so we don&apos;t
          store any personal information.
        </p>

        <h2>How files are processed</h2>
        <ul>
          <li>
            <strong>Preview &amp; HTML/TXT export:</strong> Processed entirely in
            your browser. Files never leave your device.
          </li>
          <li>
            <strong>PDF export:</strong> Content is sent to our server for
            conversion, then immediately discarded. We do not log, store, or
            analyze your content.
          </li>
        </ul>

        <h2>Analytics</h2>
        <p>
          We may use anonymous, privacy-respecting analytics to understand how
          the tool is used (e.g., page views, export counts). No personal data
          or document content is ever tracked.
        </p>

        <h2>Third parties</h2>
        <p>
          We do not share any data with third parties. The PDF generation runs
          on our own serverless infrastructure.
        </p>

        <h2>Contact</h2>
        <p>
          Questions? Reach out via the Feedback button in the header.
        </p>
      </article>

      <Footer />
    </main>
  );
}


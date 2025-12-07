import { Footer } from "@/components/footer";

export default function AboutPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 pb-16 pt-10">
      <article className="prose prose-slate max-w-none">
        <h1>About Markdown Free</h1>
        <p>
          Markdown Free is a fast, free, web-based Markdown viewer and converter.
          Upload your <code>.md</code> file, preview it instantly, then export to
          PDF, TXT, or HTML in one click.
        </p>

        <h2>Why we built this</h2>
        <p>
          We noticed that many people receive Markdown files but don&apos;t have
          an easy way to view or convert them. Existing tools often require
          sign-ups, have complex interfaces, or raise privacy concerns.
        </p>

        <h2>Our principles</h2>
        <ul>
          <li>
            <strong>Free forever</strong> – No accounts, no subscriptions
          </li>
          <li>
            <strong>Privacy first</strong> – Files are processed temporarily and
            never stored
          </li>
          <li>
            <strong>Simple by design</strong> – One page, three buttons, done
          </li>
        </ul>
      </article>

      <Footer />
    </main>
  );
}


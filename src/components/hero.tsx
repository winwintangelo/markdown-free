export function Hero() {
  return (
    <section className="text-center">
      {/* Badge */}
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Free • No signup • Instant export
      </div>

      {/* Headline - SEO optimized H1 */}
      <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Free Markdown to PDF, TXT &amp; HTML Converter
      </h1>

      {/* Subheadline with privacy promise */}
      <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
        Upload or paste your <code className="text-slate-800">.md</code> file,
        preview it instantly, then export to{" "}
        <span className="font-medium text-slate-800">PDF</span>,{" "}
        <span className="font-medium text-slate-800">TXT</span> or{" "}
        <span className="font-medium text-slate-800">HTML</span> in one click.
        Free, private and secure — your files are never stored.
      </p>
    </section>
  );
}


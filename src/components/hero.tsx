export function Hero() {
  return (
    <section className="text-center">
      {/* Badge */}
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Free • No signup • Instant export
      </div>

      {/* Headline */}
      <h1 className="text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
        Preview &amp; convert Markdown files in one click
      </h1>

      {/* Subheadline */}
      <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
        Upload your <code className="text-slate-800">.md</code> file, see the
        formatted preview, then export to{" "}
        <span className="font-medium text-slate-800">PDF</span>,{" "}
        <span className="font-medium text-slate-800">TXT</span> or{" "}
        <span className="font-medium text-slate-800">HTML</span> with clear,
        simple buttons.
      </p>
    </section>
  );
}


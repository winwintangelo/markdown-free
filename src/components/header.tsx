import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 text-white font-semibold text-sm">
            md
          </div>
          <span className="text-base font-semibold tracking-tight">
            Markdown Free
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <Link href="/about" className="hover:text-slate-900 transition-colors">
            About
          </Link>
          <Link href="/privacy" className="hover:text-slate-900 transition-colors">
            Privacy
          </Link>
          <button className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-colors">
            Feedback
          </button>
        </nav>
      </div>
    </header>
  );
}


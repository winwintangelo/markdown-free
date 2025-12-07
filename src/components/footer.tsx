import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-4 flex flex-col items-center justify-between gap-2 text-[11px] text-slate-400 sm:flex-row">
      <p>© 2025 Markdown Free. Built for simple, fast, free exports.</p>
      <div className="flex items-center gap-3">
        <Link 
          href="/privacy" 
          className="hover:text-slate-600 transition-colors underline-offset-2 hover:underline"
        >
          Privacy
        </Link>
        <span>•</span>
        <span>No tracking</span>
        <span>•</span>
        <span>HTTPS only</span>
      </div>
    </footer>
  );
}

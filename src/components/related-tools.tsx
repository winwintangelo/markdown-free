import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { RELATED_HEADING, relatedTools, type ToolKey } from "@/lib/tool-links";

/**
 * In-content cross-link hub for the converter tool suite. Server component —
 * renders the sibling tools for `locale`, excluding the current page's tool.
 * Renders nothing when the locale has no (other) tools.
 */
export function RelatedTools({
  locale,
  current,
  className = "",
}: {
  locale: Locale;
  current?: ToolKey;
  className?: string;
}) {
  const items = relatedTools(locale, current);
  if (items.length === 0) return null;

  return (
    <nav
      aria-label={RELATED_HEADING[locale]}
      className={`not-prose border-t border-slate-200 pt-8 ${className}`}
    >
      <h2 className="mb-4 text-lg font-semibold text-slate-700">
        {RELATED_HEADING[locale]}
      </h2>
      <ul className="flex flex-wrap gap-x-6 gap-y-2">
        {items.map((t) => (
          <li key={t.key}>
            <Link
              href={t.href}
              className="text-emerald-700 hover:text-emerald-800 hover:underline"
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

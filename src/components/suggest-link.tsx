"use client";

import { useState, type ReactNode } from "react";
import { trackSuggestOpened } from "@/lib/analytics";
import { TextFeedbackForm } from "./probe-forms";
import type { Dictionary } from "@/i18n";

/**
 * "Suggest an improvement": a quiet, always-available link in the export card
 * that opens a private text box (/api/ideas, kind "suggestion"). It asks
 * nothing of anyone who doesn't click it, which is the point: ideas from light
 * users without another interruption.
 */
export function SuggestLink({
  dict,
  locale,
  where,
  leading,
}: {
  dict: Dictionary;
  locale: string;
  /** desktop or mobile, for analytics. */
  where: string;
  /** Text on the same line, left of the link (the privacy note on desktop). */
  leading?: ReactNode;
}) {
  const s = dict.suggest;
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full flex-col gap-3">
      <div className={leading ? "flex flex-wrap items-center justify-between gap-x-4 gap-y-1" : "flex justify-center"}>
        {leading}
        <button
          type="button"
          onClick={() => {
            if (!open) trackSuggestOpened(where);
            setOpen(!open);
          }}
          aria-expanded={open}
          data-testid="suggest-link"
          className="h-7 shrink-0 text-xs font-medium text-slate-600 underline decoration-slate-300 underline-offset-[3px] transition hover:text-slate-800"
        >
          {s.link}
        </button>
      </div>
      {open && (
        <div className="border-t border-slate-100 pt-3">
          <TextFeedbackForm
            dict={dict}
            locale={locale}
            kind="suggestion"
            feature={null}
            label={s.label}
            placeholder={s.placeholder}
            doneText={s.done}
            testId="suggest-form"
          />
        </div>
      )}
    </div>
  );
}

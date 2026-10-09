"use client";

import { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { PAID_NEEDS, markPaidLayoutShown, type PaidNeed } from "@/lib/feature-teaser";
import {
  trackPaidNeed,
  trackPaidPromptDismissed,
  trackPaidPromptOpened,
  trackPaidPromptShown,
  trackPaidPromptViewed,
} from "@/lib/analytics";
import { useSeenOnce } from "@/hooks/use-seen-once";
import { ChipGroup, PaidInterestQuestions } from "./probe-forms";
import type { Dictionary } from "@/i18n";

/**
 * The page-layout question for a heavy user (3+ conversions on 2+ days in 30
 * days), shown once per browser in the post-convert slot. It asks whatever
 * NEXT_PUBLIC_PAID_INTEREST says (owner, 2026-10-08). The marketing review:
 * repeat use alone is a reason to ask about a need, not to push an upgrade —
 * so it asks what they would change and says plainly that the option may be
 * paid.
 */
export function PaidLayoutPrompt({
  dict,
  locale,
  onDismiss,
}: {
  dict: Dictionary;
  locale: string;
  onDismiss: () => void;
}) {
  const pi = dict.paidInterest;
  const [expanded, setExpanded] = useState(false);
  const [need, setNeed] = useState<PaidNeed | null>(null);
  const shownRef = useRef(false);
  const seenRef = useSeenOnce<HTMLDivElement>(() => trackPaidPromptViewed("repeat", "formatting"));

  useEffect(() => {
    if (shownRef.current) return;
    shownRef.current = true;
    markPaidLayoutShown();
    trackPaidPromptShown("repeat", "formatting");
  }, []);

  const needLabels: Record<PaidNeed, string> = pi.needs;

  return (
    <div
      ref={seenRef}
      data-testid="paid-layout-prompt"
      className="pop-in relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm"
    >
      <div className="flex flex-col gap-3 pr-8 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 sm:flex-1 sm:items-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-sm leading-snug text-slate-600">
            <span className="font-semibold text-slate-800">{pi.layoutLead}</span> {pi.layoutBody}
          </p>
        </div>
        {!expanded && (
          <button
            type="button"
            onClick={() => {
              setExpanded(true);
              trackPaidPromptOpened("repeat", "formatting");
            }}
            className="ml-11 h-11 shrink-0 self-start rounded-full border border-slate-300 bg-white px-4 text-[13px] font-semibold text-slate-700 transition hover:border-slate-400 sm:ml-0 sm:h-9 sm:self-auto"
          >
            {pi.layoutCta}
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          trackPaidPromptDismissed("repeat", "formatting");
          onDismiss();
        }}
        aria-label={dict.featureTeaser.dismiss}
        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-4 w-4" />
      </button>

      {expanded && (
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-3 sm:ml-11">
          <div className="flex flex-col gap-2">
            <p className="text-[13px] font-semibold text-slate-700">{pi.layoutQuestion}</p>
            <ChipGroup
              label={pi.layoutQuestion}
              options={PAID_NEEDS.map((value) => ({ value, label: needLabels[value] }))}
              value={need}
              onChange={(value) => {
                if (value === need) return;
                setNeed(value);
                trackPaidNeed("repeat", value);
              }}
              testId="paid-needs"
            />
          </div>
          <PaidInterestQuestions
            dict={dict}
            locale={locale}
            trigger="repeat"
            feature="formatting"
            featureLabel={dict.featureTeaser.features.formatting}
          />
        </div>
      )}
    </div>
  );
}

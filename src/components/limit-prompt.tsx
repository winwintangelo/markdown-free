"use client";

import { useEffect, useRef, useState } from "react";
import { LIMIT_SIZES, paidInterestEnabled, type LimitSize } from "@/lib/feature-teaser";
import { trackLimitPromptShown, trackLimitSizeChosen, trackPaidPromptOpened, trackPaidPromptShown } from "@/lib/analytics";
import { ChipGroup, EmailUpdatesForm, PaidInterestQuestions } from "./probe-forms";
import type { Dictionary } from "@/i18n";

/**
 * Under the "file too large" error: which size the visitor needs.
 *
 * Neutral by default — "Need files over 1 MB? Tell us what size you need.",
 * then an optional email for news if the limit changes. With the paid path on
 * (paidInterestEnabled) it says the higher limit may be paid and adds the
 * paid-interest questions. The error stays the primary message; this never
 * implies that paying fixes the failed upload today.
 *
 * It can sit inside the clickable upload card, so clicks here stop before they
 * reach the card and open the file picker.
 */
export function LimitPrompt({
  dict,
  locale,
  detectedBytes,
  where,
}: {
  dict: Dictionary;
  locale: string;
  /** Size of the rejected file, when known. Only its range reaches analytics. */
  detectedBytes: number | null;
  /** desktop (upload card), mobile (paste area) or inline (intent pages). */
  where: string;
}) {
  const lp = dict.limitPrompt;
  const pi = dict.paidInterest;
  const paid = paidInterestEnabled();
  const [size, setSize] = useState<LimitSize | null>(null);
  const [expanded, setExpanded] = useState(!paid);
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) return;
    shownRef.current = true;
    trackLimitPromptShown(detectedBytes, paid, where);
    if (paid) trackPaidPromptShown("limit", "large");
  }, [detectedBytes, paid, where]);

  const sizeOptions = LIMIT_SIZES.map((value) => ({ value, label: lp.sizes[value] }));
  const featureLabel = dict.featureTeaser.features.large;

  return (
    <div
      data-testid="limit-prompt"
      data-paid={paid ? "yes" : "no"}
      onClick={(event) => event.stopPropagation()}
      className="relative flex w-full max-w-[520px] cursor-default flex-col gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left"
    >
      {paid ? (
        <p className="text-[13.5px] leading-snug text-slate-600">
          <span className="font-semibold text-slate-800">{pi.limitLead}</span> {pi.limitBody}
        </p>
      ) : (
        <p className="text-[13.5px] font-semibold leading-snug text-slate-800">{lp.question}</p>
      )}

      {paid && !expanded && (
        <button
          type="button"
          onClick={() => {
            setExpanded(true);
            trackPaidPromptOpened("limit", "large");
          }}
          className="h-10 self-start rounded-full border border-slate-300 bg-white px-4 text-[13px] font-semibold text-slate-700 transition hover:border-slate-400"
        >
          {pi.limitCta}
        </button>
      )}

      {expanded && (
        <ChipGroup
          label={lp.question}
          options={sizeOptions}
          value={size}
          onChange={(value) => {
            if (value === size) return;
            setSize(value);
            trackLimitSizeChosen(value, detectedBytes, paid);
          }}
          large={where === "mobile"}
          testId="limit-sizes"
        />
      )}

      {paid && expanded && (
        <PaidInterestQuestions dict={dict} locale={locale} trigger="limit" feature="large" featureLabel={featureLabel} />
      )}

      {!paid && size && (
        <EmailUpdatesForm
          dict={dict}
          locale={locale}
          feature="large"
          source="limit"
          label={
            <span className="font-normal text-slate-600">
              {lp.thanks} <span className="text-slate-500">{dict.featureTeaser.emailOptional}</span>
            </span>
          }
          placeholder={dict.featureTeaser.emailPlaceholder}
          doneText={lp.done}
          testId="limit-updates"
        />
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { LIMIT_PAY_ANSWERS, type LimitPayAnswer } from "@/lib/feature-teaser";
import { trackLimitPayAnswer, trackLimitPromptShown } from "@/lib/analytics";
import { ChipGroup, DoneLine, EmailUpdatesForm } from "./probe-forms";
import type { Dictionary } from "@/i18n";

/**
 * Under the "file too large" error: would this visitor pay for bigger files?
 *
 * Someone who just hit the 1 MB limit is the clearest candidate for a paid
 * upgrade, so this card asks them, and only them, one question: files up to
 * 10 MB are coming as an optional paid upgrade; would you consider paying?
 * Yes, Maybe or No. A yes or maybe can leave an email for when it's ready.
 * The card says everything free today stays free.
 * The rejected file's size range reaches analytics with the answer, so the
 * card doesn't ask for it.
 *
 * The error stays the primary message; nothing here implies that paying fixes
 * the failed upload today. The card can sit inside the clickable upload card,
 * so clicks here stop before they reach it and open the file picker.
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
  const [answer, setAnswer] = useState<LimitPayAnswer | null>(null);
  const shownRef = useRef(false);

  useEffect(() => {
    if (shownRef.current) return;
    shownRef.current = true;
    trackLimitPromptShown(detectedBytes, where);
  }, [detectedBytes, where]);

  const options = LIMIT_PAY_ANSWERS.map((value) => ({ value, label: lp.answers[value] }));

  return (
    <div
      data-testid="limit-prompt"
      onClick={(event) => event.stopPropagation()}
      className="relative flex w-full max-w-[520px] cursor-default flex-col gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left"
    >
      <p className="text-[13.5px] leading-snug text-slate-600">
        <span className="font-semibold text-slate-800">{lp.lead}</span> {lp.body}
      </p>

      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-slate-700">{lp.question}</p>
        <ChipGroup
          label={lp.question}
          options={options}
          value={answer}
          onChange={(value) => {
            if (value === answer) return;
            setAnswer(value);
            trackLimitPayAnswer(value, detectedBytes, where);
          }}
          large={where === "mobile"}
          testId="limit-pay"
        />
      </div>

      {answer === "no" && <DoneLine>{lp.thanksNo}</DoneLine>}

      {(answer === "yes" || answer === "maybe") && (
        <EmailUpdatesForm
          dict={dict}
          locale={locale}
          feature="large"
          source="limit"
          label={
            <span className="font-normal text-slate-600">
              {lp.emailAsk} <span className="text-slate-500">{dict.featureTeaser.emailOptional}</span>
            </span>
          }
          placeholder={dict.featureTeaser.emailPlaceholder}
          doneText={lp.done}
          testId="limit-updates"
        />
      )}

      <p className="text-xs text-slate-500">{lp.reassurance}</p>
    </div>
  );
}

"use client";

import { useRef, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IDEA_MAX_CHARS,
  PAID_ANSWERS,
  type FeatureKey,
  type IdeaKind,
  type PaidAnswer,
} from "@/lib/feature-teaser";
import { EMAIL_RE, postIdea, postNotify } from "@/lib/probe-client";
import { trackIdeaSent, trackPaidInterest, trackUpdatesSignup } from "@/lib/analytics";
import type { Dictionary } from "@/i18n";

/**
 * Building blocks shared by the 1 MB size question, the paid-interest
 * questions and the suggestion box. Each form is optional, keeps
 * its own state, and reports to analytics without the typed text or address.
 */

/** Off-screen field that people never fill and form-filling bots do. */
export function Honeypot({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      type="text"
      name="mf-extra"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="absolute -left-[9999px] h-px w-px opacity-0"
    />
  );
}

/** A row of single-choice chips, announced as a radio group. */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  large = false,
  testId,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  large?: boolean;
  testId?: string;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2" data-testid={testId}>
      {options.map((option) => {
        const on = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={on}
            data-value={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-full border px-3.5 text-[13px] font-semibold transition",
              large ? "h-11" : "h-9",
              on
                ? "border-emerald-700 bg-emerald-700 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function DoneLine({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[13.5px] font-semibold text-emerald-800">
      <Check className="h-4 w-4 shrink-0 text-emerald-700" strokeWidth={2.6} aria-hidden="true" />
      {children}
    </p>
  );
}

/**
 * "Get updates": an optional email for news about one feature, stored by
 * /api/notify. `source` names the place in analytics (limit, paid_*).
 */
export function EmailUpdatesForm({
  dict,
  locale,
  feature,
  source,
  label,
  placeholder,
  doneText,
  testId,
}: {
  dict: Dictionary;
  locale: string;
  feature: FeatureKey;
  source: string;
  label?: ReactNode;
  placeholder: string;
  doneText: string;
  testId: string;
}) {
  const ft = dict.featureTeaser;
  const shownAtRef = useRef(Date.now());
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<"email" | "save" | null>(null);
  const [done, setDone] = useState(false);

  if (done) return <DoneLine>{doneText}</DoneLine>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;
    const address = email.trim();
    if (!EMAIL_RE.test(address)) {
      setError("email");
      return;
    }
    setSending(true);
    setError(null);
    const result = await postNotify({
      email: address,
      features: [feature],
      locale,
      website: honeypot,
      elapsedMs: Date.now() - shownAtRef.current,
    });
    setSending(false);
    if (result === "ok") {
      trackUpdatesSignup(source, feature);
      setDone(true);
    } else {
      setError(result);
    }
  };

  const inputId = `${testId}-email`;
  return (
    <form onSubmit={submit} noValidate className="relative flex flex-col gap-2" data-testid={testId}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {!label && (
          <label htmlFor={inputId} className="sr-only">
            {placeholder}
          </label>
        )}
        <input
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(null);
          }}
          placeholder={placeholder}
          aria-invalid={error === "email" || undefined}
          className={cn(
            "h-11 min-w-0 flex-[1_1_12rem] rounded-xl border bg-slate-50 px-3.5 text-sm text-slate-800 outline-none transition-colors sm:h-10",
            "placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/50",
            error === "email" ? "border-red-600" : "border-slate-200"
          )}
        />
        <Honeypot value={honeypot} onChange={setHoneypot} />
        <button
          type="submit"
          disabled={sending}
          className="h-11 shrink-0 rounded-full border border-emerald-700 bg-white px-4 text-[13px] font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-60 sm:h-10"
        >
          {sending ? ft.sending : ft.getUpdates}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-[12.5px] text-red-700">
          {error === "email" ? ft.errBad : ft.errSave}
        </p>
      )}
    </form>
  );
}

/**
 * A short private text box (/api/ideas). Used by the "Suggest an improvement"
 * link.
 */
export function TextFeedbackForm({
  dict,
  locale,
  kind,
  feature,
  label,
  placeholder,
  doneText,
  testId,
}: {
  dict: Dictionary;
  locale: string;
  kind: IdeaKind;
  feature: FeatureKey | null;
  label: ReactNode;
  placeholder: string;
  doneText: string;
  testId: string;
}) {
  const ft = dict.featureTeaser;
  const shownAtRef = useRef(Date.now());
  const [text, setText] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);

  if (done) return <DoneLine>{doneText}</DoneLine>;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setFailed(false);
    const ok = await postIdea({
      kind,
      feature,
      text: trimmed,
      locale,
      website: honeypot,
      elapsedMs: Date.now() - shownAtRef.current,
    });
    setSending(false);
    if (ok) {
      trackIdeaSent(kind, feature);
      setDone(true);
    } else {
      setFailed(true);
    }
  };

  const inputId = `${testId}-text`;
  return (
    <form onSubmit={submit} noValidate className="relative flex flex-col gap-2" data-testid={testId}>
      <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
        {label}
      </label>
      <textarea
        id={inputId}
        rows={2}
        maxLength={IDEA_MAX_CHARS}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setFailed(false);
        }}
        placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/50 sm:text-sm"
      />
      <Honeypot value={honeypot} onChange={setHoneypot} />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-slate-500">
          {ft.privateHint} · {text.length}/{IDEA_MAX_CHARS}
        </span>
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="h-10 shrink-0 rounded-full border border-slate-300 bg-white px-4 text-[13px] font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {sending ? ft.sending : ft.send}
        </button>
      </div>
      {failed && (
        <p role="alert" className="text-[12.5px] text-red-700">
          {ft.errSave}
        </p>
      )}
    </form>
  );
}

/**
 * The paid-interest questions, under a heading the caller supplies: "Would
 * you consider a paid option for this?" with three answers, an optional email,
 * and the reassurance that current features stay free. The answer is a
 * segment for analysis, never a price test.
 */
export function PaidInterestQuestions({
  dict,
  locale,
  trigger,
  feature,
  featureLabel,
}: {
  dict: Dictionary;
  locale: string;
  trigger: string;
  feature: FeatureKey;
  featureLabel: string;
}) {
  const pi = dict.paidInterest;
  const [answer, setAnswer] = useState<PaidAnswer | null>(null);
  const labels: Record<PaidAnswer, string> = { maybe: pi.maybe, free: pi.free, unsure: pi.unsure };

  return (
    <div className="flex flex-col gap-3" data-testid={`paid-questions-${trigger}`}>
      <div className="flex flex-col gap-2">
        <p className="text-[13px] font-semibold text-slate-700">{pi.question}</p>
        <ChipGroup
          label={pi.question}
          options={PAID_ANSWERS.map((value) => ({ value, label: labels[value] }))}
          value={answer}
          onChange={(value) => {
            if (value === answer) return;
            setAnswer(value);
            trackPaidInterest(trigger, feature, value);
          }}
          testId={`paid-answers-${trigger}`}
        />
      </div>
      <EmailUpdatesForm
        dict={dict}
        locale={locale}
        feature={feature}
        source={`paid_${trigger}`}
        placeholder={pi.emailPlaceholder}
        doneText={pi.done.replace("{feature}", featureLabel)}
        testId={`paid-updates-${trigger}`}
      />
      <p className="text-xs text-slate-500">{pi.reassurance}</p>
    </div>
  );
}

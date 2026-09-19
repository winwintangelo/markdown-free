"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { FREE_FEATURES, PREMIUM_FEATURES, isPremium, type FeatureKey } from "@/lib/feature-teaser";
import { trackFeatureInterest, trackFeatureTeaserOpened } from "@/lib/analytics";
import type { Dictionary } from "@/i18n";

/**
 * Phase 1.5 coming-features teaser (see src/lib/feature-teaser.ts for the
 * rules). Step 1 is one line; "See what's coming" opens step 2: feature names
 * as chips in two rows, premium and free. The email row appears after the
 * first tap. The email goes to /api/notify only; analytics receives one event
 * per picked feature and never the address.
 */

type Phase = "teaser" | "pick" | "thanks";
type ErrorCode = "pick" | "empty" | "bad" | "save";

interface FeatureTeaserProps {
  dict: Dictionary;
  locale: string;
  /** The visitor voted or signed up (the thanks line is now showing). */
  onAnswered: () => void;
  /** Close the teaser: the X button, or the thanks line timing out. */
  onDismiss: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FeatureTeaser({ dict, locale, onAnswered, onDismiss }: FeatureTeaserProps) {
  const ft = dict.featureTeaser;
  const [phase, setPhase] = useState<Phase>("teaser");
  const [picks, setPicks] = useState<FeatureKey[]>([]);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<ErrorCode | null>(null);
  const [sending, setSending] = useState(false);
  const [thanksWithEmail, setThanksWithEmail] = useState(false);
  const openedAtRef = useRef(0);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstChipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "pick") firstChipRef.current?.focus();
  }, [phase]);

  const finish = useCallback(
    (withEmail: boolean) => {
      onAnswered();
      setThanksWithEmail(withEmail);
      setPhase("thanks");
      dismissTimerRef.current = setTimeout(onDismiss, 3500);
    },
    [onAnswered, onDismiss]
  );

  const open = useCallback(() => {
    trackFeatureTeaserOpened();
    openedAtRef.current = Date.now();
    setPhase("pick");
  }, []);

  const toggle = useCallback((key: FeatureKey) => {
    setPicks((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
    setError((current) => (current === "pick" ? null : current));
  }, []);

  const vote = useCallback(() => {
    if (picks.length === 0) {
      setError("pick");
      return;
    }
    trackFeatureInterest(picks, picks.filter(isPremium).length, false);
    finish(false);
  }, [picks, finish]);

  const notify = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (sending) return;
      if (picks.length === 0) {
        setError("pick");
        return;
      }
      const address = email.trim();
      if (!address) {
        setError("empty");
        return;
      }
      if (!EMAIL_RE.test(address)) {
        setError("bad");
        return;
      }

      setSending(true);
      setError(null);
      try {
        const response = await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: address,
            features: picks,
            locale,
            website: honeypot,
            elapsedMs: Date.now() - openedAtRef.current,
          }),
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { error?: string };
          setError(data.error === "INVALID_EMAIL" ? "bad" : "save");
          return;
        }
        trackFeatureInterest(picks, picks.filter(isPremium).length, true);
        finish(true);
      } catch {
        setError("save");
      } finally {
        setSending(false);
      }
    },
    [sending, picks, email, locale, honeypot, finish]
  );

  const errorText =
    error === "pick" ? ft.errPick : error === "empty" ? ft.errEmpty : error === "bad" ? ft.errBad : error === "save" ? ft.errSave : "";
  const emailInvalid = error === "empty" || error === "bad";

  const chipRow = (label: string, keys: readonly FeatureKey[], premium: boolean) => (
    <div className="grid gap-1.5 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-2.5">
      <span
        className={cn(
          "text-[11px] font-semibold uppercase tracking-wider sm:pt-1.5",
          premium ? "text-emerald-700" : "text-slate-400"
        )}
      >
        {label}
      </span>
      <div className="flex flex-wrap gap-1.5">
        {keys.map((key, index) => {
          const on = picks.includes(key);
          return (
            <button
              key={key}
              ref={premium && index === 0 ? firstChipRef : undefined}
              type="button"
              aria-pressed={on}
              onClick={() => toggle(key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition",
                on
                  ? "border-emerald-700 bg-emerald-50 font-semibold text-emerald-800"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              )}
            >
              {on && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              {ft.features[key]}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div
      data-testid="feature-teaser"
      className="pop-in relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
    >
      {phase !== "thanks" && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={ft.dismiss}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {phase === "teaser" && (
        <p className="flex items-start gap-2.5 pr-6 text-sm leading-relaxed text-slate-600">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
          <span>
            {ft.teaser}{" "}
            <button
              type="button"
              onClick={open}
              className="whitespace-nowrap font-semibold text-emerald-700 underline decoration-1 underline-offset-[3px] hover:text-emerald-800"
            >
              {ft.seeMore}
            </button>
          </span>
        </p>
      )}

      {phase === "pick" && (
        <div>
          <h3 className="pr-6 text-[15px] font-semibold text-slate-900">{ft.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{ft.lead}</p>
          <div className="mt-3 flex flex-col gap-2.5" role="group" aria-label={ft.title}>
            {chipRow(ft.premium, PREMIUM_FEATURES, true)}
            {chipRow(ft.free, FREE_FEATURES, false)}
          </div>

          {(picks.length > 0 || error) && (
            <div className="mt-3.5 border-t border-slate-100 pt-3">
              <p className="text-sm text-slate-600">{ft.notifyLead}</p>
              <form onSubmit={notify} noValidate className="mt-2 flex flex-wrap gap-2">
                <input
                  id="notify-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailInvalid) setError(null);
                  }}
                  placeholder={ft.emailPlaceholder}
                  aria-label={ft.emailPlaceholder}
                  aria-invalid={emailInvalid || undefined}
                  aria-describedby={error ? "notify-error" : undefined}
                  className={cn(
                    "min-w-0 flex-[1_1_13rem] rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition-colors",
                    "placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/50",
                    emailInvalid ? "border-red-600" : "border-slate-200"
                  )}
                />
                {/* Honeypot: off-screen and skipped by keyboard and screen
                    readers. People never fill it; form-filling bots do. */}
                <input
                  type="text"
                  name="mf-extra"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  className="absolute -left-[9999px] h-px w-px opacity-0"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-full bg-emerald-700 px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                >
                  {sending ? ft.sending : ft.notify}
                </button>
              </form>
              {errorText && (
                <p id="notify-error" role="alert" className="mt-2 text-[12.5px] text-red-700">
                  {errorText}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
                <p className="text-xs text-slate-400">{ft.fine}</p>
                <button
                  type="button"
                  onClick={vote}
                  className="text-[12.5px] text-slate-500 underline decoration-slate-300 underline-offset-[3px] hover:text-slate-700"
                >
                  {ft.vote}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "thanks" && (
        <p className="py-1 text-center text-sm text-slate-500">
          {thanksWithEmail ? ft.thanksMail : ft.thanksVote}
        </p>
      )}
    </div>
  );
}

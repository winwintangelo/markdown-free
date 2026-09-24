"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, Plus, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FEATURE_KEYS,
  completeTallies,
  markTeaserAnswered,
  type FeatureKey,
  type FeatureTally,
  type PayAnswer,
  type TeaserExit,
} from "@/lib/feature-teaser";
import {
  trackFeatureTeaserClosed,
  trackFeatureTeaserCompleted,
  trackFeatureTeaserDismissed,
  trackFeatureTeaserOpened,
  trackFeatureVotes,
  trackNotifySignup,
  trackPayIntent,
} from "@/lib/analytics";
import type { Dictionary } from "@/i18n";

/**
 * Phase 1.5 vote board (see src/lib/feature-teaser.ts for the display rules).
 *
 * A one-line teaser sits in the post-convert slot. Opening it shows a dialog —
 * a modal on desktop, a sheet on a phone — in two states:
 *
 *   1. vote     the six features as plain rows, no counts and no bars
 *   2. results  the tallies, one optional question about paying, one optional
 *               email
 *
 * The counts arrive in the response to the vote, so nobody sees them before
 * voting: a visible leaderboard bends the vote towards whatever is winning.
 */

type Phase = "vote" | "results";
type ErrorCode = "pick" | "save" | "email" | null;

interface FeatureTeaserProps {
  dict: Dictionary;
  locale: string;
  /** The visitor voted (the dialog now shows results). */
  onAnswered: () => void;
  /** Close the teaser entirely. */
  onDismiss: () => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function FeatureTeaser({ dict, locale, onAnswered, onDismiss }: FeatureTeaserProps) {
  const ft = dict.featureTeaser;
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("vote");
  const [picks, setPicks] = useState<FeatureKey[]>([]);
  const [tallies, setTallies] = useState<FeatureTally[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [pay, setPay] = useState<PayAnswer | null>(null);
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [emailed, setEmailed] = useState(false);
  const [error, setError] = useState<ErrorCode>(null);

  const openedAtRef = useRef(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstRowRef = useRef<HTMLButtonElement>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The funnel, measured. The teaser is shown once and ends exactly once, so
  // the outcome is tracked in refs: state would be stale inside the unmount
  // cleanup that catches a teaser nobody closed.
  const shownAtRef = useRef(Date.now());
  const openedRef = useRef(false);
  const votedRef = useRef(false);
  const picksRef = useRef<FeatureKey[]>([]);
  const payRef = useRef<PayAnswer | null>(null);
  const notifiedRef = useRef(false);
  const endedRef = useRef(false);

  /** One terminal event per teaser: completed if they voted, else dismissed. */
  const trackEnd = useCallback((how: TeaserExit) => {
    if (endedRef.current) return;
    endedRef.current = true;
    const dwellMs = Date.now() - shownAtRef.current;
    if (votedRef.current) {
      trackFeatureTeaserCompleted({
        picks: picksRef.current,
        pay: payRef.current,
        notified: notifiedRef.current,
        dwellMs,
      });
    } else {
      trackFeatureTeaserDismissed({
        stage: openedRef.current ? "vote" : "teaser",
        how,
        dwellMs,
      });
    }
  }, []);

  /** Close the teaser for good: the row and the dialog both go. */
  const endTeaser = useCallback(
    (how: TeaserExit) => {
      trackEnd(how);
      onDismiss();
    },
    [trackEnd, onDismiss]
  );

  // A teaser can also go without anyone closing it — the next conversion
  // replaces it, or the page goes. Count that as an ending too. Closing the
  // tab is the one ending that gets away: React runs no cleanup for it, so
  // completed + dismissed undercounts shown by those visits.
  useEffect(() => {
    // React's development double-invoke unmounts and remounts with the same
    // refs. Without this the teaser would count as ended before it started.
    endedRef.current = false;
    return () => trackEnd("abandoned");
  }, [trackEnd]);

  const closeDialog = useCallback(
    (how: TeaserExit) => {
      // The row stays, so this is not the end: the visitor can reopen it.
      trackFeatureTeaserClosed(how, votedRef.current);
      setOpen(false);
      triggerRef.current?.focus();
    },
    []
  );

  // Escape closes, and the page behind does not scroll while the dialog is up
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDialog("escape");
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, closeDialog]);

  useEffect(() => {
    if (open && phase === "vote") firstRowRef.current?.focus();
  }, [open, phase]);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  const openDialog = useCallback(() => {
    trackFeatureTeaserOpened();
    openedRef.current = true;
    openedAtRef.current = Date.now();
    setOpen(true);
    // Reopening after a vote returns to the results. Sending someone back to
    // the vote screen would let one browser vote twice and inflate the counters.
    setPhase(votedRef.current ? "results" : "vote");
  }, []);

  const toggle = useCallback((key: FeatureKey) => {
    setPicks((current) => (current.includes(key) ? current.filter((k) => k !== key) : [...current, key]));
    setError((current) => (current === "pick" ? null : current));
  }, []);

  const submitVote = useCallback(async () => {
    if (sending) return;
    if (picks.length === 0) {
      setError("pick");
      return;
    }

    setSending(true);
    setError(null);
    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          features: picks,
          website: honeypot,
          elapsedMs: Date.now() - openedAtRef.current,
        }),
      });
      if (!response.ok) {
        setError("save");
        return;
      }
      const data = (await response.json()) as { tallies?: FeatureTally[] };
      setTallies(completeTallies(data.tallies ?? [], picks));
      trackFeatureVotes(picks);
      votedRef.current = true;
      picksRef.current = picks;
      // They answered. No later conversion asks again, this week or ever.
      markTeaserAnswered();
      onAnswered();
      setPhase("results");
      setRevealed(false);
      revealTimerRef.current = setTimeout(() => setRevealed(true), 80);
    } catch {
      setError("save");
    } finally {
      setSending(false);
    }
  }, [sending, picks, honeypot, onAnswered]);

  const choosePay = useCallback((answer: PayAnswer) => {
    setPay(answer);
    payRef.current = answer;
    trackPayIntent(answer);
    // Fire and forget: the vote is already recorded, and a failed chip must
    // not interrupt someone who is reading the results.
    void fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pay: answer }),
    }).catch(() => undefined);
  }, []);

  const submitEmail = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (sending) return;
      const address = email.trim();
      if (!EMAIL_RE.test(address)) {
        setError("email");
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
          setError(data.error === "INVALID_EMAIL" ? "email" : "save");
          return;
        }
        trackNotifySignup(picks.length);
        notifiedRef.current = true;
        setEmailed(true);
      } catch {
        setError("save");
      } finally {
        setSending(false);
      }
    },
    [sending, email, picks, locale, honeypot]
  );

  const errorText = error === "pick" ? ft.errPick : error === "email" ? ft.errBad : error === "save" ? ft.errSave : "";
  const topVotes = tallies.length > 0 ? Math.max(...tallies.map((row) => row.votes), 1) : 1;
  const status = (picks.length === 1 ? ft.statusOne : ft.statusMany).replace("{n}", String(picks.length));

  return (
    <div
      data-testid="feature-teaser"
      className="pop-in relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="flex items-start gap-2.5 pr-6 text-sm leading-relaxed text-slate-600">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
          <span>
            <span className="font-semibold text-slate-700">{ft.teaser}</span>{" "}
            <span className="text-slate-400">{ft.teaserLead}</span>
          </span>
        </p>
        <button
          ref={triggerRef}
          type="button"
          onClick={openDialog}
          className="inline-flex h-11 shrink-0 items-center gap-1.5 self-start rounded-full px-1 text-[13.5px] font-semibold text-emerald-700 transition hover:text-emerald-800 sm:h-9 sm:px-3"
        >
          {ft.seeMore}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <button
        type="button"
        onClick={() => endTeaser("close")}
        aria-label={ft.dismiss}
        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      {/* The card animates in (a transform), which would trap a fixed overlay
          inside it, so the dialog is portalled onto the body. */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/35 backdrop-blur-[3px] sm:items-center"
            onClick={() => closeDialog("backdrop")}
          >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={ft.voteTitle}
            data-testid="feature-vote-dialog"
            onClick={(event) => event.stopPropagation()}
            className="relative max-h-[92vh] w-full max-w-[640px] overflow-y-auto rounded-t-3xl bg-white px-5 pb-6 pt-5 shadow-2xl sm:rounded-2xl sm:px-7 sm:pb-6 sm:pt-6"
          >
            <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-slate-200 sm:hidden" aria-hidden="true" />
            <button
              type="button"
              onClick={() => closeDialog("close")}
              aria-label={ft.dismiss}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>

            {phase === "vote" ? (
              <div>
                <h3 className="pr-9 text-[20px] font-bold text-slate-900">{ft.voteTitle}</h3>
                <p className="mt-1.5 text-sm text-slate-500">{ft.voteLead}</p>

                <div className="mt-4 flex flex-col gap-2" role="group" aria-label={ft.voteTitle}>
                  {FEATURE_KEYS.map((key, index) => {
                    const on = picks.includes(key);
                    return (
                      <button
                        key={key}
                        ref={index === 0 ? firstRowRef : undefined}
                        type="button"
                        aria-pressed={on}
                        onClick={() => toggle(key)}
                        className={cn(
                          "flex min-h-[52px] items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition",
                          on
                            ? "border-emerald-700 bg-emerald-50 font-semibold text-emerald-900"
                            : "border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        <span className="flex-1 leading-snug">{ft.features[key]}</span>
                        <span
                          aria-hidden="true"
                          className={cn(
                            "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full",
                            on ? "bg-emerald-700 text-white" : "border border-slate-300 bg-white text-slate-400"
                          )}
                        >
                          {on ? <Check className="h-3 w-3" strokeWidth={3.4} /> : <Plus className="h-3 w-3" strokeWidth={2.6} />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {errorText && (
                  <p role="alert" className="mt-3 text-[12.5px] text-red-700">
                    {errorText}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400">
                    {picks.length === 0 ? ft.noAccount : ft.selected.replace("{n}", String(picks.length))}
                  </span>
                  <button
                    type="button"
                    onClick={submitVote}
                    disabled={picks.length === 0 || sending}
                    className="h-11 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    {sending ? ft.sending : ft.countVote}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2.5 pr-9">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                    <Check className="h-3.5 w-3.5 text-emerald-700" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <h3 className="text-[19px] font-bold text-slate-900">{ft.resultsTitle}</h3>
                </div>

                <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-[13.5px] leading-snug text-slate-600">{ft.payQuestion}</p>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {(
                      [
                        ["yes", ft.payYes],
                        ["maybe", ft.payMaybe],
                        ["no", ft.payNo],
                      ] as [PayAnswer, string][]
                    ).map(([answer, label]) => (
                      <button
                        key={answer}
                        type="button"
                        aria-pressed={pay === answer}
                        onClick={() => choosePay(answer)}
                        className={cn(
                          "h-9 rounded-full border px-3.5 text-[13px] font-semibold transition",
                          pay === answer
                            ? "border-emerald-700 bg-emerald-700 text-white"
                            : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">{ft.resultsLabel}</p>
                <div className="mt-3 flex flex-col gap-2.5">
                  {tallies.map((row, index) => {
                    const mine = picks.includes(row.feature);
                    return (
                      <div key={row.feature}>
                        <div className="flex items-baseline gap-2">
                          <span
                            className={cn(
                              "text-[13.5px] leading-snug",
                              mine ? "font-semibold text-emerald-900" : "font-medium text-slate-600"
                            )}
                          >
                            {ft.features[row.feature]}
                          </span>
                          {mine && (
                            <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-px text-[11px] font-bold text-emerald-700">
                              {ft.youBadge}
                            </span>
                          )}
                          <span className="flex-1" />
                          <span
                            className={cn(
                              "shrink-0 text-xs font-bold tabular-nums",
                              mine ? "text-emerald-700" : "text-slate-400"
                            )}
                          >
                            {row.votes}
                          </span>
                        </div>
                        <span className="mt-1.5 block h-2 overflow-hidden rounded-full bg-slate-100">
                          <span
                            className={cn("vote-bar block h-full rounded-full", mine ? "bg-emerald-700" : "bg-slate-300")}
                            style={{
                              width: revealed ? `${Math.max(4, Math.round((row.votes / topVotes) * 100))}%` : "0%",
                              transitionDelay: `${index * 70}ms`,
                            }}
                          />
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  {emailed ? (
                    <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 px-4 py-3">
                      <Check className="h-4 w-4 shrink-0 text-emerald-700" strokeWidth={2.6} aria-hidden="true" />
                      <span className="text-[13.5px] font-semibold text-emerald-800">{ft.thanksMail}</span>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{ft.notifyLead}</p>
                      <form onSubmit={submitEmail} noValidate className="mt-2.5 flex flex-wrap gap-2">
                        <label htmlFor="notify-email" className="sr-only">
                          {ft.emailPlaceholder}
                        </label>
                        <input
                          id="notify-email"
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          onChange={(event) => {
                            setEmail(event.target.value);
                            setError((current) => (current === "email" ? null : current));
                          }}
                          placeholder={ft.emailPlaceholder}
                          aria-invalid={error === "email" || undefined}
                          aria-describedby={errorText ? "vote-error" : undefined}
                          className={cn(
                            "min-w-0 flex-[1_1_14rem] rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none transition-colors",
                            "placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/50",
                            error === "email" ? "border-red-600" : "border-slate-200"
                          )}
                        />
                        {/* Honeypot: off-screen, skipped by keyboard and screen
                            readers. People never fill it; form-filling bots do. */}
                        <input
                          type="text"
                          name="mf-extra"
                          tabIndex={-1}
                          autoComplete="off"
                          aria-hidden="true"
                          value={honeypot}
                          onChange={(event) => setHoneypot(event.target.value)}
                          className="absolute -left-[9999px] h-px w-px opacity-0"
                        />
                        <button
                          type="submit"
                          disabled={sending}
                          className="h-11 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-60"
                        >
                          {sending ? ft.sending : ft.notify}
                        </button>
                      </form>
                      {errorText && (
                        <p id="vote-error" role="alert" className="mt-2 text-[12.5px] text-red-700">
                          {errorText}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                        <p aria-live="polite" className="text-xs text-slate-400">
                          {status}
                        </p>
                        <button
                          type="button"
                          onClick={() => endTeaser("just_vote")}
                          className="h-9 text-[13px] font-semibold text-slate-500 underline decoration-slate-300 underline-offset-[3px] transition hover:text-slate-700"
                        >
                          {ft.justVote}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>,
          document.body
        )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Check, ChevronDown, Info, MessageSquare, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  IDEA_MAX_CHARS,
  boardOrder,
  completeTallies,
  isFeatureKey,
  isPaidInterestFeature,
  markTeaserAnswered,
  paidInterestEnabled,
  type ChoiceKey,
  type FeatureKey,
  type FeatureTally,
  type InviteArm,
  type TeaserExit,
} from "@/lib/feature-teaser";
import {
  trackIdeaSent,
  trackInviteDismissed,
  trackInviteOpened,
  trackInviteViewed,
  trackPaidPromptShown,
  trackVoteBoardClosed,
  trackVoteResultsViewed,
  trackVoteSaved,
} from "@/lib/analytics";
import { postIdea } from "@/lib/probe-client";
import { useSeenOnce } from "@/hooks/use-seen-once";
import { EmailUpdatesForm, Honeypot, PaidInterestQuestions, TextFeedbackForm } from "./probe-forms";
import type { Dictionary } from "@/i18n";

/**
 * The vote invitation and the vote board (display rules: src/lib/feature-teaser.ts).
 *
 * The invitation sits in the post-convert slot, in one of two arms fixed per
 * browser: the one-line teaser (control) or a card that asks about the format
 * just exported (card). Opening it shows the board — a modal on desktop, a
 * sheet on a phone — in two states:
 *
 *   1. vote  one choice among the features (in this browser's shuffled order),
 *            "Something else" with a private text box, or "Nothing missing".
 *            No counts anywhere: a visible leaderboard bends the vote.
 *   2. done  the confirmation, then optional follow-ups: an email for updates
 *            (or, with the paid path on, the paid-interest questions), "What
 *            do you do today when you need this?", and the results behind
 *            "See all results".
 */

type Phase = "vote" | "done";

interface FeatureTeaserProps {
  dict: Dictionary;
  locale: string;
  arm: InviteArm;
  /** The format just exported; the card asks about Word exports by name. */
  format: string;
  /** Which invitation this is for the browser (1st, 2nd…), for analytics. */
  impressions: number;
  /** The visitor voted. */
  onAnswered: () => void;
  /** Take the invitation off the page. */
  onDismiss: () => void;
}

export function FeatureTeaser({ dict, locale, arm, format, impressions, onAnswered, onDismiss }: FeatureTeaserProps) {
  const ft = dict.featureTeaser;
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("vote");
  const [order] = useState<FeatureKey[]>(() => boardOrder());
  const [choice, setChoice] = useState<ChoiceKey | null>(null);
  const [otherText, setOtherText] = useState("");
  const [tallies, setTallies] = useState<FeatureTally[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [sending, setSending] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstRowRef = useRef<HTMLButtonElement>(null);
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The funnel lives in refs: state would be stale inside the unmount cleanup
  // that catches an invitation nobody closed.
  const shownAtRef = useRef(Date.now());
  const openedAtRef = useRef(0);
  const openedRef = useRef(false);
  const votedRef = useRef(false);
  const endedRef = useRef(false);
  const resultsTrackedRef = useRef(false);

  const seenRef = useSeenOnce<HTMLDivElement>(() => trackInviteViewed(arm, format, impressions));

  /** One terminal event per invitation: vote_saved (sent on the vote) or invite_dismissed. */
  const trackEnd = useCallback(
    (how: TeaserExit) => {
      if (endedRef.current) return;
      endedRef.current = true;
      if (votedRef.current) return;
      trackInviteDismissed(arm, {
        how,
        stage: openedRef.current ? "vote" : "teaser",
        dwellMs: Date.now() - shownAtRef.current,
      });
    },
    [arm]
  );

  const endTeaser = useCallback(
    (how: TeaserExit) => {
      trackEnd(how);
      onDismiss();
    },
    [trackEnd, onDismiss]
  );

  // The page can take the invitation away without anyone closing it. React's
  // development double-invoke unmounts and remounts with the same refs, hence
  // the reset.
  useEffect(() => {
    endedRef.current = false;
    return () => trackEnd("abandoned");
  }, [trackEnd]);

  useEffect(() => {
    return () => {
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  const closeDialog = useCallback(
    (how: TeaserExit) => {
      trackVoteBoardClosed(arm, how, votedRef.current);
      setOpen(false);
      if (votedRef.current) {
        // Done: the invitation has served its purpose.
        endTeaser("done");
      } else {
        // The invitation stays, so the visitor can come back to it.
        triggerRef.current?.focus();
      }
    },
    [arm, endTeaser]
  );

  // Escape closes, and the page behind does not scroll while the board is up.
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

  const openDialog = useCallback(() => {
    trackInviteOpened(arm, format);
    openedRef.current = true;
    openedAtRef.current = Date.now();
    setOpen(true);
    // Reopening after a vote returns to the confirmation: one browser, one vote.
    setPhase(votedRef.current ? "done" : "vote");
  }, [arm, format]);

  const canSave = choice !== null && (choice !== "other" || otherText.trim().length > 0) && !sending;

  const submitVote = useCallback(async () => {
    if (!choice || sending) return;
    if (choice === "other" && !otherText.trim()) return;
    setSending(true);
    setSaveFailed(false);
    const elapsedMs = Date.now() - openedAtRef.current;
    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ choice, website: honeypot, elapsedMs }),
      });
      if (!response.ok) {
        setSaveFailed(true);
        return;
      }
      const data = (await response.json()) as { tallies?: { feature: string; votes: number }[] };
      setTallies(completeTallies(data.tallies ?? [], choice));
      trackVoteSaved(arm, choice, format);
      if (choice === "other") {
        // The typed text goes to its own private store; the vote above counts either way.
        const text = otherText.trim();
        void postIdea({
          kind: "other",
          feature: null,
          text,
          locale,
          website: honeypot,
          elapsedMs,
        }).then((ok) => {
          if (ok) trackIdeaSent("other", null);
        });
      }
      votedRef.current = true;
      // They answered. No later conversion invites them again, this week or ever.
      markTeaserAnswered();
      onAnswered();
      setPhase("done");
    } catch {
      setSaveFailed(true);
    } finally {
      setSending(false);
    }
  }, [choice, sending, otherText, honeypot, arm, format, locale, onAnswered]);

  const toggleResults = useCallback(() => {
    setShowResults((current) => {
      const next = !current;
      if (next) {
        if (!resultsTrackedRef.current) {
          resultsTrackedRef.current = true;
          trackVoteResultsViewed(arm);
        }
        setRevealed(false);
        revealTimerRef.current = setTimeout(() => setRevealed(true), 60);
      }
      return next;
    });
  }, [arm]);

  const choiceLabel = (key: ChoiceKey) =>
    key === "other" ? ft.other : key === "nothing" ? ft.nothing : ft.features[key];
  const topVotes = tallies.length > 0 ? Math.max(...tallies.map((row) => row.votes), 1) : 1;
  const showPaidLine = paidInterestEnabled();

  const invitation =
    arm === "card" ? (
      <div
        ref={seenRef}
        data-testid="feature-teaser"
        data-arm="card"
        className="pop-in relative flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
      >
        <div className="flex items-start gap-3 pr-8 sm:flex-1 sm:items-center">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-emerald-700">
            <MessageSquare className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="pt-1 text-sm font-semibold leading-snug text-slate-800 sm:pt-0">
            {format === "docx" ? ft.card.word : ft.card.other}
          </p>
        </div>
        <button
          ref={triggerRef}
          type="button"
          onClick={openDialog}
          data-testid="feature-teaser-open"
          className="ml-11 inline-flex h-11 shrink-0 items-center justify-center rounded-full border border-emerald-700 bg-white px-4 text-[13.5px] font-semibold text-emerald-700 transition hover:bg-emerald-100 sm:ml-0 sm:mr-8 sm:h-9"
        >
          {ft.card.cta}
        </button>
        <button
          type="button"
          onClick={() => endTeaser("close")}
          aria-label={ft.dismiss}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-emerald-100 hover:text-slate-700 sm:top-1/2 sm:-translate-y-1/2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    ) : (
      <div
        ref={seenRef}
        data-testid="feature-teaser"
        data-arm="control"
        className="pop-in relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p className="flex items-start gap-2.5 pr-6 text-sm leading-relaxed text-slate-600">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" />
            <span>
              <span className="font-semibold text-slate-700">{ft.control.teaser}</span>{" "}
              <span className="text-slate-500">{ft.control.lead}</span>
            </span>
          </p>
          <button
            ref={triggerRef}
            type="button"
            onClick={openDialog}
            data-testid="feature-teaser-open"
            // sm:mr-5 keeps the button clear of the dismiss ×.
            className="inline-flex h-11 shrink-0 items-center gap-1.5 self-start rounded-full px-1 text-[13.5px] font-semibold text-emerald-700 transition hover:text-emerald-800 sm:mr-5 sm:h-9 sm:px-3"
          >
            {ft.control.cta}
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => endTeaser("close")}
          aria-label={ft.dismiss}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );

  return (
    <>
      {invitation}

      {/* The invitation animates in (a transform), which would trap a fixed
          overlay inside it, so the board is portalled onto the body. */}
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
              aria-labelledby="vote-board-title"
              data-testid="feature-vote-dialog"
              data-phase={phase}
              onClick={(event) => event.stopPropagation()}
              className="relative max-h-[92vh] w-full max-w-[640px] overflow-y-auto rounded-t-3xl bg-white px-5 pb-6 pt-5 shadow-2xl sm:rounded-2xl sm:px-7 sm:pb-6 sm:pt-6"
            >
              <span className="mx-auto mb-3 block h-1 w-10 rounded-full bg-slate-200 sm:hidden" aria-hidden="true" />
              <button
                type="button"
                onClick={() => closeDialog("close")}
                aria-label={ft.dismiss}
                className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 sm:right-4 sm:top-4 sm:h-8 sm:w-8"
              >
                <X className="h-4 w-4" />
              </button>

              {phase === "vote" ? (
                <div>
                  <h3 id="vote-board-title" className="pr-10 text-[20px] font-bold text-slate-900">
                    {ft.voteTitle}
                  </h3>
                  <p className="mt-1.5 text-sm text-slate-500">{ft.voteLead}</p>
                  {showPaidLine && (
                    <p
                      className="mt-3 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2 text-[12.5px] text-slate-600"
                      data-testid="vote-paid-line"
                    >
                      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
                      {ft.paidLine}
                    </p>
                  )}

                  <div role="radiogroup" aria-labelledby="vote-board-title" className="mt-4 flex flex-col gap-1.5">
                    {order.map((key, index) => (
                      <ChoiceRow
                        key={key}
                        buttonRef={index === 0 ? firstRowRef : undefined}
                        label={ft.features[key]}
                        value={key}
                        selected={choice === key}
                        onSelect={() => setChoice(key)}
                      />
                    ))}
                  </div>
                  <div className="mt-2.5 flex flex-col gap-1.5 border-t border-slate-100 pt-2.5 sm:flex-row" role="radiogroup" aria-label={ft.other}>
                    {(["other", "nothing"] as const).map((key) => (
                      <ChoiceRow
                        key={key}
                        label={key === "other" ? ft.other : ft.nothing}
                        value={key}
                        selected={choice === key}
                        onSelect={() => setChoice(key)}
                        compact
                      />
                    ))}
                  </div>

                  {choice === "other" && (
                    <div className="mt-3 flex flex-col gap-1.5">
                      <label htmlFor="vote-other-text" className="text-[13px] font-semibold text-slate-700">
                        {ft.otherLabel}
                      </label>
                      <textarea
                        id="vote-other-text"
                        rows={2}
                        maxLength={IDEA_MAX_CHARS}
                        value={otherText}
                        onChange={(event) => setOtherText(event.target.value)}
                        placeholder={ft.otherPlaceholder}
                        className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/50 sm:text-sm"
                      />
                      <span className="text-xs text-slate-500">
                        {ft.privateHint} · {otherText.length}/{IDEA_MAX_CHARS}
                      </span>
                    </div>
                  )}

                  <Honeypot value={honeypot} onChange={setHoneypot} />

                  {saveFailed && (
                    <p role="alert" className="mt-3 text-[12.5px] text-red-700">
                      {ft.errSave}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <span className="text-xs text-slate-500">{ft.noAccount}</span>
                    <button
                      type="button"
                      onClick={submitVote}
                      disabled={!canSave}
                      data-testid="vote-save"
                      className="h-11 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                    >
                      {sending ? ft.sending : ft.save}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2.5 pr-10">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                      <Check className="h-3.5 w-3.5 text-emerald-700" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <h3 id="vote-board-title" className="text-[19px] font-bold text-slate-900">
                      {ft.savedTitle}
                    </h3>
                  </div>
                  {choice && (
                    <p className="ml-[38px] mt-1 text-[13px] text-slate-500">
                      {ft.yourChoice.replace("{choice}", choiceLabel(choice))}
                    </p>
                  )}

                  {choice && isFeatureKey(choice) && (
                    <div className="mt-4 flex flex-col gap-3">
                      <div className="rounded-2xl border border-slate-200 px-4 py-3.5">
                        {showPaidLine && isPaidInterestFeature(choice) ? (
                          <PaidVoteFollowUp dict={dict} locale={locale} feature={choice} />
                        ) : (
                          <EmailUpdatesForm
                            dict={dict}
                            locale={locale}
                            feature={choice}
                            source="vote"
                            label={
                              <>
                                {ft.updatesLabel.replace("{feature}", ft.features[choice])}{" "}
                                <span className="font-normal text-slate-500">{ft.emailOptional}</span>
                              </>
                            }
                            placeholder={ft.emailPlaceholder}
                            doneText={ft.updatesDone.replace("{feature}", ft.features[choice])}
                            testId="vote-updates"
                          />
                        )}
                      </div>
                      <div className="rounded-2xl border border-slate-200 px-4 py-3.5">
                        <TextFeedbackForm
                          dict={dict}
                          locale={locale}
                          kind="workaround"
                          feature={choice}
                          label={
                            <>
                              {ft.todayLabel} <span className="font-normal text-slate-500">{ft.optional}</span>
                            </>
                          }
                          placeholder={ft.todayPlaceholder}
                          doneText={ft.todayDone}
                          testId="vote-workaround"
                        />
                      </div>
                    </div>
                  )}
                  {choice === "other" && (
                    <p className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-[13.5px] font-semibold text-slate-700">
                      <Check className="h-4 w-4 shrink-0 text-emerald-700" strokeWidth={2.6} aria-hidden="true" />
                      {ft.otherDone}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={toggleResults}
                      aria-expanded={showResults}
                      data-testid="vote-results-toggle"
                      className="inline-flex h-11 items-center gap-1.5 text-[13px] font-semibold text-slate-600 transition hover:text-slate-800 sm:h-9"
                    >
                      {showResults ? ft.hideResults : ft.seeResults}
                      <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showResults && "rotate-180")} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => closeDialog("done")}
                      className="h-11 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 sm:h-10"
                    >
                      {ft.done}
                    </button>
                  </div>
                  {showResults && (
                    <div className="mt-2 flex flex-col gap-2" data-testid="vote-results">
                      {tallies.map((row, index) => {
                        const mine = choice === row.feature;
                        return (
                          <div key={row.feature} className="grid grid-cols-[minmax(0,1fr)_2rem] items-center gap-x-3 gap-y-1 sm:grid-cols-[18rem_minmax(0,1fr)_2rem]">
                            <span className={cn("text-[12.5px] leading-snug", mine ? "font-semibold text-emerald-900" : "font-medium text-slate-600")}>
                              {ft.features[row.feature]}
                            </span>
                            <span className="order-3 col-span-2 block h-1.5 overflow-hidden rounded-full bg-slate-100 sm:order-none sm:col-span-1">
                              <span
                                className={cn("vote-bar block h-full rounded-full", mine ? "bg-emerald-700" : "bg-slate-300")}
                                style={{
                                  width: revealed ? `${Math.max(3, Math.round((row.votes / topVotes) * 100))}%` : "0%",
                                  transitionDelay: `${index * 60}ms`,
                                }}
                              />
                            </span>
                            <span className="text-right text-xs font-bold tabular-nums text-slate-500">{row.votes}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

function ChoiceRow({
  label,
  value,
  selected,
  onSelect,
  buttonRef,
  compact = false,
}: {
  label: string;
  value: string;
  selected: boolean;
  onSelect: () => void;
  buttonRef?: React.Ref<HTMLButtonElement>;
  compact?: boolean;
}) {
  return (
    <button
      ref={buttonRef}
      type="button"
      role="radio"
      aria-checked={selected}
      data-choice={value}
      onClick={onSelect}
      className={cn(
        "flex min-h-[46px] items-center gap-3 rounded-xl border px-4 py-2 text-left text-sm transition",
        compact && "sm:flex-1",
        selected
          ? "border-emerald-700 bg-emerald-50 font-semibold text-emerald-900"
          : "border-slate-200 bg-white font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
      )}
    >
      <span className="flex-1 leading-snug">{label}</span>
      <span
        aria-hidden="true"
        className={cn(
          "h-[18px] w-[18px] shrink-0 rounded-full bg-white",
          selected ? "border-[5px] border-emerald-700" : "border-[1.5px] border-slate-300"
        )}
      />
    </button>
  );
}

/** After a vote for a candidate paid feature, with the paid path on. */
function PaidVoteFollowUp({ dict, locale, feature }: { dict: Dictionary; locale: string; feature: FeatureKey }) {
  const label = dict.featureTeaser.features[feature];
  useEffect(() => {
    trackPaidPromptShown("vote", feature);
  }, [feature]);
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-semibold text-slate-800">{dict.paidInterest.vote.replace("{feature}", label)}</p>
      <PaidInterestQuestions dict={dict} locale={locale} trigger="vote" feature={feature} featureLabel={label} />
    </div>
  );
}

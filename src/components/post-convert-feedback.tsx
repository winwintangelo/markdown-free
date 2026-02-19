"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ThumbsUp, ThumbsDown, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackFeedbackPositive, trackFeedbackNegative, trackFeedbackSkipped } from "@/lib/analytics";
import type { Dictionary } from "@/i18n";

type FeedbackPhase = "prompt" | "celebrating" | "form" | "submitted";

interface ConfettiPiece {
  id: number;
  left: string;
  delay: string;
  emoji: string;
}

interface PostConvertFeedbackProps {
  format: string;
  dict: Dictionary;
  onDismiss: () => void;
}

const CONFETTI_EMOJIS = ["🎉", "✨", "🎊", "⭐", "💫", "🌟"];

export function PostConvertFeedback({ format, dict, onDismiss }: PostConvertFeedbackProps) {
  const [phase, setPhase] = useState<FeedbackPhase>("prompt");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const dismissTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const pcf = dict.postConvertFeedback;

  // Chip options derived from dictionary
  const chipOptions = [
    { key: "formatting", label: pcf.optionFormatting },
    { key: "missing_content", label: pcf.optionMissingContent },
    { key: "tables_code", label: pcf.optionTablesCode },
    { key: "layout", label: pcf.optionLayout },
    { key: "too_slow", label: pcf.optionTooSlow },
    { key: "hard_to_use", label: pcf.optionHardToUse },
    { key: "missing_feature", label: pcf.optionMissingFeature },
  ];

  // Auto-focus textarea when form phase opens
  useEffect(() => {
    if (phase === "form" && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [phase]);

  // Cleanup dismiss timer on unmount
  useEffect(() => {
    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
    };
  }, []);

  const scheduleDismiss = useCallback((ms: number) => {
    dismissTimerRef.current = setTimeout(onDismiss, ms);
  }, [onDismiss]);

  const handleThumbUp = useCallback(() => {
    trackFeedbackPositive(format);
    const pieces: ConfettiPiece[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      delay: `${Math.random() * 0.3}s`,
      emoji: CONFETTI_EMOJIS[Math.floor(Math.random() * CONFETTI_EMOJIS.length)],
    }));
    setConfetti(pieces);
    setPhase("celebrating");
    scheduleDismiss(3000);
  }, [format, scheduleDismiss]);

  const handleThumbDown = useCallback(() => {
    setPhase("form");
  }, []);

  const toggleCategory = useCallback((key: string) => {
    setSelectedCategories((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      trackFeedbackNegative(format, selectedCategories, comment.trim() || undefined);
      setPhase("submitted");
      scheduleDismiss(2500);
    },
    [format, selectedCategories, comment, scheduleDismiss]
  );

  const handleSkip = useCallback(() => {
    trackFeedbackSkipped(format);
    onDismiss();
  }, [format, onDismiss]);

  return (
    <div className="pop-in relative overflow-hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      {/* Dismiss button (shown during prompt and form phases) */}
      {(phase === "prompt" || phase === "form") && (
        <button
          type="button"
          onClick={handleSkip}
          aria-label={pcf.skip}
          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-100 hover:text-slate-500"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}

      {/* ── Phase: prompt ─────────────────────────────────── */}
      {phase === "prompt" && (
        <div className="flex items-center justify-between gap-4 pr-6">
          <p className="text-sm text-slate-600">{pcf.question}</p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={handleThumbUp}
              aria-label={pcf.yes}
              className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              {pcf.yes}
            </button>
            <button
              type="button"
              onClick={handleThumbDown}
              aria-label={pcf.no}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              {pcf.no}
            </button>
          </div>
        </div>
      )}

      {/* ── Phase: celebrating ────────────────────────────── */}
      {phase === "celebrating" && (
        <div className="relative flex flex-col items-center py-2 text-center">
          {confetti.map((piece) => (
            <span
              key={piece.id}
              className="confetti-piece pointer-events-none absolute top-0 select-none text-lg"
              style={{ left: piece.left, animationDelay: piece.delay }}
            >
              {piece.emoji}
            </span>
          ))}
          <p className="text-sm font-medium text-emerald-700">{pcf.celebrating}</p>
        </div>
      )}

      {/* ── Phase: form ───────────────────────────────────── */}
      {phase === "form" && (
        <form onSubmit={handleSubmit} className="space-y-3 pr-6">
          <p className="text-sm font-medium text-slate-700">{pcf.tellUsMore}</p>

          {/* Common issue chips */}
          <div className="flex flex-wrap gap-2" role="group" aria-label={pcf.tellUsMore}>
            {chipOptions.map((chip) => {
              const selected = selectedCategories.includes(chip.key);
              return (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => toggleCategory(chip.key)}
                  aria-pressed={selected}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition",
                    selected
                      ? "border-slate-700 bg-slate-800 text-white"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Optional free text */}
          <textarea
            ref={textareaRef}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={pcf.placeholder}
            rows={2}
            className={cn(
              "w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition-colors",
              "placeholder:text-slate-400",
              "focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/50"
            )}
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className="rounded-full px-3 py-1.5 text-xs text-slate-400 transition hover:text-slate-600"
            >
              {pcf.skip}
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-900"
            >
              <Send className="h-3 w-3" />
              {pcf.submit}
            </button>
          </div>
        </form>
      )}

      {/* ── Phase: submitted ──────────────────────────────── */}
      {phase === "submitted" && (
        <div className="flex items-center justify-center py-1">
          <p className="text-sm text-slate-500">{pcf.thankYou}</p>
        </div>
      )}
    </div>
  );
}

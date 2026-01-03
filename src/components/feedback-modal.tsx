"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Send, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { trackFeedbackSubmit } from "@/lib/analytics";
import type { Dictionary } from "@/i18n";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  dict?: Dictionary;
}

// Default dictionary values for backward compatibility
const defaultDict = {
  feedback: {
    title: "Send Feedback",
    placeholder: "What's on your mind? Bug reports, feature requests, or just say hi!",
    emailPlaceholder: "Email (optional, for follow-up)",
    submit: "Send Feedback",
    submitting: "Sending...",
    success: "Thank you! Your feedback has been sent.",
    cancel: "Cancel"
  }
};

export function FeedbackModal({ isOpen, onClose, dict = defaultDict as unknown as Dictionary }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle client-side mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Delay reset to allow close animation
      const timer = setTimeout(() => {
        setFeedback("");
        setEmail("");
        setIsSubmitting(false);
        setIsSubmitted(false);
        setError(null);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      // Validate
      if (!feedback.trim()) {
        setError("Please enter your feedback");
        return;
      }

      setIsSubmitting(true);

      try {
        // Track the feedback submission with Umami
        // Include feedback content and email (if provided) in the event data
        trackFeedbackSubmit({
          feedback: feedback.trim().substring(0, 500), // Limit to 500 chars for analytics
          email: email.trim() || undefined,
          feedbackLength: feedback.trim().length.toString(),
          hasEmail: email.trim() ? "yes" : "no",
        });

        // Simulate a small delay for UX
        await new Promise((resolve) => setTimeout(resolve, 300));

        setIsSubmitted(true);

        // Auto-close after showing success
        setTimeout(() => {
          onClose();
        }, 2000);
      } catch {
        setError("Failed to submit feedback. Please try again.");
        setIsSubmitting(false);
      }
    },
    [feedback, email, onClose]
  );

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 z-[100] w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-modal-title"
      >
        <div className="rounded-2xl border border-slate-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2
              id="feedback-modal-title"
              className="text-lg font-semibold text-slate-900"
            >
              {dict.feedback.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close feedback modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-5 py-4">
            {isSubmitted ? (
              /* Success State */
              <div className="flex flex-col items-center py-6 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <CheckCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">
                  {dict.feedback.success}
                </h3>
              </div>
            ) : (
              /* Form */
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  {/* Feedback field */}
                  <div>
                    <label
                      htmlFor="feedback-input"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Your Feedback <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      ref={textareaRef}
                      id="feedback-input"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={dict.feedback.placeholder}
                      rows={4}
                      className={cn(
                        "w-full resize-none rounded-lg border bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition-colors",
                        "placeholder:text-slate-400",
                        "focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/50",
                        error && !feedback.trim()
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/50"
                          : "border-slate-200"
                      )}
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  {/* Email field */}
                  <div>
                    <label
                      htmlFor="email-input"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Email{" "}
                      <span className="font-normal text-slate-400">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="email"
                      id="email-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={dict.feedback.emailPlaceholder}
                      className={cn(
                        "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800 outline-none transition-colors",
                        "placeholder:text-slate-400",
                        "focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500/50"
                      )}
                      disabled={isSubmitting}
                    />
                    <p className="mt-1 text-xs text-slate-500">
                      Only if you&apos;d like us to follow up with you.
                    </p>
                  </div>

                  {/* Error message */}
                  {error && (
                    <p className="text-sm text-red-600" role="alert">
                      {error}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-5 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    disabled={isSubmitting}
                  >
                    {dict.feedback.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !feedback.trim()}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition",
                      isSubmitting || !feedback.trim()
                        ? "cursor-not-allowed bg-slate-200 text-slate-400"
                        : "bg-emerald-600 text-white hover:bg-emerald-700"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {dict.feedback.submitting}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        {dict.feedback.submit}
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Use portal to render at document.body level, avoiding any parent positioning issues
  return createPortal(modalContent, document.body);
}

"use client";

import { useCallback, useState } from "react";
import { FlaskConical, Loader2 } from "lucide-react";
import { InlineConverter } from "@/components/inline-converter";
import { PreviewCard } from "@/components/preview-card";
import { useConverter } from "@/hooks/use-converter";
import { trackComparisonCta, trackSampleClick, trackUploadStart } from "@/lib/analytics";
import type { Locale, Dictionary } from "@/i18n";
import type { SampleId } from "@/content/intent-pages/types";

/**
 * Live demo block on the long-tail intent pages (build plan Phase 1): the
 * inline converter (drop your own file) plus a one-tap sample that loads the
 * exact failing case — formulas, tables, a diagram, or a chat answer — so the
 * reader sees it rendered on this page and can export it right here.
 */
export function IntentDemo({
  locale,
  dict,
  heading,
  hint,
  readyHint,
  sampleLabel,
  note,
  sample,
}: {
  locale: Locale;
  dict: Dictionary;
  heading: string;
  hint: string;
  readyHint: string;
  sampleLabel: string;
  note: string;
  sample: SampleId;
}) {
  const { state, dispatch } = useConverter();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const loadSample = useCallback(async () => {
    setFailed(false);
    setLoading(true);
    trackSampleClick();
    trackUploadStart("sample");
    try {
      const response = await fetch(`/samples/${sample}.md`);
      if (!response.ok) throw new Error(`sample ${sample} unavailable`);
      const content = await response.text();
      dispatch({ type: "LOAD_SAMPLE", content, size: new Blob([content]).size });
      trackComparisonCta("converter", "inline");
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [dispatch, sample]);

  return (
    <div className="not-prose my-8" data-testid="intent-demo">
      <InlineConverter locale={locale} dict={dict} heading={heading} hint={hint} readyHint={readyHint} />
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <button
          type="button"
          onClick={loadSample}
          disabled={loading}
          data-testid="intent-load-sample"
          className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-800 transition hover:border-emerald-300 hover:bg-emerald-100 disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FlaskConical className="h-3.5 w-3.5" />}
          {sampleLabel}
        </button>
        <span className="text-xs text-slate-500">{note}</span>
        {failed && (
          <span className="text-xs text-red-600" role="alert">
            {dict.errors.sampleError}
          </span>
        )}
      </div>
      {state.content && (
        <div className="mt-6">
          <PreviewCard locale={locale} dict={dict} />
        </div>
      )}
    </div>
  );
}

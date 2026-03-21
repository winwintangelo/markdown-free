"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { markdownToHtml } from "@/lib/markdown";
import { useConverter } from "@/hooks/use-converter";
import { useSectionVisibility } from "@/hooks/use-engagement-tracking";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Locale, Dictionary } from "@/i18n";

interface PreviewCardProps {
  locale?: Locale;
  dict?: Dictionary;
}

// Default dictionary values for backward compatibility
const defaultDict = {
  preview: {
    title: "Preview",
    waiting: "Waiting for Markdown…",
    ready: "Ready to export",
    uploadedFile: "uploaded file",
    pastedText: "pasted text",
    sampleFile: "sample file",
    howItWorks: {
      title: "How it works",
      step1: "Upload a .md file or paste Markdown text.",
      step2: "See the formatted preview right here.",
      step3: "Click To PDF, To TXT, or To HTML to download your converted file.",
      note: "Once you add your own Markdown, this preview will update to match it."
    }
  }
};

export function PreviewCard({ locale: _locale, dict = defaultDict as unknown as Dictionary }: PreviewCardProps) {
  const { state } = useConverter();
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [isRendering, setIsRendering] = useState(false);
  const sectionRef = useSectionVisibility("preview");
  const isMobile = useIsMobile();
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false);

  // Render markdown when content changes
  useEffect(() => {
    if (!state.content) {
      setRenderedHtml("");
      return;
    }

    setIsRendering(true);
    markdownToHtml(state.content.content)
      .then((html) => {
        setRenderedHtml(html);
        setIsRendering(false);
      })
      .catch((error) => {
        console.error("Markdown rendering error:", error);
        setRenderedHtml("<p>Error rendering markdown</p>");
        setIsRendering(false);
      });
  }, [state.content]);

  // Determine badge content
  const getBadgeContent = () => {
    if (isRendering) {
      return {
        dotColor: "bg-amber-500",
        text: "Rendering...",
      };
    }
    if (!state.content) {
      return {
        dotColor: "bg-slate-300",
        text: dict.preview.waiting,
      };
    }
    if (state.content.source === "file") {
      return {
        dotColor: "bg-emerald-500",
        text: `${dict.preview.ready} (${dict.preview.uploadedFile})`,
      };
    }
    if (state.content.source === "sample") {
      return {
        dotColor: "bg-emerald-500",
        text: `${dict.preview.ready} (${dict.preview.sampleFile})`,
      };
    }
    return {
      dotColor: "bg-emerald-500",
      text: `${dict.preview.ready} (${dict.preview.pastedText})`,
    };
  };

  const badge = getBadgeContent();

  // Default content when no file is loaded
  const DefaultContent = () => {
    if (isMobile) {
      // Compact placeholder on mobile to save vertical space
      return (
        <p className="text-center text-sm text-slate-400" data-testid="mobile-preview-placeholder">
          {dict.preview.howItWorks.note}
        </p>
      );
    }
    return (
      <>
        <h2>{dict.preview.howItWorks.title}</h2>
        <ol>
          <li>{dict.preview.howItWorks.step1}</li>
          <li>{dict.preview.howItWorks.step2}</li>
          <li>{dict.preview.howItWorks.step3}</li>
        </ol>
        <p className="text-slate-500">
          {dict.preview.howItWorks.note}
        </p>
      </>
    );
  };

  return (
    <div ref={sectionRef} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {dict.preview.title}
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
          <span
            className={cn("inline-block h-1.5 w-1.5 rounded-full", badge.dotColor)}
          />
          {badge.text}
        </span>
      </div>

      {/* Content */}
      <div
        className={cn(
          "relative px-5 py-4 text-sm leading-relaxed",
          // Desktop: fixed max-height with inner scroll
          !isMobile && "max-h-[420px] overflow-auto preview-scroll",
          // Mobile with content: clamp to ~600px unless expanded
          isMobile && state.content && renderedHtml && !isPreviewExpanded && "max-h-[600px] overflow-hidden",
        )}
      >
        {/* Fade gradient on mobile when clamped */}
        {isMobile && state.content && renderedHtml && !isPreviewExpanded && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-white" />
        )}
        <article
          className={cn(
            "prose prose-sm max-w-none",
            // Headings
            "prose-headings:mt-4 prose-headings:mb-2",
            "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
            // Code
            "prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5",
            "prose-code:before:content-none prose-code:after:content-none",
            // Code blocks
            "prose-pre:bg-slate-950/90 prose-pre:text-slate-50 prose-pre:shadow-inner",
            // Code inside pre blocks (ensure proper contrast)
            "[&_pre_code]:bg-transparent [&_pre_code]:text-slate-50 [&_pre_code]:p-0",
            // Links
            "prose-a:text-emerald-600 prose-a:no-underline hover:prose-a:underline",
            // Tables
            "prose-table:border prose-table:border-slate-200",
            "prose-th:bg-slate-50 prose-th:border prose-th:border-slate-200 prose-th:px-3 prose-th:py-2",
            "prose-td:border prose-td:border-slate-200 prose-td:px-3 prose-td:py-2"
          )}
        >
          {state.content && renderedHtml ? (
            <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          ) : (
            <DefaultContent />
          )}
        </article>
      </div>

      {/* Mobile: expand/collapse toggle (only when content is loaded) */}
      {isMobile && state.content && renderedHtml && (
        <button
          type="button"
          onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}
          data-testid="preview-expand-toggle"
          className="flex w-full items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-xs font-semibold text-emerald-600 transition hover:bg-emerald-50"
        >
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", isPreviewExpanded && "rotate-180")} />
          {isPreviewExpanded
            ? (dict.preview.collapsePreview || "Collapse preview")
            : (dict.preview.showFullPreview || "Show full preview")}
        </button>
      )}
    </div>
  );
}

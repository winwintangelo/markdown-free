"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { markdownToHtml } from "@/lib/markdown";
import { useConverter } from "@/hooks/use-converter";
import { useSectionVisibility } from "@/hooks/use-engagement-tracking";
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
  const DefaultContent = () => (
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
      <div className="max-h-[420px] overflow-auto px-5 py-4 text-sm leading-relaxed preview-scroll">
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
    </div>
  );
}

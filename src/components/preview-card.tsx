"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { markdownToHtml } from "@/lib/markdown";
import { useConverter } from "@/hooks/use-converter";

export function PreviewCard() {
  const { state } = useConverter();
  const [renderedHtml, setRenderedHtml] = useState<string>("");
  const [isRendering, setIsRendering] = useState(false);

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
        text: "Waiting for Markdown…",
      };
    }
    if (state.content.source === "file") {
      return {
        dotColor: "bg-emerald-500",
        text: "Ready to export (uploaded file)",
      };
    }
    return {
      dotColor: "bg-emerald-500",
      text: "Ready to export (pasted text)",
    };
  };

  const badge = getBadgeContent();

  // Default content when no file is loaded
  const DefaultContent = () => (
    <>
      <h2>How it works</h2>
      <ol>
        <li>
          Upload a <code>.md</code> file or paste Markdown text.
        </li>
        <li>See the formatted preview right here.</li>
        <li>
          Click <strong>To PDF</strong>, <strong>To TXT</strong>, or{" "}
          <strong>To HTML</strong> to download your converted file.
        </li>
      </ol>
      <p className="text-slate-500">
        Once you add your own Markdown, this preview will update to match it.
      </p>
    </>
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Preview
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

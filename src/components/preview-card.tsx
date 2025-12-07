"use client";

import { cn } from "@/lib/utils";
import { useConverter } from "@/hooks/use-converter";

export function PreviewCard() {
  const { state } = useConverter();

  // Determine badge content
  const getBadgeContent = () => {
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
      <h2 className="text-xl font-semibold mt-0 mb-2">How it works</h2>
      <ol className="list-decimal list-inside space-y-1">
        <li>
          Upload a <code className="rounded bg-slate-100 px-1 py-0.5">.md</code>{" "}
          file or paste Markdown text.
        </li>
        <li>See the formatted preview right here.</li>
        <li>
          Click <strong>To PDF</strong>, <strong>To TXT</strong>, or{" "}
          <strong>To HTML</strong> to download your converted file.
        </li>
      </ol>
      <p className="text-slate-500 mt-4">
        Once you add your own Markdown, this preview will update to match it.
      </p>
    </>
  );

  // Raw preview of content (Phase 2 will add proper markdown rendering)
  const ContentPreview = () => {
    if (!state.content) return null;
    
    // For now, just show raw content in a pre tag
    // Phase 2 will implement proper markdown rendering with remark/rehype
    return (
      <pre className="whitespace-pre-wrap font-mono text-xs bg-slate-950/90 text-slate-50 rounded-lg p-3 overflow-x-auto">
        {state.content.content.slice(0, 4000)}
        {state.content.content.length > 4000 && (
          <span className="text-slate-400">
            {"\n\n"}... (showing first 4000 characters)
          </span>
        )}
      </pre>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Preview
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
          <span className={cn("inline-block h-1.5 w-1.5 rounded-full", badge.dotColor)} />
          {badge.text}
        </span>
      </div>

      {/* Content */}
      <div className="max-h-[420px] overflow-auto px-5 py-4 text-sm leading-relaxed preview-scroll">
        <article className="prose prose-sm max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-code:rounded prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-pre:bg-slate-950/90 prose-pre:text-slate-50 prose-pre:shadow-inner">
          {state.content ? <ContentPreview /> : <DefaultContent />}
        </article>
      </div>
    </div>
  );
}


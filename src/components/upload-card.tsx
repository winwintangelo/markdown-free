"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { cn, formatFileSize, isValidFileType, isValidFileSize } from "@/lib/utils";
import { useConverter } from "@/hooks/use-converter";
import { trackUploadStart, trackUploadError, trackUploadHover, trackPasteToggleClick, trackSampleClick } from "@/lib/analytics";
import { useSectionVisibility } from "@/hooks/use-engagement-tracking";

export function UploadCard() {
  const { state, dispatch } = useConverter();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hasTrackedHoverRef = useRef(false);
  const sectionRef = useSectionVisibility("upload");

  const handleFile = useCallback(
    async (file: File) => {
      // Track upload start
      trackUploadStart("file");

      // Validate file type
      if (!isValidFileType(file.name)) {
        trackUploadError("file", "invalid_type");
        dispatch({
          type: "SET_ERROR",
          error: {
            code: "INVALID_TYPE",
            message: "Unsupported file type. Please upload a .md, .markdown or .txt file.",
          },
        });
        return;
      }

      // Validate file size
      if (!isValidFileSize(file.size)) {
        trackUploadError("file", "too_large");
        dispatch({
          type: "SET_ERROR",
          error: {
            code: "FILE_TOO_LARGE",
            message: "File too large. Maximum size is 5MB.",
          },
        });
        return;
      }

      // Read file content
      try {
        const content = await file.text();
        dispatch({
          type: "LOAD_FILE",
          filename: file.name,
          content,
          size: file.size,
        });
      } catch {
        trackUploadError("file", "parse_error");
        dispatch({
          type: "SET_ERROR",
          error: {
            code: "READ_ERROR",
            message: "Unable to read file. Please ensure it's a valid text file.",
          },
        });
      }
    },
    [dispatch]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
      // Reset input so same file can be selected again
      e.target.value = "";
    },
    [handleFile]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handlePasteToggle = useCallback(() => {
    trackPasteToggleClick();
    dispatch({ type: "TOGGLE_PASTE_AREA" });
  }, [dispatch]);

  const handleSampleClick = useCallback(async () => {
    trackSampleClick();
    trackUploadStart("sample");
    try {
      const response = await fetch("/sample.md");
      if (!response.ok) {
        throw new Error("Failed to fetch sample file");
      }
      const content = await response.text();
      const size = new Blob([content]).size;
      dispatch({
        type: "LOAD_SAMPLE",
        content,
        size,
      });
    } catch {
      dispatch({
        type: "SET_ERROR",
        error: {
          code: "SAMPLE_ERROR",
          message: "Unable to load sample file. Please try again.",
        },
      });
    }
  }, [dispatch]);

  const handleMouseEnter = useCallback(() => {
    if (!hasTrackedHoverRef.current) {
      hasTrackedHoverRef.current = true;
      trackUploadHover();
    }
  }, []);

  // Determine status display
  const getStatusDisplay = () => {
    if (state.error) {
      return {
        dotColor: "bg-red-400",
        text: state.error.message,
      };
    }
    if (state.content?.source === "file") {
      return {
        dotColor: "bg-emerald-500",
        text: `${state.content.filename} (${formatFileSize(state.content.size)})`,
      };
    }
    if (state.content?.source === "sample") {
      return {
        dotColor: "bg-emerald-500",
        text: `Sample file loaded (${formatFileSize(state.content.size)})`,
      };
    }
    return {
      dotColor: "bg-slate-300",
      text: "No file selected yet",
    };
  };

  const status = getStatusDisplay();

  return (
    <div
      ref={sectionRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "relative flex cursor-pointer flex-col items-center justify-center",
        "rounded-2xl border-2 border-dashed bg-white px-6 py-10 text-center shadow-sm",
        "transition hover:border-emerald-400 hover:bg-emerald-50/40",
        isDragOver
          ? "border-emerald-400 bg-emerald-50/40"
          : "border-slate-200"
      )}
    >
      {/* Upload icon */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <Upload className="h-6 w-6" strokeWidth={1.6} />
      </div>

      {/* Main text */}
      <p className="text-sm font-medium text-slate-900">
        Drag &amp; drop your Markdown file{" "}
        <span className="font-normal text-slate-500">or</span>{" "}
        <span className="font-semibold text-emerald-600 hover:text-emerald-700">
          choose file
        </span>
      </p>

      {/* Supported formats */}
      <p className="mt-2 text-xs text-slate-500">
        Supports <code>.md</code>, <code>.markdown</code>, <code>.txt</code> •
        Max 5&nbsp;MB
      </p>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.markdown,.txt"
        onChange={handleFileInput}
        className="hidden"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Status indicator */}
      <div className="pointer-events-none mt-4 flex items-center gap-2 text-xs text-slate-500">
        <span className={cn("inline-flex h-1.5 w-1.5 rounded-full", status.dotColor)} />
        <span>{status.text}</span>
      </div>

      {/* Action links */}
      <div className="mt-5 flex items-center gap-3 text-xs">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleSampleClick();
          }}
          className="font-medium text-slate-600 underline-offset-4 hover:text-slate-800 hover:underline"
        >
          Try sample file
        </button>
        <span className="text-slate-300">or</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handlePasteToggle();
          }}
          className="font-medium text-emerald-700 underline-offset-4 hover:underline"
        >
          paste Markdown
        </button>
      </div>
    </div>
  );
}


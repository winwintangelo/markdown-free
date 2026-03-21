"use client";

import { useState, useEffect, useCallback } from "react";

export function useWebShare() {
  const [canShareFiles, setCanShareFiles] = useState(false);
  const [canSharePdf, setCanSharePdf] = useState(false);
  const [canShareDocx, setCanShareDocx] = useState(false);

  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      "share" in navigator &&
      "canShare" in navigator
    ) {
      try {
        // Check general file sharing support
        const testFile = new File(["test"], "test.txt", {
          type: "text/plain",
        });
        setCanShareFiles(navigator.canShare({ files: [testFile] }));

        // Check PDF sharing
        const pdfFile = new File(["test"], "test.pdf", {
          type: "application/pdf",
        });
        setCanSharePdf(navigator.canShare({ files: [pdfFile] }));

        // Check DOCX sharing — many browsers reject this MIME type
        const docxFile = new File(["test"], "test.docx", {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
        // Also try with octet-stream as fallback
        const docxGeneric = new File(["test"], "test.docx", {
          type: "application/octet-stream",
        });
        setCanShareDocx(
          navigator.canShare({ files: [docxFile] }) ||
          navigator.canShare({ files: [docxGeneric] })
        );
      } catch {
        setCanShareFiles(false);
        setCanSharePdf(false);
        setCanShareDocx(false);
      }
    }
  }, []);

  const shareFile = useCallback(
    async (blob: Blob, filename: string): Promise<boolean> => {
      if (!canShareFiles) return false;

      try {
        const file = new File([blob], filename, { type: blob.type });
        await navigator.share({ files: [file] });
        return true;
      } catch (err) {
        // User cancelled the share sheet — not an error
        if (err instanceof Error && err.name === "AbortError") {
          return false;
        }
        throw err;
      }
    },
    [canShareFiles]
  );

  return { canShareFiles, canSharePdf, canShareDocx, shareFile };
}

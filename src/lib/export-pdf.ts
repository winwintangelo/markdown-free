import { downloadFile, generateFilename } from "./download";

export interface PdfExportResult {
  success: boolean;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

export interface PdfGenerateResult {
  success: boolean;
  blob?: Blob;
  filename?: string;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

/**
 * Generate PDF blob without downloading
 */
export async function generatePdfBlob(
  markdown: string,
  originalFilename: string | null,
  signal?: AbortSignal
): Promise<PdfGenerateResult> {
  try {
    const response = await fetch("/api/convert/pdf", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        markdown,
        filename: originalFilename,
      }),
      signal,
    });

    // Handle error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      const errorCode = errorData.error || "UNKNOWN_ERROR";
      const errorMessage = errorData.message || "Something went wrong. Please try again.";

      const retryable = [
        "GENERATION_TIMEOUT",
        "GENERATION_FAILED",
      ].includes(errorCode);

      return {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
          retryable,
        },
      };
    }

    // Get PDF blob
    const pdfBlob = await response.blob();

    // Extract filename from Content-Disposition header or generate one
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = generateFilename(originalFilename, "pdf");

    if (contentDisposition) {
      const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      if (utf8Match) {
        try {
          filename = decodeURIComponent(utf8Match[1]);
        } catch {
          // Fall back to ASCII filename
        }
      }

      if (!utf8Match) {
        const asciiMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (asciiMatch) {
          filename = asciiMatch[1];
        }
      }
    }

    return { success: true, blob: pdfBlob, filename };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return {
          success: false,
          error: {
            code: "ABORTED",
            message: "PDF generation was cancelled.",
            retryable: false,
          },
        };
      }

      if (error.message.includes("fetch") || error.message.includes("network")) {
        return {
          success: false,
          error: {
            code: "NETWORK_ERROR",
            message: "Connection lost. Please check your internet and try again.",
            retryable: true,
          },
        };
      }
    }

    return {
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "Something went wrong. Please try again.",
        retryable: true,
      },
    };
  }
}

/**
 * Export content as PDF via server-side generation (generate + download)
 */
export async function exportPdf(
  markdown: string,
  originalFilename: string | null,
  signal?: AbortSignal
): Promise<PdfExportResult> {
  const result = await generatePdfBlob(markdown, originalFilename, signal);

  if (result.success && result.blob && result.filename) {
    const url = URL.createObjectURL(result.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return { success: result.success, error: result.error };
}


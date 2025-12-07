import { downloadFile, generateFilename } from "./download";

export interface PdfExportResult {
  success: boolean;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

/**
 * Export content as PDF via server-side generation
 */
export async function exportPdf(
  markdown: string,
  originalFilename: string | null,
  signal?: AbortSignal
): Promise<PdfExportResult> {
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
      
      // Determine if error is retryable
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
      const match = contentDisposition.match(/filename="?([^";\n]+)"?/);
      if (match) {
        filename = match[1];
      }
    }

    // Trigger download
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return { success: true };
  } catch (error) {
    // Handle network errors
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


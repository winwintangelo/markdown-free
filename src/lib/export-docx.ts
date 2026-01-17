import { downloadFile, generateFilename } from "./download";

export interface DocxExportResult {
  success: boolean;
  error?: {
    code: string;
    message: string;
    retryable: boolean;
  };
}

/**
 * Export content as DOCX via server-side generation
 */
export async function exportDocx(
  markdown: string,
  originalFilename: string | null,
  signal?: AbortSignal
): Promise<DocxExportResult> {
  try {
    const response = await fetch("/api/convert/docx", {
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

    // Get DOCX as ArrayBuffer to preserve binary data integrity
    const docxArrayBuffer = await response.arrayBuffer();
    
    // Debug: log buffer size
    console.log("[DOCX Export] Received buffer size:", docxArrayBuffer.byteLength);
    
    // Verify it starts with PK (ZIP/DOCX magic bytes)
    const header = new Uint8Array(docxArrayBuffer.slice(0, 4));
    const isPK = header[0] === 0x50 && header[1] === 0x4B;
    console.log("[DOCX Export] Starts with PK (valid ZIP):", isPK, "Header bytes:", Array.from(header));
    
    // Create blob with explicit MIME type for Word documents
    const docxBlob = new Blob([docxArrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    
    console.log("[DOCX Export] Blob size:", docxBlob.size, "type:", docxBlob.type);

    // Extract filename from Content-Disposition header or generate one
    const contentDisposition = response.headers.get("Content-Disposition");
    let filename = generateFilename(originalFilename, "docx");

    if (contentDisposition) {
      // Try to get UTF-8 encoded filename first (filename*=UTF-8''...)
      const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;\s]+)/i);
      if (utf8Match) {
        try {
          filename = decodeURIComponent(utf8Match[1]);
        } catch {
          // Fall back to ASCII filename
        }
      }
      
      // If no UTF-8 filename, try regular filename
      if (!utf8Match) {
        const asciiMatch = contentDisposition.match(/filename="?([^";\n]+)"?/);
        if (asciiMatch) {
          filename = asciiMatch[1];
        }
      }
    }
    
    console.log("[DOCX Export] Downloading as:", filename);

    // Trigger download
    const url = URL.createObjectURL(docxBlob);
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
            message: "DOCX generation was cancelled.",
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

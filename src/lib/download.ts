/**
 * Trigger a file download in the browser
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  
  // Append to body, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  URL.revokeObjectURL(url);
}

/**
 * Generate a filename based on source
 * - For uploaded files: uses original filename with new extension
 * - For pasted content: generates timestamp-based filename
 */
export function generateFilename(
  originalFilename: string | null,
  extension: string
): string {
  if (originalFilename) {
    // Remove existing extension and add new one
    const baseName = originalFilename.replace(/\.(md|markdown|txt)$/i, "");
    // Replace spaces with hyphens
    const safeName = baseName.replace(/\s+/g, "-");
    return `${safeName}.${extension}`;
  }
  
  // Generate timestamp-based filename for pasted content
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[-:]/g, "")
    .replace("T", "-")
    .slice(0, 15);
  return `markdown-${timestamp}.${extension}`;
}


import { downloadFile, generateFilename } from "./download";

/**
 * Export content as a TXT file
 * Returns the original markdown source (not stripped)
 * UTF-8 encoding, preserves line endings
 */
export function exportTxt(content: string, originalFilename: string | null): void {
  const filename = generateFilename(originalFilename, "txt");
  downloadFile(content, filename, "text/plain;charset=utf-8");
}


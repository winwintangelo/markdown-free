import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Check if file extension is valid
 */
export function isValidFileType(filename: string): boolean {
  const validExtensions = [".md", ".markdown", ".txt"];
  const lowerName = filename.toLowerCase();
  return validExtensions.some((ext) => lowerName.endsWith(ext));
}

/**
 * Max file size in bytes (1MB)
 * Must match server-side MAX_CONTENT_SIZE in api/convert/pdf/route.ts
 * Keeping client and server limits in sync ensures "fail fast" UX
 */
export const MAX_FILE_SIZE = 1 * 1024 * 1024;

/**
 * Check if file size is within limit
 */
export function isValidFileSize(size: number): boolean {
  return size <= MAX_FILE_SIZE;
}


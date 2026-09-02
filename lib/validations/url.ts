import { z } from "zod";

/**
 * Validates that a URL string is safe (strictly http:// or https://, or relative / path),
 * explicitly rejecting dangerous schemes such as javascript:, data:, vbscript:, and file:.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  const trimmed = url.trim().toLowerCase();

  // Disallow dangerous schemes
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("file:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("//")
  ) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    // Allow safe relative paths starting with /
    if (trimmed.startsWith("/")) {
      return true;
    }
    return false;
  }
}

export const optionalSafeUrl = z
  .string()
  .trim()
  .transform((val) => (val === "" ? undefined : val))
  .pipe(
    z
      .string()
      .refine((val) => isSafeUrl(val), {
        message: "Must be a valid HTTP or HTTPS URL (e.g. https://example.com)",
      })
      .optional()
  );

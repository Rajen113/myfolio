import { resolveTxt } from "dns/promises";
import crypto from "crypto";

/**
 * Generate cryptographically secure verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(16).toString("hex");
}

/**
 * Format expected TXT record value
 */
export function getExpectedTxtRecordValue(token: string): string {
  return `myfolio-verification=${token}`;
}

export interface DnsVerificationResult {
  success: boolean;
  message: string;
  foundRecords?: string[];
}

/**
 * Perform server-side DNS TXT lookup to verify domain ownership.
 * Checks _myfolio.[domain] and [domain] for TXT record containing myfolio-verification=[token]
 */
export async function verifyDomainDns(
  domain: string,
  verificationToken: string
): Promise<DnsVerificationResult> {
  const expectedValue = getExpectedTxtRecordValue(verificationToken);
  const targetSubdomain = `_myfolio.${domain}`;
  const foundRecords: string[] = [];

  const checkHostnames = [targetSubdomain, domain];

  for (const hostname of checkHostnames) {
    try {
      const records = await resolveTxt(hostname);

      for (const chunkArray of records) {
        // DNS TXT chunks are arrays of strings that need joining
        const txtValue = chunkArray.join("").trim();
        foundRecords.push(txtValue);

        if (
          txtValue === expectedValue ||
          txtValue === verificationToken ||
          txtValue.toLowerCase() === expectedValue.toLowerCase()
        ) {
          return {
            success: true,
            message: "✓ Domain ownership successfully verified via DNS TXT record!",
            foundRecords,
          };
        }
      }
    } catch (err: unknown) {
      // DNS resolution failure for this hostname — continue checking fallback
      const code = (err as { code?: string })?.code;
      if (code !== "ENOTFOUND" && code !== "ENODATA" && code !== "ESERVFAIL") {
        console.warn(`DNS lookup warning for ${hostname}:`, err);
      }
    }
  }

  if (foundRecords.length > 0) {
    return {
      success: false,
      message: `Verification record not found. Found TXT records: [${foundRecords.join(", ")}], but expected: "${expectedValue}".`,
      foundRecords,
    };
  }

  return {
    success: false,
    message: `We couldn't find the required DNS TXT record for ${targetSubdomain} yet. DNS changes can take a few minutes to propagate. Please verify your DNS settings and try again.`,
  };
}

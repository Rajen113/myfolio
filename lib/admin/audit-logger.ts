import { prisma } from "@/lib/prisma";

export interface LogAdminActionOptions {
  adminUserId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | string | null;
}

/**
 * Redacts any potentially sensitive keys from metadata object.
 */
export function sanitizeAuditMetadata(metadata?: Record<string, unknown> | string | null): string | null {
  if (!metadata) return null;
  if (typeof metadata === "string") return metadata;

  const sanitized = { ...metadata };
  const sensitiveKeys = ["password", "token", "secret", "hash", "key", "authorization"];
  for (const k of Object.keys(sanitized)) {
    if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
      sanitized[k] = "[REDACTED]";
    }
  }
  return JSON.stringify(sanitized);
}

/**
 * Creates an append-only AdminAuditLog entry.
 * Ensures metadata is sanitized and free of sensitive information.
 */
export async function logAdminAction({
  adminUserId,
  action,
  targetType,
  targetId,
  metadata,
}: LogAdminActionOptions) {
  try {
    const metadataStr = sanitizeAuditMetadata(metadata);

    return await prisma.adminAuditLog.create({
      data: {
        adminUserId,
        action,
        targetType,
        targetId: targetId || null,
        metadata: metadataStr,
      },
    });
  } catch (error) {
    console.error("Failed to create admin audit log:", error);
    return null;
  }
}

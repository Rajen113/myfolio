import { prisma } from "@/lib/prisma";

export interface LogAdminActionOptions {
  adminUserId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | string | null;
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
    let metadataStr: string | null = null;
    if (metadata) {
      if (typeof metadata === "string") {
        metadataStr = metadata;
      } else {
        // Redact any potentially sensitive keys
        const sanitized = { ...metadata };
        const sensitiveKeys = ["password", "token", "secret", "hash", "key", "authorization"];
        for (const k of Object.keys(sanitized)) {
          if (sensitiveKeys.some((s) => k.toLowerCase().includes(s))) {
            sanitized[k] = "[REDACTED]";
          }
        }
        metadataStr = JSON.stringify(sanitized);
      }
    }

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

type LogLevel = "info" | "warn" | "error" | "debug";

const SENSITIVE_KEYS = [
  "password",
  "secret",
  "token",
  "authorization",
  "cookie",
  "message",
  "creditcard",
  "cvv",
  "ssn",
];

function sanitizeContext(context: Record<string, unknown>): string {
  try {
    const copy: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(context)) {
      if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
        copy[key] = "[REDACTED]";
      } else {
        copy[key] = value;
      }
    }
    return JSON.stringify(copy);
  } catch {
    return "";
  }
}

function formatLog(level: LogLevel, message: string, context?: Record<string, unknown>): string {
  const timestamp = new Date().toISOString();
  const safeContext = context ? sanitizeContext(context) : "";
  return `[${timestamp}] [${level.toUpperCase()}] ${message} ${safeContext}`.trim();
}

export const logger = {
  info(message: string, context?: Record<string, unknown>) {
    console.log(formatLog("info", message, context));
  },
  warn(message: string, context?: Record<string, unknown>) {
    console.warn(formatLog("warn", message, context));
  },
  error(message: string, context?: Record<string, unknown>) {
    console.error(formatLog("error", message, context));
  },
  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatLog("debug", message, context));
    }
  },
};

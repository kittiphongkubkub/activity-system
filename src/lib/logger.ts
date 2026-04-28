/**
 * Structured Logger
 *
 * Drop-in replacement for console.error/warn that:
 * 1. Adds structured context (timestamp, level)
 * 2. Forwards to Sentry automatically when @sentry/nextjs is installed + DSN is set
 * 3. Works WITHOUT Sentry being installed — gracefully degrades to JSON console output
 *
 * Usage:
 *   import { logger } from "@/lib/logger";
 *   logger.error("Failed to process review", error, { projectId, userId });
 *   logger.warn("Rate limit exceeded", { key });
 *   logger.info("Project submitted", { projectId });
 */

type LogLevel = "info" | "warn" | "error";
type Context = Record<string, unknown>;

// Lazy-load Sentry without causing TypeScript errors when package isn't installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;
try {
  Sentry = require("@sentry/nextjs");
} catch {
  // @sentry/nextjs not installed — log-only mode
}

function log(level: LogLevel, message: string, error?: unknown, context?: Context) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context ?? {}),
    ...(error instanceof Error
      ? { error: error.message, stack: error.stack }
      : error
      ? { error: String(error) }
      : {}),
  };

  if (level === "error") {
    console.error(JSON.stringify(entry));
  } else if (level === "warn") {
    console.warn(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }

  // Forward to Sentry if available
  if (Sentry && process.env.SENTRY_DSN) {
    if (level === "error" && error instanceof Error) {
      if (context) Sentry.setContext("extra", context);
      Sentry.captureException(error);
    } else if (level === "warn") {
      Sentry.captureMessage(message, "warning");
    }
  }
}

export const logger = {
  info: (message: string, context?: Context) =>
    log("info", message, undefined, context),

  warn: (message: string, context?: Context) =>
    log("warn", message, undefined, context),

  error: (message: string, error?: unknown, context?: Context) =>
    log("error", message, error, context),
};

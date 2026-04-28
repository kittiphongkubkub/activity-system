/**
 * Next.js Instrumentation Hook
 *
 * This file is the official Next.js entry point for third-party telemetry.
 * It loads Sentry only when the DSN is configured — no crash if not installed.
 *
 * Docs: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Guard: only load if DSN is configured (prevents errors when Sentry not installed)
  const hasDsn =
    process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!hasDsn) return;

  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      await import("../sentry.server.config");
    } catch {
      // @sentry/nextjs not installed — skip
    }
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    try {
      await import("../sentry.edge.config");
    } catch {
      // @sentry/nextjs not installed — skip
    }
  }
}

// @ts-nocheck
// Install @sentry/nextjs then remove this comment and the exclusions in tsconfig.json
/**
 * Sentry Server-side Configuration
 *
 * Captures unhandled exceptions, slow DB queries, and API errors
 * in the Next.js server runtime.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  enabled:
    !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),

  // Scrub sensitive data before sending to Sentry
  beforeSend(event) {
    // Remove password hashes from breadcrumbs/context
    if (event.request?.data) {
      const data = event.request.data as Record<string, unknown>;
      if (data.passwordHash) data.passwordHash = "[Filtered]";
      if (data.password) data.password = "[Filtered]";
    }
    return event;
  },
});

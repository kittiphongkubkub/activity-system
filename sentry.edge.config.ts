// @ts-nocheck
// Install @sentry/nextjs then remove this comment and the exclusions in tsconfig.json
/**
 * Sentry Edge Runtime Configuration
 *
 * For Next.js middleware and edge routes.
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  enabled:
    !!(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
});

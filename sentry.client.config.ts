/**
 * Sentry Client-side Configuration
 *
 * Setup:
 * 1. npm install @sentry/nextjs
 * 2. Add NEXT_PUBLIC_SENTRY_DSN to .env
 * 3. This file is auto-loaded by Next.js via instrumentation.ts
 */
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Sample 10% of traces in production, 100% in dev
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,

  // Capture Replay for 5% of sessions in production
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1.0,

  // Only enable if DSN is provided
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});

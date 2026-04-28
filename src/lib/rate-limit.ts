import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "./redis";

/**
 * Distributed Rate Limiting for Serverless.
 * 
 * Traditional in-memory rate limiters (Maps/Sets) fail in serverless because
 * state is not shared between Lambda containers. 
 * This implementation uses Upstash Redis to maintain a global sliding window.
 * 
 * If Redis environment variables are missing, it falls back gracefully
 * to allow all requests (prevents system lockout).
 */

const isConfigured = !!process.env.UPSTASH_REDIS_REST_URL;

// Create a singleton instance for global use
// Sliding window: e.g. 10 requests per 1 minute
const globalRateLimiter = isConfigured ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "ratelimit",
}) : null;

/**
 * Check if a request should be rate limited.
 * 
 * @param identifier - Unique key (e.g. user ID or IP)
 * @param limit - Optional override for max requests
 * @param windowMs - Optional override for window duration (in ms)
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60_000
) {
  // If not configured, allow all (Production should ALWAYS configure Redis)
  if (!globalRateLimiter || !isConfigured) {
    return { success: true, limit: 100, remaining: 100, reset: 0 };
  }

  // Use custom limiter if specific limits are requested
  const limiter = (limit === 10 && windowMs === 60_000) 
    ? globalRateLimiter 
    : new Ratelimit({
        redis: redis,
        limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
        prefix: "ratelimit:custom",
      });

  const result = await limiter.limit(identifier);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}

/**
 * Legacy compatibility wrapper for the existing rateLimit calls.
 * Note: Since this is async now, existing calls must be updated with 'await'.
 */
export function rateLimit(identifier: string, limit: number, windowMs: number) {
  // This is a dummy for type compatibility if code hasn't been updated to await yet.
  // We'll mark this as deprecated.
  console.warn("⚠️ Synchronous rateLimit is deprecated. Use await checkRateLimit().");
  return { success: true, reset: 0 };
}

export const rateLimitResponse = (reset: number) => ({
  error: "Too many requests. Please try again later.",
  retryAfter: Math.ceil((reset - Date.now()) / 1000),
});

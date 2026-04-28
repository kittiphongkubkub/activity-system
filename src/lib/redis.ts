import { Redis } from "@upstash/redis";

/**
 * Distributed Redis client for Serverless environments (Vercel).
 * 
 * In-memory state (Maps/Sets) doesn't work across multiple Lambda instances.
 * Using Upstash Redis ensures that rate limits and SSE events are shared
 * across all serverless function invocations.
 * 
 * Required ENV:
 * - UPSTASH_REDIS_REST_URL
 * - UPSTASH_REDIS_REST_TOKEN
 */

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  console.warn("⚠️ Redis environment variables are missing. Rate limiting and real-time SSE will be limited to single-instance memory.");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

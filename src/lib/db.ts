import { PrismaClient } from "@prisma/client";

/**
 * CONNECTION POOLING NOTE
 * ─────────────────────────────────────────────────────────────────────────────
 * For production at 10,000+ users, configure connection pooling via your
 * database provider:
 *
 * • Supabase / Neon: Use the "Transaction" pooler URL as DATABASE_URL,
 *   and the direct URL as DIRECT_URL (already set in schema.prisma).
 *   Add ?connection_limit=10&pool_timeout=20 to DATABASE_URL if needed.
 *
 * • Self-hosted: Install PgBouncer in transaction mode, point DATABASE_URL
 *   to PgBouncer, and DIRECT_URL to Postgres directly.
 *
 * • Prisma Accelerate: Replace DATABASE_URL with the Accelerate connection
 *   string and add `import { withAccelerate } from "@prisma/extension-accelerate"`.
 *
 * Without pooling, each serverless invocation opens a new TCP connection.
 * At 10k concurrent users you will hit PostgreSQL's max_connections limit.
 */

const prismaClientSingleton = () => {
  return new PrismaClient({
    // PERF: Remove "query" from dev logs — too chatty, and avoids
    // accidental verbose logging if NODE_ENV check is misconfigured.
    log:
      process.env.NODE_ENV === "production"
        ? [
            { level: "warn", emit: "event" },
            { level: "error", emit: "event" },
          ]
        : ["warn", "error"],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

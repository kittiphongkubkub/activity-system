/**
 * Centralized API Route Handler
 *
 * Wraps all API routes with:
 * - Authentication check
 * - Unified error handling (Zod, Prisma, generic)
 * - Consistent error response format
 *
 * Usage:
 *   export const POST = apiHandler(async (req, ctx, session) => { ... });
 *   export const GET  = apiHandler(async (req, ctx, session) => { ... }, { public: true });
 */

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

type HandlerFn = (
  req: Request,
  ctx: { params: Promise<Record<string, string>> },
  session: any
) => Promise<Response>;

interface HandlerOptions {
  /** If true, skip auth check (for public routes) */
  public?: boolean;
  /** Minimum role required. Checked after auth. */
  requiredRole?: string | string[];
}

export function apiHandler(handler: HandlerFn, options: HandlerOptions = {}) {
  return async (
    req: Request,
    ctx: { params: Promise<Record<string, string>> }
  ) => {
    try {
      let session: any = null;

      if (!options.public) {
        session = await getServerSession(authOptions);

        if (!session) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Role-based access control
        if (options.requiredRole) {
          const allowedRoles = Array.isArray(options.requiredRole)
            ? options.requiredRole
            : [options.requiredRole];

          if (!allowedRoles.includes((session.user as any).role)) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
          }
        }
      }

      return await handler(req, ctx, session);
    } catch (err: any) {
      // Zod validation error
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: err.issues },
          { status: 400 }
        );
      }

      // Prisma known errors (e.g. unique constraint, not found)
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
          return NextResponse.json(
            { error: "Duplicate record", field: err.meta?.target },
            { status: 409 }
          );
        }
        if (err.code === "P2025") {
          return NextResponse.json({ error: "Record not found" }, { status: 404 });
        }
      }

      // Log all unexpected errors with context
      console.error(`[API Error] ${req.method} ${req.url}`, err);

      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}

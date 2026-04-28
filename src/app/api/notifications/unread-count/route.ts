import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ count: 0 });

  const count = await prisma.notification.count({
    where: {
      userId: (session.user as any).id,
      isRead: false,
    },
  });

  // PERF: HTTP-level cache — stale-while-revalidate allows instant response
  // while background revalidation happens. Cuts repeated badge queries to near-zero.
  return NextResponse.json({ count }, {
    headers: {
      "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
    },
  });
}

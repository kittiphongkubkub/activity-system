import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = (session.user as any).role;
  if (role === "student") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Find steps that are 'in_review' and assigned to the user's role
    const pendingSteps = await prisma.workflowStep.findMany({
      where: {
        status: "in_review",
        assigneeRole: role,
      },
      include: {
        project: {
          include: {
            owner: {
              select: { fullName: true, studentId: true }
            }
          }
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(pendingSteps);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}

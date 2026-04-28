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
    // FIXED: Replaced nested include with explicit select to prevent over-fetching
    const pendingSteps = await prisma.workflowStep.findMany({
      where: {
        status: "in_review",
        assigneeRole: role,
      },
      select: {
        id: true,
        stepName: true,
        stepOrder: true,
        docType: true,
        assigneeRole: true,
        createdAt: true,
        project: {
          select: {
            id: true,
            projectName: true,
            status: true,
            department: true,
            academicYear: true,
            semester: true,
            owner: {
              select: { fullName: true, studentId: true, email: true }
            }
          }
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(pendingSteps);
  } catch (error) {
    console.error("[approvals/GET]", error);
    return NextResponse.json({ error: "Failed to fetch approvals" }, { status: 500 });
  }
}


import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processStepReview } from "@/lib/workflow";
import { checkRateLimit } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const userRole = (session.user as any).role;

  // Rate limit: 30 reviews per hour per reviewer (prevents double-submit on UI glitch)
  const rl = await checkRateLimit(`project:review:${userId}`, 30, 60 * 60_000);
  if (!rl.success) return NextResponse.json(
    { error: "Too many review actions. Please wait.", retryAfter: Math.ceil((rl.reset - Date.now()) / 1000) },
    { status: 429 }
  );

  try {
    const { stepId, decision, comments } = await req.json();

    // Security check: Verify the user owns this role for the step and step belongs to project
    const step = await prisma.workflowStep.findFirst({
      where: { 
        id: stepId,
        projectId: id 
      },
      include: {
        project: {
          select: {
            advisorId: true,
            department: true,
            owner: {
              select: { department: true }
            }
          }
        }
      }
    });

    if (!step || step.assigneeRole !== userRole || step.status !== "in_review") {
      return NextResponse.json({ error: "Invalid review request" }, { status: 403 });
    }

    // Role-specific ownership checks (IDOR protection)
    if (userRole === "advisor" && step.project.advisorId !== userId) {
      return NextResponse.json({ error: "คุณไม่ได้เป็นอาจารย์ที่ปรึกษาของโครงการนี้" }, { status: 403 });
    }

    // For department-specific roles, check department match (fallback to owner's department if project's is null)
    const projectDepartment = step.project.department || step.project.owner.department;
    if ((userRole === "dept_head" || userRole === "program_chair") && projectDepartment !== (session.user as any).department) {
      return NextResponse.json({ error: "โครงการนี้ไม่ได้อยู่ในสาขา/ภาควิชาของคุณ" }, { status: 403 });
    }

    await processStepReview({
      stepId,
      approverId: userId,
      decision,
      comments,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    logger.error("Failed to process review", error, { projectId: id, userId: (session?.user as any)?.id });
    return NextResponse.json({ error: error.message || "Failed to process review" }, { status: 500 });
  }
}

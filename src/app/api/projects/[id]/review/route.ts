import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { processStepReview } from "@/lib/workflow";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { stepId, decision, comments } = await req.json();
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // Security check: Verify the user owns this role for the step and step belongs to project
    const step = await prisma.workflowStep.findFirst({
      where: { 
        id: stepId,
        projectId: id 
      },
    });

    if (!step || step.assigneeRole !== userRole || step.status !== "in_review") {
      return NextResponse.json({ error: "Invalid review request" }, { status: 403 });
    }

    await processStepReview({
      stepId,
      approverId: userId,
      decision,
      comments,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to process review" }, { status: 500 });
  }
}

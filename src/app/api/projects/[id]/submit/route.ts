import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createWorkflowSteps } from "@/lib/workflow";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


  try {
    const project = await prisma.project.findUnique({
      where: { id, ownerId: (session.user as any).id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.status !== "draft" && project.status !== "revision_required") {
      return NextResponse.json({ error: "Project already submitted" }, { status: 400 });
    }

    // Start transaction
    await prisma.$transaction(async (tx) => {
      // 1. Update project status
      await tx.project.update({
        where: { id },
        data: { status: "submitted" },
      });

      // 2. Generate workflow steps
      const steps = [
        { stepOrder: 1, stepName: "อาจารย์ที่ปรึกษา", assigneeRole: "advisor", status: "in_review" },
        { stepOrder: 2, stepName: "ประธานหลักสูตร", assigneeRole: "program_chair", status: "pending" },
        { stepOrder: 3, stepName: "หัวหน้าสาขา", assigneeRole: "dept_head", status: "pending" },
        { stepOrder: 4, stepName: "ประชุมคณะ (กบค.)", assigneeRole: "faculty_committee", status: "pending" },
        { stepOrder: 5, stepName: "คณบดี", assigneeRole: "dean", status: "pending" },
        { stepOrder: 6, stepName: "มหาวิทยาลัย", assigneeRole: "university", status: "pending" },
      ];

      await tx.workflowStep.deleteMany({ where: { projectId: id, docType: "025" } });
      await tx.workflowStep.createMany({
        data: steps.map(s => ({ ...s, projectId: id, docType: "025" }))
      });

      // 3. Create Notification for First Step
      const { notifyNextReviewer } = await import("@/lib/notifications");
      await notifyNextReviewer(id, "อาจารย์ที่ปรึกษา", "advisor", project.advisorId);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to submit project" }, { status: 500 });
  }
}

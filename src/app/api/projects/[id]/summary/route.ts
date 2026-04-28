import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { project027Schema } from "@/lib/validations/project027";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });


  try {
    const body = await req.json();
    const validatedData = project027Schema.parse(body);

    const project = await prisma.project.findUnique({
      where: { id, ownerId: (session.user as any).id },
    });

    if (!project || (project.status !== "approved" && project.status !== "summary_revision_required")) {
      return NextResponse.json({ error: "Only approved or revision-required projects can submit a summary" }, { status: 400 });
    }

    // Use transaction to update project and create summary
    await prisma.$transaction(async (tx) => {
      // 1. Create or update summary
      await tx.projectSummary.upsert({
        where: { projectId: id },
        update: {
          ...validatedData,
          actualStartDate: new Date(validatedData.actualStartDate),
          actualEndDate: new Date(validatedData.actualEndDate),
          status: "submitted",
          submittedBy: (session.user as any).id,
          submittedAt: new Date(),
        },
        create: {
          projectId: id,
          ...validatedData,
          actualStartDate: new Date(validatedData.actualStartDate),
          actualEndDate: new Date(validatedData.actualEndDate),
          status: "submitted",
          submittedBy: (session.user as any).id,
          submittedAt: new Date(),
        },
      });

      // 2. Update project status
      await tx.project.update({
        where: { id },
        data: { status: "summary_submitted" },
      });

      // 3. Reset workflow steps for 027
      const steps = [
        { stepOrder: 1, stepName: "อาจารย์ที่ปรึกษา (สรุปผล)", assigneeRole: "advisor", status: "in_review" },
        { stepOrder: 2, stepName: "ประธานหลักสูตร (สรุปผล)", assigneeRole: "program_chair", status: "pending" },
        { stepOrder: 3, stepName: "หัวหน้าสาขา (สรุปผล)", assigneeRole: "dept_head", status: "pending" },
        { stepOrder: 4, stepName: "ประชุมคณะ (สรุปผล)", assigneeRole: "faculty_committee", status: "pending" },
        { stepOrder: 5, stepName: "คณบดี (สรุปผล)", assigneeRole: "dean", status: "pending" },
        { stepOrder: 6, stepName: "มหาวิทยาลัย (สรุปผล)", assigneeRole: "university", status: "pending" },
      ];

      await tx.workflowStep.deleteMany({ where: { projectId: id, docType: "027" } });
      await tx.workflowStep.createMany({
        data: steps.map(s => ({ ...s, projectId: id, docType: "027" }))
      });

      // 4. Create Audit Log
      await tx.auditLog.create({
        data: {
          projectId: id,
          userId: (session.user as any).id,
          action: project.status === "summary_revision_required" ? "summary_resubmit" : "summary_submit",
          fromStatus: project.status,
          toStatus: "summary_submitted",
          stepName: "นักศึกษา (สรุปผล)",
        }
      });

      // 5. Create Documents for 027
      const userId = (session.user as any).id;
      if (body.attachments?.length > 0) {
        await tx.document.createMany({
          data: body.attachments.map((file: any) => ({
            projectId: id,
            docType: "attachment_027",
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            fileSize: file.fileSize,
            mimeType: file.mimeType,
            uploadedBy: userId,
          }))
        });
      }

      // 6. Notify next reviewer
      const { notifyNextReviewer } = await import("@/lib/notifications");
      await notifyNextReviewer(id, "อาจารย์ที่ปรึกษา (สรุปผล)", "advisor", project.advisorId, tx);
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to submit summary" }, { status: 500 });
  }
}

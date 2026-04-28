import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logger } from "@/lib/logger";

/**
 * Soft Delete — sets deletedAt timestamp instead of destroying the record.
 *
 * WHY soft delete:
 * - Audit trails remain intact
 * - Recoverable by admin if deleted accidentally
 * - Foreign keys (auditLogs, workflowSteps) stay valid
 *
 * Only the project OWNER can soft-delete their own draft projects.
 * Submitted/approved projects cannot be deleted this way.
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true, status: true, deletedAt: true },
    });

    if (!project || project.ownerId !== userId) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.deletedAt) {
      return NextResponse.json({ error: "Project already deleted" }, { status: 400 });
    }

    // Only allow deletion of draft projects (prevents deleting submitted/approved)
    if (project.status !== "draft") {
      return NextResponse.json(
        { error: "Only draft projects can be deleted. Contact admin for other statuses." },
        { status: 403 }
      );
    }

    // Soft delete — preserve all records
    await prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info("Project soft deleted", { projectId: id, userId });
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Failed to delete project", error, { projectId: id, userId });
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}

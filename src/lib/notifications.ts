import prisma from "@/lib/db";

export async function createNotification({
  userId,
  projectId,
  type,
  title,
  message,
}: {
  userId: string;
  projectId?: string;
  type: string;
  title: string;
  message?: string;
}) {
  return await prisma.notification.create({
    data: {
      userId,
      projectId,
      type,
      title,
      message,
    },
  });
}

export async function notifyStatusChange(projectId: string, status: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, projectName: true },
  });

  if (!project) return;

  let title = "";
  let message = "";

  switch (status) {
    case "approved":
      title = "โครงการของคุณได้รับการอนุมัติแล้ว";
      message = `โครงการ "${project.projectName}" ผ่านการพิจารณาทุกขั้นตอนเรียบร้อยแล้ว`;
      break;
    case "revision_required":
      title = "กรุณาแก้ไขโครงการ";
      message = `โครงการ "${project.projectName}" ถูกส่งกลับมาให้แก้ไข กรุณาตรวจสอบความเห็นจากผู้อนุมัติ`;
      break;
    case "rejected":
      title = "โครงการของคุณไม่ได้รับการอนุมัติ";
      message = `โครงการ "${project.projectName}" ไม่ผ่านการพิจารณา`;
      break;
  }

  if (title) {
    await createNotification({
      userId: project.ownerId,
      projectId,
      type: "status_update",
      title,
      message,
    });
  }
}

export async function notifyNextReviewer(projectId: string, nextStepName: string, assigneeRole: string, assigneeId?: string | null) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { projectName: true, advisorId: true, department: true },
  });

  if (!project) return;

  // Case 1: Targeted user (e.g. Advisor)
  if (assigneeId) {
    await createNotification({
      userId: assigneeId,
      projectId,
      type: "approval_request",
      title: "มีโครงการรอการอนุมัติจากคุณ",
      message: `โครงการ "${project.projectName}" อยู่ในขั้นตอน: ${nextStepName}`,
    });
    return;
  }

  // Case 2: Special case for Advisor Role (use project's advisorId)
  if (assigneeRole === "advisor" && project.advisorId) {
    await createNotification({
      userId: project.advisorId,
      projectId,
      type: "approval_request",
      title: "มีโครงการรอการอนุมัติจากคุณ",
      message: `โครงการ "${project.projectName}" อยู่ในขั้นตอน: ${nextStepName}`,
    });
    return;
  }

  // Case 3: Broadcast to Role (e.g. Dean, Program Chair) within same department/faculty
  const usersWithRole = await prisma.user.findMany({
    where: { 
      role: assigneeRole, 
      isActive: true,
      // Only filter by department if the project has one specified
      ...(project.department ? { department: project.department } : {})
    },
    select: { id: true },
  });

  for (const user of usersWithRole) {
    await createNotification({
      userId: user.id,
      projectId,
      type: "approval_request",
      title: "โครงการใหม่รอการอนุมัติ (ตามบทบาทของคุณ)",
      message: `โครงการ "${project.projectName}" รอการพิจารณาในขั้นตอน: ${nextStepName}`,
    });
  }
}

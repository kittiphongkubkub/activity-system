import prisma from "@/lib/db";
import { sseManager } from "@/lib/sse";

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
}, tx?: any) {
  const db = tx || prisma;
  const notification = await db.notification.create({
    data: {
      userId,
      projectId,
      type,
      title,
      message,
    },
  });

  // SSE: push real-time event to the connected client (if any)
  // Falls back gracefully — no error if user has no active SSE connection
  sseManager.broadcast(userId, {
    type: "new_notification",
    notification: {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      isRead: false,
      createdAt: notification.createdAt,
      projectId: notification.projectId,
    },
  });

  return notification;
}

export async function notifyStatusChange(projectId: string, status: string, tx?: any) {
  const db = tx || prisma;
  const project = await db.project.findUnique({
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
    }, tx);
  }
}

export async function notifyNextReviewer(projectId: string, nextStepName: string, assigneeRole: string, assigneeId?: string | null, tx?: any) {
  const db = tx || prisma;
  const project = await db.project.findUnique({
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
    }, tx);
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
    }, tx);
    return;
  }

  // Case 3: Broadcast to Role (e.g. Dean, Program Chair) within same department/faculty
  const usersWithRole = await db.user.findMany({
    where: { 
      role: assigneeRole, 
      isActive: true,
      ...(project.department ? { department: project.department } : {})
    },
    select: { id: true },
  });

  // FIXED: Use createMany for a single batch INSERT instead of N sequential INSERTs
  if (usersWithRole.length > 0) {
    const notificationData = usersWithRole.map((user: { id: string }) => ({
      userId: user.id,
      projectId,
      type: "approval_request",
      title: "โครงการใหม่รอการอนุมัติ (ตามบทบาทของคุณ)",
      message: `โครงการ "${project.projectName}" รอการพิจารณาในขั้นตอน: ${nextStepName}`,
      isRead: false,
    }));

    await db.notification.createMany({
      data: notificationData,
      skipDuplicates: true,
    });

    // SSE: broadcast to all targeted users so they see it in real-time
    usersWithRole.forEach((user: { id: string }, index: number) => {
      sseManager.broadcast(user.id, {
        type: "new_notification",
        notification: {
          ...notificationData[index],
          createdAt: new Date(),
        }
      });
    });
  }
}

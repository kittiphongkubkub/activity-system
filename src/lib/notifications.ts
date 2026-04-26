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

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = session.user as any;
  // Only allow university staff or admins to update certificate status
  if (user.role !== "university" && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { status } = await req.json(); // none, processing, ready, collected
    
    const project = await prisma.project.update({
      where: { id },
      data: { certificateStatus: status },
      include: { owner: true }
    });

    // Send notification to student
    let title = "";
    let message = "";

    switch (status) {
      case "processing":
        title = "กำลังจัดทำเกียรติบัตร";
        message = `โครงการ "${project.projectName}" กำลังอยู่ในขั้นตอนการจัดทำเอกสารเกียรติบัตร`;
        break;
      case "ready":
        title = "เกียรติบัตรพร้อมให้รับแล้ว!";
        message = `เกียรติบัตรโครงการ "${project.projectName}" พร้อมให้รับแล้วที่กองพัฒนานักศึกษา`;
        break;
      case "collected":
        title = "รับเกียรติบัตรเรียบร้อยแล้ว";
        message = `คุณได้รับเกียรติบัตรโครงการ "${project.projectName}" เรียบร้อยแล้ว ขอบคุณที่เข้าร่วมกิจกรรม`;
        break;
    }

    if (title) {
      await createNotification({
        userId: project.ownerId,
        projectId: project.id,
        type: "certificate_update",
        title,
        message,
      });
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update certificate status" }, { status: 500 });
  }
}

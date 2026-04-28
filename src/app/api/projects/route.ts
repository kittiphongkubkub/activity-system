import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { project025Schema } from "@/lib/validations/project025";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  try {
    const projects = await prisma.project.findMany({
      where: {
        ownerId: (session.user as any).id,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const userId = (session.user as any).id;
    
    // Validate the data
    const validatedData = project025Schema.parse(body);
    const { presidentEmail, ...projectData } = validatedData;

    const project = await prisma.project.create({
      data: {
        ...projectData,
        ownerId: userId,
        status: "draft",
        plannedStartDate: new Date(validatedData.plannedStartDate),
        plannedEndDate: new Date(validatedData.plannedEndDate),
        documents: {
          create: body.attachments?.map((file: any) => ({
            docType: "attachment",
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            fileSize: file.fileSize,
            mimeType: file.mimeType,
            uploadedBy: userId,
          })) || [],
        },
      },
    });

    // If there's a president email provided (and user is not the president)
    if (presidentEmail && validatedData.studentRole !== "president") {
      const presidentUser = await prisma.user.findUnique({
        where: { email: presidentEmail }
      });

      if (presidentUser) {
        await prisma.projectMember.create({
          data: {
            projectId: project.id,
            userId: presidentUser.id,
            role: "president",
            status: "accepted"
          }
        });
        
        // Notify the president
        const { createNotification } = require("@/lib/notifications");
        await createNotification({
          userId: presidentUser.id,
          projectId: project.id,
          type: "invitation",
          title: "คุณถูกระบุเป็นประธานโครงการใหม่",
          message: `คุณถูกระบุเป็นประธานโครงการ "${project.projectName}" โดย ${(session.user as any).fullName}`,
        });
      }
    }

    return NextResponse.json(project);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

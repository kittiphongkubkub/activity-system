import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { project025Schema } from "@/lib/validations/project025";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const PAGE_SIZE = 20;

  try {
    const projects = await prisma.project.findMany({
      take: PAGE_SIZE + 1,
      cursor: cursor ? { id: cursor } : undefined,
      skip: cursor ? 1 : 0,
      where: {
        ownerId: (session.user as any).id,
        deletedAt: null, // Exclude soft-deleted projects
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

  const userId = (session.user as any).id;

  // Rate limit: 10 project creations per hour per user
  const rl = await checkRateLimit(`project:create:${userId}`, 10, 60 * 60_000);
  if (!rl.success) return NextResponse.json(
    { error: "Too many requests. Try again later.", retryAfter: Math.ceil((rl.reset - Date.now()) / 1000) },
    { status: 429 }
  );

  try {
    const body = await req.json();

    // Validate the data
    const validatedData = project025Schema.parse(body);
    const { presidentEmail, userRole, ...projectData } = validatedData;

    // Logic: If user is an advisor, they are their own advisor (optional, but consistent)
    const finalAdvisorId = (session.user as any).role === "advisor" 
      ? userId 
      : projectData.advisorId || null;

    const project = await prisma.project.create({
      data: {
        ...projectData,
        advisorId: finalAdvisorId,
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

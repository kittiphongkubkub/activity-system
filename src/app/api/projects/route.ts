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

    const project = await prisma.project.create({
      data: {
        ...validatedData,
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

    return NextResponse.json(project);
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}

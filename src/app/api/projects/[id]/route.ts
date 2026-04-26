import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { project025Schema } from "@/lib/validations/project025";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const project = await prisma.project.findUnique({
      where: { id, ownerId: (session.user as any).id },
      include: { documents: true }
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const userId = (session.user as any).id;
    
    // Validate the data
    const validatedData = project025Schema.parse(body);

    const project = await prisma.project.update({
      where: { id, ownerId: userId },
      data: {
        ...validatedData,
        plannedStartDate: new Date(validatedData.plannedStartDate),
        plannedEndDate: new Date(validatedData.plannedEndDate),
        // Update documents if provided
        documents: body.attachments?.length > 0 ? {
          create: body.attachments.map((file: any) => ({
            docType: "attachment",
            fileName: file.fileName,
            fileUrl: file.fileUrl,
            fileSize: file.size,
            mimeType: file.type,
            uploadedBy: userId,
          }))
        } : undefined,
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    console.error(error);
    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

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
    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    // PERF: Explicit select — avoids loading description/objectives/expectedOutcome
    // and prevents nested include from over-fetching member and owner data
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: userId },
          { advisorId: userId },
          { members: { some: { userId, status: "accepted" } } },
          // Admins can see all
          ...(userRole === "admin" || userRole === "university" ? [{ id }] : [])
        ]
      },
      select: {
        id: true,
        projectName: true,
        projectType: true,
        description: true,
        objectives: true,
        expectedOutcome: true,
        plannedStartDate: true,
        plannedEndDate: true,
        location: true,
        expectedParticipants: true,
        budgetRequested: true,
        ownerId: true,
        advisorId: true,
        department: true,
        academicYear: true,
        semester: true,
        studentRole: true,
        impactLevel: true,
        organizationType: true,
        status: true,
        certificateStatus: true,
        currentStep: true,
        createdAt: true,
        updatedAt: true,
        documents: {
          select: {
            id: true,
            docType: true,
            fileName: true,
            fileSize: true,
            mimeType: true,
            createdAt: true,
          }
        },
        members: {
          select: {
            id: true,
            role: true,
            status: true,
            user: { select: { id: true, fullName: true, email: true } }
          }
        },
        owner: { select: { id: true, fullName: true, email: true } },
        advisor: { select: { id: true, fullName: true, email: true } },
      }
    });

    if (!project) return NextResponse.json({ error: "Project not found or Access denied" }, { status: 404 });

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
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

    // Use transaction to ensure both delete and update happen together
    const project = await prisma.$transaction(async (tx) => {
      // 1. Determine which documents to keep (those that already have an ID)
      const existingDocIds = body.attachments
        ?.filter((a: any) => a.id)
        .map((a: any) => a.id) || [];

      // 2. Delete documents that are NOT in the 'keep' list
      await tx.document.deleteMany({
        where: { 
          projectId: id,
          id: { notIn: existingDocIds }
        }
      });

      // 3. Update the project and create ONLY NEW documents
      return await tx.project.update({
        where: { id, ownerId: userId },
        data: {
          ...validatedData,
          plannedStartDate: new Date(validatedData.plannedStartDate),
          plannedEndDate: new Date(validatedData.plannedEndDate),
          // Only create documents that don't have an ID yet
          documents: {
            create: body.attachments
              ?.filter((a: any) => !a.id)
              .map((file: any) => ({
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

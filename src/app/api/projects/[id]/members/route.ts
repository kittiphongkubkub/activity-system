import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAuthorizedProject } from "@/lib/auth-check";
import { createNotification } from "@/lib/notifications";

// GET: List all members of a project
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { project } = await getAuthorizedProject(id);

  if (!project) {
    return NextResponse.json({ error: "Project not found or access denied" }, { status: 404 });
  }

  return NextResponse.json(project.members);
}

// POST: Invite a new member
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, role } = await req.json();
  const userId = (session.user as any).id;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { members: true }
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    
    // Authorization: Only owner or co_owner can invite
    const isOwner = project.ownerId === userId;
    const isCoOwner = project.members.some(m => m.userId === userId && m.role === "co_owner" && m.status === "accepted");
    
    if (!isOwner && !isCoOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validation: Max 10 members
    if (project.members.length >= 10) {
      return NextResponse.json({ error: "Maximum 10 members allowed" }, { status: 400 });
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { email }
    });

    if (!targetUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Validation: Prevent owner from being added
    if (targetUser.id === project.ownerId) {
      return NextResponse.json({ error: "User is the owner of this project" }, { status: 400 });
    }

    // Create membership with pending status
    const membership = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: targetUser.id,
        role: role || "member",
        status: "pending"
      }
    });

    // Create Notification
    await createNotification({
      userId: targetUser.id,
      projectId: id,
      type: "invitation",
      title: "คุณได้รับเชิญเข้าร่วมโครงการ",
      message: `คุณได้รับเชิญเข้าร่วมโครงการ "${project.projectName}" ในบทบาท ${role === "co_owner" ? "ผู้ช่วยหัวหน้าโครงการ" : "สมาชิก"}`,
    });

    return NextResponse.json(membership);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "User is already a member or invited" }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

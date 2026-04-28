import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string, memberId: string }> }
) {
  const { id, memberId } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { members: true }
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    const isOwner = project.ownerId === userId;
    const isCoOwner = project.members.some(m => m.userId === userId && m.role === "co_owner" && m.status === "accepted");
    
    // Authorization: Only owner or co_owner can remove members
    // Or a member can remove themselves
    const targetMember = await prisma.projectMember.findUnique({
      where: { id: memberId }
    });

    if (!targetMember) return NextResponse.json({ error: "Member not found" }, { status: 404 });

    const isSelf = targetMember.userId === userId;

    if (!isOwner && !isCoOwner && !isSelf) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Validation: Prevent removing the owner (though owner isn't in members table usually, let's be safe)
    if (targetMember.userId === project.ownerId) {
      return NextResponse.json({ error: "Cannot remove project owner" }, { status: 400 });
    }

    await prisma.projectMember.delete({
      where: { id: memberId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

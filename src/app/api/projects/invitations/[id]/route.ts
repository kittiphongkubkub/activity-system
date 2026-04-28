import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;
  const { status } = await req.json(); // "accepted" or "rejected"

  if (!["accepted", "rejected"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const membership = await prisma.projectMember.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!membership || membership.userId !== userId) {
      return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (membership.status !== "pending") {
      return NextResponse.json({ error: "Invitation already processed" }, { status: 400 });
    }

    const updated = await prisma.projectMember.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

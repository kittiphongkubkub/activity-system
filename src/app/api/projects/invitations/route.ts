import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET: List all pending invitations for the current user
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id;

  try {
    const invitations = await prisma.projectMember.findMany({
      where: {
        userId,
        status: "pending"
      },
      include: {
        project: {
          select: {
            projectName: true,
            owner: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    return NextResponse.json(invitations);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const advisors = await prisma.user.findMany({
      where: {
        role: "advisor",
        isActive: true,
      },
      select: {
        id: true,
        fullName: true,
        department: true,
      },
    });

    return NextResponse.json(advisors);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

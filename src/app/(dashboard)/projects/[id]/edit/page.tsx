import prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProjectForm025 from "@/components/projects/ProjectForm025";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditProjectPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id, ownerId: (session.user as any).id },
    include: { documents: true }
  });

  if (!project) notFound();

  // Format dates for the form
  const initialData = {
    ...project,
    plannedStartDate: project.plannedStartDate ? new Date(project.plannedStartDate).toISOString().split('T')[0] : "",
    plannedEndDate: project.plannedEndDate ? new Date(project.plannedEndDate).toISOString().split('T')[0] : "",
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      <div className="flex items-center space-x-4">
        <Link
          href={`/projects/${id}`}
          className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">แก้ไขโครงการ</h1>
          <p className="text-slate-500">ปรับปรุงข้อมูลโครงการ มฉก.วท.025</p>
        </div>
      </div>

      <ProjectForm025 initialData={initialData} />
    </div>
  );
}

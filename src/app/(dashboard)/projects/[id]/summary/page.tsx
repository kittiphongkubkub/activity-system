import prisma from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import ProjectForm027 from "@/components/projects/ProjectForm027";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function SummaryPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const project = await prisma.project.findUnique({
    where: { id: params.id, ownerId: (session.user as any).id },
  });

  if (!project) notFound();
  
  if (project.status !== "approved") {
    redirect(`/projects/${project.id}`);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">สรุปผลการดำเนินงาน (แบบ 027)</h1>
        <p className="text-slate-500">กรุณาระบุผลการดำเนินงานจริงและปัญหาที่พบจากการจัดโครงการ: {project.projectName}</p>
      </div>

      <ProjectForm027 projectId={project.id} />
    </div>
  );
}

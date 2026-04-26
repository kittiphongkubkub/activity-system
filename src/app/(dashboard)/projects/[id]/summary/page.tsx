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
    include: { summary: true, documents: true }
  });

  if (!project) notFound();
  
  // Allow if approved (first time) or summary revision required
  const canAccess = project.status === "approved" || 
                    project.status === "summary_revision_required" ||
                    project.status === "summary_submitted" ||
                    project.status === "summary_under_review";

  if (!canAccess) {
    redirect(`/projects/${project.id}`);
  }

  // Format summary data for initial values
  const initialData = project.summary ? {
    ...project.summary,
    actualStartDate: project.summary.actualStartDate ? new Date(project.summary.actualStartDate).toISOString().split('T')[0] : "",
    actualEndDate: project.summary.actualEndDate ? new Date(project.summary.actualEndDate).toISOString().split('T')[0] : "",
    attachments: project.documents
      .filter(doc => doc.docType === "attachment_027")
      .map(doc => ({
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType
      }))
  } : undefined;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">สรุปผลการดำเนินงาน (แบบ 027)</h1>
        <p className="text-slate-500">กรุณาระบุผลการดำเนินงานจริงและปัญหาที่พบจากการจัดโครงการ: {project.projectName}</p>
      </div>

      <ProjectForm027 projectId={project.id} initialData={initialData} />
    </div>
  );
}

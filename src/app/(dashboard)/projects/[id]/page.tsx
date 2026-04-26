import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { WorkflowTimeline } from "@/components/projects/WorkflowTimeline";
import { Calendar, MapPin, Users, DollarSign, ArrowLeft, Send, Printer, AlertCircle, ExternalLink, FileText } from "lucide-react";
import Link from "next/link";
import SubmitButton from "./SubmitButton";
import ReviewForm from "@/components/approvals/ReviewForm";
import PrintButton from "./PrintButton"; // New client component
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function ProjectDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const session = await getServerSession(authOptions);
  const userRole = (session?.user as any)?.role;

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      workflowSteps: true,
      advisor: true,
      documents: true,
    },
  });

  if (!project) notFound();

  // Check if there's a pending review for the current user
  const activeReviewStep = project.workflowSteps.find(
    (s) => s.status === "in_review" && s.assigneeRole === userRole
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/projects"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-slate-800">{project.projectName}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-slate-500">รหัสโครงการ: {project.id.slice(0, 8)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <PrintButton />
          
          {(project.status === "draft" || project.status === "revision_required") && (
            <>
              <Link
                href={`/projects/${project.id}/edit`}
                className="flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
              >
                แก้ไขโครงการ
              </Link>
              <SubmitButton projectId={project.id} />
            </>
          )}

        {project.status === "approved" && (
          <Link
            href={`/projects/${project.id}/summary`}
            className="flex items-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            <Send className="mr-2 h-4 w-4" />
            ส่งสรุปผล (027)
          </Link>
        )}
      </div>
    </div>

      {activeReviewStep && (
        <ReviewForm 
          projectId={project.id} 
          stepId={activeReviewStep.id} 
          stepName={activeReviewStep.stepName} 
        />
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-800 border-b pb-2">รายละเอียดโครงการ</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">หลักการและเหตุผล</h4>
                <p className="mt-1 text-slate-700 whitespace-pre-wrap">{project.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">วัตถุประสงค์</h4>
                <p className="mt-1 text-slate-700 whitespace-pre-wrap">{project.objectives}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">ผลที่คาดว่าจะได้รับ</h4>
                <p className="mt-1 text-slate-700 whitespace-pre-wrap">{project.expectedOutcome}</p>
              </div>
            </div>
          </section>

          {/* Attachments Section */}
          {project.documents.length > 0 && (
            <section className="rounded-xl border bg-white p-6 shadow-sm mt-6">
              <h3 className="mb-4 text-lg font-bold text-slate-800 border-b pb-2">เอกสารแนบประกอบโครงการ</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.documents.map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.fileUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-100 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-white shadow-sm text-indigo-600 group-hover:scale-110 transition-transform">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="truncate max-w-[150px]">
                        <p className="text-sm font-bold text-slate-800 truncate">{doc.fileName}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                          {(doc.fileSize ? (doc.fileSize / 1024 / 1024).toFixed(2) : 0)} MB
                        </p>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </a>
                ))}
              </div>
            </section>
          )}

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center">
              <div className="rounded-lg bg-indigo-50 p-2 mr-4">
                <Calendar className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">กำหนดการ</p>
                <p className="text-sm font-bold text-slate-800">
                  {project.plannedStartDate?.toLocaleDateString("th-TH")} - {project.plannedEndDate?.toLocaleDateString("th-TH")}
                </p>
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center">
              <div className="rounded-lg bg-emerald-50 p-2 mr-4">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">สถานที่</p>
                <p className="text-sm font-bold text-slate-800">{project.location}</p>
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center">
              <div className="rounded-lg bg-blue-50 p-2 mr-4">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">จำนวนผู้ร่วม</p>
                <p className="text-sm font-bold text-slate-800">{project.expectedParticipants} คน</p>
              </div>
            </div>
            <div className="rounded-xl border bg-white p-4 shadow-sm flex items-center">
              <div className="rounded-lg bg-amber-50 p-2 mr-4">
                <DollarSign className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">งบประมาณที่ขอ</p>
                <p className="text-sm font-bold text-slate-800">
                  {new Intl.NumberFormat("th-TH").format(Number(project.budgetRequested))} บาท
                </p>
              </div>
            </div>
          </div>

          {/* Revision History Section */}
          {project.workflowSteps.some(s => s.comments) && (
            <section className="rounded-xl border border-amber-100 bg-amber-50/30 p-6 shadow-sm overflow-hidden relative mt-8">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Send className="h-24 w-24 rotate-12" />
              </div>
              <h3 className="mb-4 text-lg font-black text-amber-800 flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-amber-600" />
                ประวัติการสั่งแก้ไขจากผู้อนุมัติ
              </h3>
              <div className="space-y-4 relative z-10">
                {project.workflowSteps
                  .filter(s => s.comments)
                  .sort((a, b) => new Date(b.reviewedAt || 0).getTime() - new Date(a.reviewedAt || 0).getTime())
                  .map((step, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm transition-all hover:scale-[1.01]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                          {step.stepName}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {step.reviewedAt ? new Date(step.reviewedAt).toLocaleDateString("th-TH", {
                            day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit'
                          }) : "-"}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium italic">
                        "{step.comments}"
                      </p>
                    </div>
                  ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar: Workflow & Info */}
        <div className="space-y-6">
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-800 border-b pb-2">ขั้นตอนการอนุมัติ</h3>
            {project.workflowSteps.length > 0 ? (
              <WorkflowTimeline steps={project.workflowSteps as any} />
            ) : (
              <p className="text-sm text-slate-400 text-center py-4 italic">
                ยังไม่ได้ส่งโครงการเพื่อขออนุมัติ
              </p>
            )}
          </section>

          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-bold text-slate-800 uppercase tracking-widest">ข้อมูลผู้รับผิดชอบ</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-slate-400">อาจารย์ที่ปรึกษา</p>
                <p className="text-sm font-medium text-slate-700">{project.advisor?.fullName || "ไม่ได้ระบุ"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">ภาควิชา/สาขาวิชา</p>
                <p className="text-sm font-medium text-slate-700">{project.department || "-"}</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

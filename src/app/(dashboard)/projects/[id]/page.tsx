import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { WorkflowTimeline } from "@/components/projects/WorkflowTimeline";
import { AuditTimeline } from "@/components/projects/AuditTimeline";
import CertificateManager from "./CertificateManager";
import { 
  Calendar, 
  MapPin, 
  Users, 
  DollarSign, 
  ArrowLeft, 
  Send, 
  Printer, 
  AlertCircle, 
  ExternalLink, 
  FileText,
  History,
  Clock,
  Award,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import SubmitButton from "./SubmitButton";
import ReviewForm from "@/components/approvals/ReviewForm";
import PrintButton from "./PrintButton"; // New client component
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { ProjectTeam } from "@/components/projects/ProjectTeam";

import { getAuthorizedProject } from "@/lib/auth-check";

export default async function ProjectDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  const params = await props.params;
  const { project, user } = await getAuthorizedProject(params.id);

  if (!project) notFound();
  
  const userRole = user?.role;

  // Check if there's a pending review for the current user
  const activeReviewStep = project.workflowSteps.find(
    (s) => s.status === "in_review" && s.assigneeRole === userRole
  );

  const getCertificateStatusInfo = (status: string) => {
    switch (status) {
      case "processing": return { label: "กำลังจัดทำ", color: "bg-amber-100 text-amber-700 border-amber-200" };
      case "ready": return { label: "พร้อมรับ", color: "bg-emerald-100 text-emerald-700 border-emerald-200 animate-bounce-slow" };
      case "collected": return { label: "รับแล้ว", color: "bg-blue-100 text-blue-700 border-blue-200" };
      default: return { label: "ยังไม่เริ่ม", color: "bg-slate-100 text-slate-500 border-slate-200" };
    }
  };

  const certInfo = getCertificateStatusInfo(project.certificateStatus);

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
          
        {(project.status === "draft" || project.status === "revision_required") && (session?.user as any)?.id === project.ownerId && (
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

        {project.status === "summary_revision_required" && (session?.user as any)?.id === project.ownerId && (
          <Link
            href={`/projects/${project.id}/summary`}
            className="flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Send className="mr-2 h-4 w-4" />
            แก้ไขสรุปผล (027)
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

      {/* Certificate Ready Alert for Student */}
      {project.certificateStatus === "ready" && project.ownerId === user?.id && (
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 flex items-start space-x-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="rounded-full bg-emerald-500 p-2 text-white shadow-lg shadow-emerald-200">
            <Award className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-emerald-900 tracking-tight">ยินดีด้วย! เกียรติบัตรของคุณพร้อมรับแล้ว</h3>
            <p className="text-sm text-emerald-700 font-medium mt-1">
              โครงการ "{project.projectName}" ได้รับการออกเกียรติบัตรตัวจริงเรียบร้อยแล้ว 
              กรุณาติดต่อรับได้ที่ **กองพัฒนานักศึกษา อาคาร 1 ชั้น 2** ในวันและเวลาราชการ
            </p>
          </div>
          <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-black uppercase tracking-widest rounded-lg shadow-sm hover:bg-emerald-700 transition-colors">
            ดูแผนที่
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-slate-800 border-b pb-2">รายละเอียดโครงการ</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">หลักการและเหตุผล</h4>
                <p className="mt-1 text-slate-700 whitespace-pre-wrap break-words">{project.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">วัตถุประสงค์</h4>
                <p className="mt-1 text-slate-700 whitespace-pre-wrap break-words">{project.objectives}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500 uppercase tracking-wider">ผลที่คาดว่าจะได้รับ</h4>
                <p className="mt-1 text-slate-700 whitespace-pre-wrap break-words">{project.expectedOutcome}</p>
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

          {/* Team Members Section */}
          <section className="rounded-[40px] border bg-white p-10 shadow-sm mt-10 border-slate-100">
            <ProjectTeam 
              projectId={project.id} 
              members={project.members as any} 
              ownerId={project.ownerId}
              currentUserId={user?.id}
            />
          </section>

          {/* Audit History Timeline (Historical) */}
          <section className="rounded-[32px] border bg-slate-50/50 p-8 shadow-sm mt-8 border-slate-200/60">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
                  <History className="mr-3 h-6 w-6 text-indigo-600" />
                  ประวัติการดำเนินการ (Audit Logs)
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1">ติดตามทุกความเคลื่อนไหวและระยะเวลาในแต่ละขั้นตอน</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Updates</span>
              </div>
            </div>
            
            {project.auditLogs.length > 0 ? (
              <AuditTimeline logs={project.auditLogs as any} />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                <Clock className="h-12 w-12 text-slate-200 mb-4" />
                <p className="text-sm font-bold text-slate-400 italic">
                  ยังไม่มีประวัติการดำเนินการย้อนหลัง
                </p>
              </div>
            )}
          </section>
        </div>

        {/* Sidebar: Workflow & Info */}
        <div className="space-y-6">
          {/* Certificate Status Section for Students */}
          {project.status === "completed" && (
            <section className="rounded-xl border bg-white p-6 shadow-sm overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Award className="h-20 w-20" />
              </div>
              <h3 className="mb-4 text-sm font-bold text-slate-800 uppercase tracking-widest">สถานะเกียรติบัตร</h3>
              <div className={cn(
                "inline-flex items-center px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border",
                certInfo.color
              )}>
                <Award className="mr-2 h-4 w-4" />
                {certInfo.label}
              </div>
              
              {project.certificateStatus === "none" && (
                <p className="mt-4 text-[10px] text-slate-400 leading-relaxed italic">
                  * มหาวิทยาลัยจะเริ่มดำเนินการจัดทำหลังจากโครงการสำเร็จเรียบร้อยแล้ว
                </p>
              )}
            </section>
          )}

          {/* Certificate Manager for Staff */}
          {project.status === "completed" && (userRole === "university" || userRole === "admin") && (
            <CertificateManager projectId={project.id} currentStatus={project.certificateStatus} />
          )}

          <section className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-800 border-b pb-2">ขั้นตอนการอนุมัติปัจจุบัน</h3>
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

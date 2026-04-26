import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { FileText, Clock, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ApprovalsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as any).role;
  if (role === "student") redirect("/");

  const pendingApprovals = await prisma.workflowStep.findMany({
    where: {
      status: "in_review",
      assigneeRole: role,
    },
    include: {
      project: {
        include: {
          owner: { select: { fullName: true, studentId: true } }
        }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">รายการรอการพิจารณา</h1>
        <p className="text-slate-500">ตรวจสอบและพิจารณาโครงการที่รอการอนุมัติในขั้นตอนของคุณ</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {pendingApprovals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white py-12">
            <Clock className="h-12 w-12 text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">ไม่มีรายการที่รอการพิจารณาในขณะนี้</p>
          </div>
        ) : (
          pendingApprovals.map((step) => (
            <Link
              key={step.id}
              href={`/projects/${step.projectId}?review=${step.id}`}
              className="flex items-center justify-between rounded-xl border bg-white p-5 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-center space-x-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{step.project.projectName}</h3>
                  <div className="flex items-center space-x-3 text-sm text-slate-500 mt-1">
                    <span className="flex items-center">
                      <User className="mr-1 h-3.5 w-3.5" />
                      {step.project.owner.fullName} ({step.project.owner.studentId})
                    </span>
                    <span>•</span>
                    <span>ส่งเมื่อ {new Date(step.createdAt).toLocaleDateString("th-TH")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <StatusBadge status="under_review" />
                  <p className="text-xs text-slate-400 mt-1">ขั้นตอน: {step.stepName}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

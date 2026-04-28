import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { FileText, Clock, ChevronRight, User, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ApprovalsPage(props: { searchParams: Promise<{ cursor?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as any).role;
  if (role === "student") redirect("/");

  const PAGE_SIZE = 20;
  const { cursor } = await props.searchParams;

  // PERF: Explicit select — avoids loading description/objectives/expectedOutcome
  // and all other large text columns for a simple list view
  const pendingApprovals = await prisma.workflowStep.findMany({
    take: PAGE_SIZE + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    where: {
      status: "in_review",
      assigneeRole: role,
    },
    select: {
      id: true,
      stepName: true,
      stepOrder: true,
      createdAt: true,
      projectId: true,
      project: {
        select: {
          id: true,
          projectName: true,
          status: true,
          owner: {
            select: { fullName: true, studentId: true },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const hasNextPage = pendingApprovals.length > PAGE_SIZE;
  const displayApprovals = hasNextPage ? pendingApprovals.slice(0, PAGE_SIZE) : pendingApprovals;
  const nextCursor = hasNextPage ? displayApprovals[displayApprovals.length - 1].id : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">รายการรอการพิจารณา</h1>
        <p className="text-slate-500">ตรวจสอบและพิจารณาโครงการที่รอการอนุมัติในขั้นตอนของคุณ</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayApprovals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-white py-12">
            <Clock className="h-12 w-12 text-slate-200 mb-4" />
            <p className="text-slate-400 font-medium">ไม่มีรายการที่รอการพิจารณาในขณะนี้</p>
          </div>
        ) : (
          displayApprovals.map((step) => (
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

      {/* Pagination Controls */}
      { (cursor || nextCursor) && (
        <div className="flex items-center justify-end space-x-4">
          {cursor && (
            <Link
              href="/approvals"
              className="flex items-center rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> กลับต้น
            </Link>
          )}
          {nextCursor && (
            <Link
              href={`/approvals?cursor=${nextCursor}`}
              className="flex items-center rounded-lg bg-slate-800 px-6 py-2 text-sm font-medium text-white hover:bg-slate-700 transition-all"
            >
              ดูเพิ่มเติม <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

import Link from "next/link";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { ProjectSearch } from "@/components/projects/ProjectSearch";
import { Plus, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { redirect } from "next/navigation";

const PAGE_SIZE = 20;

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string; cursor?: string; docType?: string }>;
}) {
  const { search, status, cursor, docType } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const userId = (session.user as any).id;

  const isSummary = docType === "027";
  
  // Define which statuses belong to which view
  const summaryStatuses = ["summary_submitted", "summary_under_review", "summary_revision_required", "summary_rejected", "completed", "approved"];
  const proposalStatuses = ["draft", "submitted", "under_review", "revision_required", "approved", "rejected"];
  
  const currentStatuses = isSummary ? summaryStatuses : proposalStatuses;
  
  // FIXED: Added cursor-based pagination (no unbounded findMany)
  const projects = await prisma.project.findMany({
    take: PAGE_SIZE + 1,
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    where: {
      ownerId: userId,
      deletedAt: null, // Exclude soft-deleted projects
      status: { in: status ? [status] : currentStatuses },
      ...(search ? { projectName: { contains: search, mode: 'insensitive' } } : {}),
    },
    // FIXED: Explicit select — prevents loading description/objectives/other large fields
    select: {
      id: true,
      projectName: true,
      projectType: true,
      status: true,
      academicYear: true,
      semester: true,
      plannedStartDate: true,
      plannedEndDate: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const hasNextPage = projects.length > PAGE_SIZE;
  const displayProjects = hasNextPage ? projects.slice(0, PAGE_SIZE) : projects;
  const nextCursor = hasNextPage ? displayProjects[displayProjects.length - 1].id : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isSummary ? "สรุปผลโครงการ (027)" : "เสนอโครงการ (025)"}
          </h1>
          <p className="text-slate-500 font-medium">
            {isSummary 
              ? "จัดการและติดตามการสรุปผลโครงการที่ดำเนินงานเสร็จสิ้น" 
              : "จัดการและติดตามการเสนอขออนุมัติโครงการใหม่"
            }
          </p>
        </div>
        {!isSummary && (
          <Link
            href="/projects/new"
            className="flex items-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-black text-white hover:bg-indigo-500 shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus className="mr-2 h-4 w-4" />
            สร้างโครงการใหม่
          </Link>
        )}
      </div>

      {/* Search & Filter Bar */}
      <ProjectSearch />

      {/* Projects Table/Grid */}
      <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-2xl shadow-slate-200/50">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">โครงการ</th>
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ประเภท</th>
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">วันเริ่ม-จบ</th>
              <th className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">สถานะ</th>
              <th className="relative px-8 py-5">
                <span className="sr-only">จัดการ</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 bg-white">
            {displayProjects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-slate-500">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50 text-slate-300">
                    <FileText className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-bold text-slate-400">ยังไม่มีโครงการในส่วนนี้</p>
                </td>
              </tr>
            ) : (
              displayProjects.map((project) => (
                <tr key={project.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight mb-1">{project.projectName}</div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">ปีการศึกษา {project.academicYear}/{project.semester}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-600 uppercase tracking-wider">
                      {project.projectType}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-500">
                    {project.plannedStartDate?.toLocaleDateString("th-TH")} - {project.plannedEndDate?.toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-8 py-6">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-8 py-6 text-right text-sm font-medium">
                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-600 hover:text-white transition-all hover:shadow-lg hover:shadow-indigo-200"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cursor Pagination Controls */}
      <div className="flex items-center justify-between px-2">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          แสดง {displayProjects.length} รายการ {cursor ? "(หน้าถัดไป)" : ""}
        </p>
        <div className="flex space-x-3">
          {cursor && (
            <Link
              href={`/projects?${new URLSearchParams({ docType: docType || "025", ...(search ? { search } : {}), ...(status ? { status } : {}) }).toString()}`}
              className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-black text-slate-600 uppercase tracking-widest hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> กลับต้น
            </Link>
          )}
          {nextCursor && (
            <Link
              href={`/projects?${new URLSearchParams({ docType: docType || "025", ...(search ? { search } : {}), ...(status ? { status } : {}), cursor: nextCursor }).toString()}`}
              className="inline-flex items-center rounded-2xl bg-indigo-600 px-5 py-2.5 text-xs font-black text-white uppercase tracking-widest hover:bg-indigo-500 shadow-lg shadow-indigo-200 transition-all"
            >
              ดูเพิ่มเติม <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

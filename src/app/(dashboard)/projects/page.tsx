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
  searchParams: Promise<{ search?: string; status?: string; cursor?: string }>;
}) {
  const { search, status, cursor } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const userId = (session.user as any).id;
  
  // FIXED: Added cursor-based pagination (no unbounded findMany)
  const projects = await prisma.project.findMany({
    take: PAGE_SIZE + 1, // Fetch one extra to detect if there's a next page
    skip: cursor ? 1 : 0,
    cursor: cursor ? { id: cursor } : undefined,
    where: {
      ownerId: userId,
      ...(search ? { projectName: { contains: search, mode: 'insensitive' } } : {}),
      ...(status ? { status } : {}),
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
          <h1 className="text-3xl font-bold text-slate-800">โครงการของฉัน</h1>
          <p className="text-slate-500">จัดการและติดตามสถานะโครงการทั้งหมดของคุณ</p>
        </div>
        <Link
          href="/projects/new"
          className="flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" />
          สร้างโครงการใหม่
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <ProjectSearch />

      {/* Projects Table/Grid */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">โครงการ</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">ประเภท</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">วันเริ่ม-จบ</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">สถานะ</th>
              <th className="relative px-6 py-3">
                <span className="sr-only">จัดการ</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {displayProjects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  ยังไม่มีโครงการในระบบ
                </td>
              </tr>
            ) : (
              displayProjects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-slate-900">{project.projectName}</div>
                        <div className="text-xs text-slate-500">ปีการศึกษา {project.academicYear}/{project.semester}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {project.projectType}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {project.plannedStartDate?.toLocaleDateString("th-TH")} - {project.plannedEndDate?.toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      ดูรายละเอียด
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cursor Pagination Controls */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          แสดง {displayProjects.length} รายการ {cursor ? "(หน้าถัดไป)" : ""}
        </p>
        <div className="flex space-x-3">
          {cursor && (
            <Link
              href={`/projects?${new URLSearchParams({ ...(search ? { search } : {}), ...(status ? { status } : {}) }).toString()}`}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> กลับต้น
            </Link>
          )}
          {nextCursor && (
            <Link
              href={`/projects?${new URLSearchParams({ ...(search ? { search } : {}), ...(status ? { status } : {}), cursor: nextCursor }).toString()}`}
              className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500 transition-colors"
            >
              ดูเพิ่มเติม <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

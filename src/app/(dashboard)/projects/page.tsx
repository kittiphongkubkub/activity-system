import Link from "next/link";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StatusBadge } from "@/components/projects/StatusBadge";
import { Plus, FileText, Search, Filter } from "lucide-react";

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions);
  
  const projects = await prisma.project.findMany({
    where: {
      ownerId: (session?.user as any)?.id,
    },
    orderBy: { createdAt: "desc" },
  });

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
      <div className="flex items-center space-x-4 rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex flex-1 items-center rounded-lg bg-slate-100 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาตามชื่อโครงการ..."
            className="ml-2 w-full bg-transparent text-sm outline-none"
          />
        </div>
        <button className="flex items-center rounded-lg border px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <Filter className="mr-2 h-4 w-4" />
          ตัวกรอง
        </button>
      </div>

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
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <FileText className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                  ยังไม่มีโครงการในระบบ
                </td>
              </tr>
            ) : (
              projects.map((project) => (
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
    </div>
  );
}

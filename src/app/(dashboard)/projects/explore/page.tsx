import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  FileText, 
  Calendar, 
  Users, 
  MapPin,
  Sparkles,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExploreSearch } from "@/components/projects/ExploreSearch";
import { StatusBadge } from "@/components/projects/StatusBadge";

export default async function ExploreProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string; status?: string; cursor?: string }>;
}) {
  const { search, type, status, cursor } = await searchParams;
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const PAGE_SIZE = 20;

  // Fetch projects with cursor-based pagination
  const projects = await prisma.project.findMany({
    take: PAGE_SIZE + 1,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    where: {
      // Default to approved/completed statuses if no specific status filter
      status: status ? status : { in: ["approved", "summary_submitted", "summary_under_review", "completed"] },
      ...(type ? { projectType: type } : {}),
      ...(search ? {
        OR: [
          { projectName: { contains: search, mode: 'insensitive' } },
          { projectType: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ]
      } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      owner: true,
      _count: {
        select: { activityScores: true }
      }
    }
  });

  const hasNextPage = projects.length > PAGE_SIZE;
  const displayProjects = hasNextPage ? projects.slice(0, PAGE_SIZE) : projects;
  const nextCursor = hasNextPage ? displayProjects[displayProjects.length - 1].id : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">โครงการทั้งหมด</h1>
          <p className="text-slate-500 font-medium">ค้นหาและเข้าร่วมกิจกรรมที่น่าสนใจภายในมหาวิทยาลัย</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <ExploreSearch />

      {/* Projects List */}
      <div className="rounded-[32px] border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">โครงการ</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">ประเภท</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">วันเวลา/สถานที่</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">สถานะ</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayProjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-3xl bg-slate-50 flex items-center justify-center mb-4">
                        <Search className="h-8 w-8 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-bold">ไม่พบโครงการที่เปิดรับในขณะนี้</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayProjects.map((project) => (
                  <tr key={project.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mr-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 leading-none mb-1.5">{project.projectName}</p>
                          <p className="text-xs text-slate-500 font-medium">โดย {project.owner.fullName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm font-bold text-slate-600">
                      {project.projectType || "ทั่วไป"}
                    </td>
                    <td className="px-6 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center text-xs font-bold text-slate-500">
                          <Calendar className="mr-2 h-3.5 w-3.5 text-slate-400" />
                          {project.plannedStartDate ? new Date(project.plannedStartDate).toLocaleDateString("th-TH") : "ไม่ระบุ"}
                        </div>
                        <div className="flex items-center text-xs font-bold text-slate-500">
                          <MapPin className="mr-2 h-3.5 w-3.5 text-slate-400" />
                          {project.location || "ไม่ระบุสถานที่"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      <Link 
                        href={`/projects/${project.id}`}
                        className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                      >
                        ดูรายละเอียด
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      { (cursor || nextCursor) && (
        <div className="flex items-center justify-center space-x-4">
          {cursor && (
            <Link
              href={`/projects/explore?${new URLSearchParams({ ...(type ? { type } : {}), ...(status ? { status } : {}), ...(search ? { search } : {}) }).toString()}`}
              className="rounded-xl border bg-white px-6 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
            >
              กลับต้น
            </Link>
          )}
          {nextCursor && (
            <Link
              href={`/projects/explore?${new URLSearchParams({ ...(type ? { type } : {}), ...(status ? { status } : {}), ...(search ? { search } : {}), cursor: nextCursor }).toString()}`}
              className="rounded-xl bg-indigo-600 px-8 py-2 text-sm font-bold text-white hover:bg-indigo-500 shadow-lg shadow-indigo-100 transition-all"
            >
              ดูเพิ่มเติม
            </Link>
          )}
        </div>
      )}

      {/* Promotion/Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-[32px] bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-64 w-64 -translate-y-20 translate-x-20 rounded-full bg-white/10 blur-3xl group-hover:scale-125 transition-transform duration-1000" />
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/10 text-[10px] font-black uppercase tracking-widest">
              <Sparkles className="mr-2 h-3 w-3" />
              ระบบสะสมคะแนนกิจกรรม
            </div>
            <h3 className="text-2xl font-black tracking-tight">เข้าร่วมโครงการเพื่อรับคะแนนกิจกรรม (Activity Score)</h3>
            <p className="text-indigo-100 text-sm leading-relaxed max-w-lg">
              การเข้าร่วมโครงการที่ได้รับการอนุมัติจะช่วยให้คุณสะสมคะแนนกิจกรรมเพื่อนำไปขอรับเกียรติบัตรหรือรางวัลเกียรติยศประจำปีการศึกษา
            </p>
          </div>
        </div>
        
        <div className="rounded-[32px] bg-white border border-slate-100 p-8 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
           <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="h-8 w-8" />
           </div>
           <div>
              <p className="text-3xl font-black text-slate-900">{displayProjects.length}</p>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">โครงการที่เปิดรับในหน้านี้</p>
           </div>
        </div>
      </div>
    </div>
  );
}

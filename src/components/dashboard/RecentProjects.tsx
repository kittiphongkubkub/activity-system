import prisma from "@/lib/db";
import Link from "next/link";
import { FileText, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/projects/StatusBadge";

interface RecentProjectsProps {
  userId: string;
  role: string;
}

export async function RecentProjects({ userId, role }: RecentProjectsProps) {
  const recentProjects = await prisma.project.findMany({
    where: role === "student" ? { ownerId: userId } : {},
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: { owner: true }
  });

  if (recentProjects.length === 0) {
    return (
      <div className="rounded-[32px] border-2 border-dashed border-slate-100 bg-white/50 p-20 text-center backdrop-blur-sm">
        <FileText className="mx-auto h-12 w-12 text-slate-200 mb-4" />
        <p className="text-slate-400 font-bold text-lg">ยังไม่มีโครงการในระบบ</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentProjects.map((project) => (
        <Link 
          key={project.id} 
          href={`/projects/${project.id}`}
          className="group flex items-center justify-between rounded-[28px] border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:border-indigo-100"
        >
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <FileText className="h-8 w-8" />
            </div>
            <div className="ml-5">
              <p className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{project.projectName}</p>
              <div className="flex items-center mt-1 space-x-3">
                <p className="text-sm font-medium text-slate-500">
                  {role !== "student" ? `โดย ${project.owner?.fullName}` : `อัปเดตเมื่อ ${new Date(project.updatedAt).toLocaleDateString("th-TH")}`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <StatusBadge status={project.status} />
            <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      ))}
    </div>
  );
}

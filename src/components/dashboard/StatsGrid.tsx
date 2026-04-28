import { FileCheck, Clock, AlertCircle, Users, CheckCircle2 } from "lucide-react";
import { getCachedStudentStats, getCachedAdminStats } from "@/lib/cache";

interface StatsGridProps {
  userId: string;
  role: string;
}

export async function StatsGrid({ userId, role }: StatsGridProps) {
  let stats: any[] = [];

  if (role === "student") {
    // PERF: Cached for 60s — avoids re-querying DB on every concurrent dashboard load
    const { approvedCount, pendingCount, revisionCount, totalParticipants } =
      await getCachedStudentStats(userId);

    stats = [
      { label: "โครงการที่สำเร็จแล้ว", value: approvedCount, icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "รอการพิจารณา", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
      { label: "ต้องแก้ไข", value: revisionCount, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50" },
      { label: "ผู้ร่วมกิจกรรมรวม", value: totalParticipants._sum.expectedParticipants || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    ];
  } else {
    // PERF: Cached for 60s — global admin stats don't need real-time precision
    const { allProjects, allPending, allCompleted, allUsers } =
      await getCachedAdminStats();

    stats = [
      { label: "โครงการทั้งหมด", value: allProjects, icon: FileCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
      { label: "รอการอนุมัติ", value: allPending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
      { label: "ปิดโครงการแล้ว", value: allCompleted, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
      { label: "ผู้ใช้ทั้งหมด", value: allUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    ];
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
      {stats.map((stat, i) => (
        <div key={i} className="group relative rounded-[32px] bg-white border border-slate-100 p-8 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
          <div className={`absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full ${stat.bg.replace('bg-', 'bg-opacity-10 bg-')} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`} />
          <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${stat.bg} ${stat.color} bg-opacity-10`}>
            <stat.icon className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-4xl font-black text-slate-900">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  Plus, 
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { InvitationList } from "@/components/projects/InvitationList";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { ScoreCard } from "@/components/dashboard/ScoreCard";
import { 
  StatsSkeleton, 
  ProjectsSkeleton, 
  ScoreSkeleton 
} from "@/components/dashboard/DashboardSkeletons";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  return (
    <div className="relative space-y-12 pb-20">
      {/* Background Decorative Elements */}
      <div className="absolute -top-24 -right-24 h-96 w-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -left-24 h-96 w-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">ระบบพร้อมใช้งาน</span>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
            สวัสดี, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">{session.user?.name}</span>
          </h2>
          <p className="text-slate-500 font-medium text-lg">
            {role === "student" 
              ? "ยินดีต้อนรับกลับมา! ตรวจสอบสถานะโครงการและคะแนนสะสมของคุณได้ที่นี่" 
              : "ภาพรวมการอนุมัติและโครงการทั้งหมดที่อยู่ภายใต้การดูแลของคุณ"}
          </p>
        </div>
        
        {role === "student" && (
          <Link href="/projects/new" className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-slate-950 px-8 py-4 text-sm font-black text-white shadow-2xl shadow-slate-200 transition-all hover:scale-[1.02] active:scale-95">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="relative flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              สร้างโครงการใหม่
            </span>
          </Link>
        )}
      </div>

      {/* Stats Grid - Streamed */}
      <Suspense fallback={<StatsSkeleton />}>
        <StatsGrid userId={userId} role={role} />
      </Suspense>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 relative z-10">
        {/* Recent Projects List - Streamed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">โครงการล่าสุด</h3>
            <Link href="/projects" className="text-sm font-bold text-indigo-600 hover:underline flex items-center">
              ดูทั้งหมด <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <Suspense fallback={<ProjectsSkeleton />}>
            <RecentProjects userId={userId} role={role} />
          </Suspense>
        </div>

        {/* Side Panel: Score or Activity */}
        <div className="space-y-8">
          {role === "student" && (
            <Suspense fallback={<ScoreSkeleton />}>
              <ScoreCard userId={userId} />
            </Suspense>
          )}

          {/* Invitations Section */}
          {role === "student" && (
            <div className="rounded-[32px] bg-white border border-slate-100 p-8 shadow-sm">
              <InvitationList />
            </div>
          )}

          {/* Quick Info / Announcements */}
          <div className="rounded-[32px] bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
             <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
             <div className="relative z-10 space-y-4">
              <h4 className="text-lg font-black tracking-tight">คู่มือการใช้งาน</h4>
              <p className="text-sm text-indigo-100 leading-relaxed font-medium">ศึกษารูปแบบการเขียนโครงการให้ถูกต้องเพื่อการอนุมัติที่รวดเร็ว</p>
              <Link 
                href="/manual" 
                className="flex items-center text-[10px] font-black uppercase tracking-widest bg-white text-indigo-600 px-5 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg w-fit"
              >
                อ่านคู่มือออนไลน์
                <ChevronRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  FileCheck, 
  Clock, 
  AlertCircle, 
  Users,
  TrendingUp,
  FileText,
  Award,
  ChevronRight,
  Plus
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/projects/StatusBadge";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;
  const role = (session.user as any).role;

  // Fetch stats based on role
  let stats: any[] = [];
  let recentProjects: any[] = [];
  let scoreData = { total: 0, progress: 0 };

  if (role === "student") {
    const [approvedCount, pendingCount, revisionCount, totalParticipants] = await Promise.all([
      prisma.project.count({ where: { ownerId: userId, status: "completed" } }),
      prisma.project.count({ where: { ownerId: userId, status: { in: ["submitted", "under_review", "summary_submitted", "summary_under_review"] } } }),
      prisma.project.count({ where: { ownerId: userId, status: "revision_required" } }),
      prisma.project.aggregate({ where: { ownerId: userId }, _sum: { expectedParticipants: true } }),
    ]);

    stats = [
      { label: "โครงการที่สำเร็จแล้ว", value: approvedCount, icon: FileCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
      { label: "รอการพิจารณา", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
      { label: "ต้องแก้ไข", value: revisionCount, icon: AlertCircle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" },
      { label: "ผู้ร่วมกิจกรรมรวม", value: totalParticipants._sum.expectedParticipants || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    ];

    recentProjects = await prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      take: 5,
    });

    const scores = await prisma.activityScore.findMany({ where: { studentId: userId } });
    const total = scores.reduce((sum, s) => sum + Number(s.score), 0);
    scoreData = { total, progress: Math.min((total / 100) * 100, 100) };
  } else {
    const [allProjects, allPending, allCompleted, allUsers] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "under_review" } }),
      prisma.project.count({ where: { status: "completed" } }),
      prisma.user.count(),
    ]);

    stats = [
      { label: "โครงการทั้งหมด", value: allProjects, icon: FileCheck, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
      { label: "รอการอนุมัติ", value: allPending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
      { label: "ปิดโครงการแล้ว", value: allCompleted, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
      { label: "ผู้ใช้ทั้งหมด", value: allUsers, icon: Users, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
    ];

    recentProjects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { owner: true }
    });
  }

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

      {/* Stats Grid */}
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

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 relative z-10">
        {/* Recent Projects List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">โครงการล่าสุด</h3>
            <Link href="/projects" className="text-sm font-bold text-indigo-600 hover:underline flex items-center">
              ดูทั้งหมด <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <div className="rounded-[32px] border-2 border-dashed border-slate-100 bg-white/50 p-20 text-center backdrop-blur-sm">
                <FileText className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold text-lg">ยังไม่มีโครงการในระบบ</p>
              </div>
            ) : (
              recentProjects.map((project) => (
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
              ))
            )}
          </div>
        </div>

        {/* Side Panel: Score or Activity */}
        <div className="space-y-8">
          {role === "student" && (
            <div className="rounded-[40px] bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-64 w-64 -translate-y-24 translate-x-24 rounded-full bg-indigo-500/20 blur-3xl group-hover:bg-indigo-500/30 transition-colors" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black tracking-tight">คะแนนสะสม</h3>
                  <Award className="h-6 w-6 text-amber-400" />
                </div>
                
                <div className="text-center py-4">
                  <p className="text-7xl font-black tracking-tighter">{scoreData.total}</p>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Total Activity Points</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
                    <span>Progress</span>
                    <span className="text-white">{Math.min(Math.round((scoreData.total / 85) * 100), 100)}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-white/10 p-0.5">
                    <div 
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all duration-1000" 
                      style={{ width: `${Math.min((scoreData.total / 85) * 100, 100)}%` }} 
                    />
                  </div>
                </div>

                <div className={`rounded-2xl p-5 border ${scoreData.total >= 85 ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-white/5 border-white/10 text-slate-300'}`}>
                   <p className="text-xs font-bold leading-relaxed">
                      {scoreData.total >= 85 
                        ? "ยินดีด้วย! คุณได้รับรางวัลเกียรติยศประจำปีนี้แล้ว สามารถตรวจสอบเกียรติบัตรได้ในหน้าตั้งค่า" 
                        : `คุณต้องการอีก ${Math.max(85 - scoreData.total, 0)} คะแนนเพื่อรับรางวัลเกียรติยศ`}
                   </p>
                </div>

                <Link href="/activity-scores" className="flex items-center justify-center w-full py-4 rounded-2xl bg-white/10 font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
                  View Full Report
                </Link>
              </div>
            </div>
          )}

          {/* Quick Info / Announcements */}
          <div className="rounded-[32px] bg-indigo-600 p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-purple-700" />
             <div className="absolute -bottom-8 -right-8 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            
             <div className="relative z-10 space-y-4">
              <h4 className="text-lg font-black tracking-tight">คู่มือการใช้งาน</h4>
              <p className="text-sm text-indigo-100 leading-relaxed font-medium">ศึกษารูปแบบการเขียนโครงการให้ถูกต้องเพื่อการอนุมัติที่รวดเร็ว</p>
              <button className="flex items-center text-[10px] font-black uppercase tracking-widest bg-white text-indigo-600 px-5 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                Download PDF
                <ChevronRight className="ml-1 h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ensure CheckCircle2 is imported
import { CheckCircle2 } from "lucide-react";

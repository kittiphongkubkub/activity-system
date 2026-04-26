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
    <div className="space-y-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            สวัสดี, <span className="text-indigo-600">{session.user?.name}</span>
          </h2>
          <p className="text-slate-500 font-medium">
            {role === "student" 
              ? "ยินดีต้อนรับกลับมา! ตรวจสอบสถานะโครงการและคะแนนสะสมของคุณได้ที่นี่" 
              : "ภาพรวมการอนุมัติและโครงการทั้งหมดที่อยู่ภายใต้การดูแลของคุณ"}
          </p>
        </div>
        {role === "student" && (
          <Link href="/projects/new" className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-xl shadow-slate-200 hover:bg-indigo-600 active:scale-95 transition-all">
            <Plus className="mr-2 h-5 w-5" />
            สร้างโครงการใหม่
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className={`group relative overflow-hidden rounded-3xl border ${stat.border} bg-white p-6 transition-all hover:shadow-xl hover:shadow-indigo-500/5`}>
             <div className="flex items-center justify-between">
                <div className={`rounded-2xl ${stat.bg} ${stat.color} p-4 transition-transform group-hover:scale-110`}>
                  <stat.icon className="h-7 w-7" />
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black text-slate-900 mt-1">{stat.value}</p>
                </div>
             </div>
             <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Recent Projects List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">โครงการล่าสุด</h3>
            <Link href="/projects" className="text-sm font-bold text-indigo-600 hover:underline flex items-center">
              ดูทั้งหมด <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-slate-100 bg-white py-16 text-center">
                <FileText className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                <p className="text-slate-400 font-bold">ไม่มีข้อมูลโครงการในขณะนี้</p>
              </div>
            ) : (
              recentProjects.map((project) => (
                <Link 
                  key={project.id} 
                  href={`/projects/${project.id}`}
                  className="group flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-5 transition-all hover:shadow-lg hover:border-indigo-100"
                >
                  <div className="flex items-center">
                    <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <FileText className="h-7 w-7" />
                    </div>
                    <div className="ml-4">
                      <p className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{project.projectName}</p>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        {role !== "student" ? `โดย ${project.owner?.fullName}` : `อัปเดตเมื่อ ${new Date(project.updatedAt).toLocaleDateString("th-TH")}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={project.status} />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">Click to view</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Activity Score Progress */}
        {role === "student" && (
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">เป้าหมายคะแนน</h3>
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm relative overflow-hidden group">
              {/* Background Glow */}
              <div className={`absolute -right-20 -top-20 h-40 w-40 rounded-full blur-3xl transition-colors ${scoreData.total >= 85 ? 'bg-amber-400/10' : 'bg-indigo-400/10'}`} />
              
              <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                   <div className={`rounded-2xl p-4 ${scoreData.total >= 85 ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
                      <Award className="h-8 w-8" />
                   </div>
                   <div className="text-right">
                      <p className="text-4xl font-black text-slate-900 tracking-tight">{scoreData.total}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">คะแนนสะสม</p>
                   </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-xs font-black text-slate-400 uppercase tracking-widest">
                    <span>ความก้าวหน้า</span>
                    <span>{Math.round(scoreData.progress)}%</span>
                  </div>
                  <div className="h-4 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-4 rounded-full transition-all duration-1000 ${scoreData.total >= 85 ? 'bg-gradient-to-r from-amber-400 to-amber-600' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'}`} 
                      style={{ width: `${scoreData.progress}%` }} 
                    />
                  </div>
                </div>

                <div className={`rounded-2xl p-5 border ${scoreData.total >= 85 ? 'bg-amber-50 border-amber-100 text-amber-800' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                   <p className="text-xs font-bold leading-relaxed">
                      {scoreData.total >= 85 
                        ? "ยินดีด้วย! คุณได้รับรางวัลเกียรติยศประจำปีนี้แล้ว สามารถตรวจสอบเกียรติบัตรได้ในหน้าตั้งค่า" 
                        : `คุณต้องการอีก ${Math.max(85 - scoreData.total, 0)} คะแนนเพื่อรับรางวัลเกียรติยศ (เกณฑ์ 85 คะแนน)`}
                   </p>
                </div>

                <Link href="/activity-scores" className="flex w-full items-center justify-center rounded-2xl bg-slate-50 py-4 text-xs font-black text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all uppercase tracking-widest">
                   ดูประวัติคะแนนทั้งหมด <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Ensure CheckCircle2 is imported
import { CheckCircle2 } from "lucide-react";

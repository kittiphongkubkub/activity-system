import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SCORING_CONFIG } from "@/lib/workflow";
import { Award, FileText, TrendingUp, Calendar, Sparkles, ChevronRight, Target } from "lucide-react";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function ActivityScoresPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const scores = await prisma.activityScore.findMany({
    where: { studentId: (session.user as any).id },
    include: { project: { select: { projectName: true, id: true } } },
    orderBy: { awardedAt: "desc" },
  });

  const totalScore = scores.reduce((sum, s) => sum + Number(s.score), 0);
  const targetScore = SCORING_CONFIG.ANNUAL_TARGET;
  const progress = Math.min((totalScore / targetScore) * 100, 100);

  return (
    <div className="relative space-y-12 pb-20">
      {/* Background Decorative Elements */}
      <div className="absolute -top-24 -right-24 h-96 w-96 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 -left-24 h-96 w-96 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10 space-y-2">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
          <Sparkles className="h-3 w-3 text-indigo-500" />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">สรุปผลคะแนนสะสม</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
          คะแนนกิจกรรมสะสม
        </h1>
        <p className="text-slate-500 font-medium text-lg">
          ติดตามและตรวจสอบประวัติการได้รับคะแนนกิจกรรมจากโครงการที่คุณเข้าร่วม
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 relative z-10">
        {/* Total Score Card - Premium Version */}
        <div className="rounded-[48px] bg-slate-900 p-10 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 h-64 w-64 -translate-y-24 translate-x-24 rounded-full bg-indigo-500/20 blur-3xl group-hover:bg-indigo-500/30 transition-colors duration-700" />
          <div className="absolute bottom-0 left-0 h-32 w-32 translate-y-16 -translate-x-16 rounded-full bg-purple-500/20 blur-2xl" />
          
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex items-center justify-between mb-12">
              <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/10">
                <Award className={`h-8 w-8 ${totalScore >= SCORING_CONFIG.HONOR_AWARD_THRESHOLD ? 'text-amber-400' : 'text-indigo-400'}`} />
              </div>
              {totalScore >= SCORING_CONFIG.HONOR_AWARD_THRESHOLD && (
                <div className="bg-amber-400 text-slate-950 text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-amber-400/20">
                  Honor Award
                </div>
              )}
            </div>

            <div className="text-center space-y-2 mb-12">
              <p className="text-8xl font-black tracking-tighter leading-none animate-in zoom-in duration-700">
                {totalScore}
              </p>
              <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Total Points</p>
            </div>

            <div className="mt-auto space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Progress to Goal</p>
                    <p className="text-sm font-bold text-white">{Math.round(progress)}% Completed</p>
                  </div>
                  <p className="text-xs font-bold text-slate-400">Target: {targetScore}</p>
                </div>
                <div className="h-4 w-full rounded-full bg-white/10 p-1">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-1000" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>

              <div className={`rounded-3xl p-6 border ${totalScore >= SCORING_CONFIG.HONOR_AWARD_THRESHOLD ? 'bg-amber-400/10 border-amber-400/20 text-amber-200' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                <div className="flex items-start space-x-3">
                  <Target className="h-5 w-5 mt-0.5 shrink-0" />
                  <p className="text-xs font-bold leading-relaxed">
                    {totalScore >= SCORING_CONFIG.HONOR_AWARD_THRESHOLD 
                      ? "ยอดเยี่ยมมาก! คุณสะสมคะแนนกิจกรรมครบตามเป้าหมายและได้รับสิทธิ์เสนอชื่อรับรางวัลเกียรติยศประจำปี" 
                      : `คุณต้องการอีก ${Math.max(targetScore - totalScore, 0)} คะแนน เพื่อให้ครบตามเกณฑ์ขั้นต่ำประจำปีการศึกษา`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History List Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
              <TrendingUp className="mr-3 h-6 w-6 text-indigo-600" />
              ประวัติการได้รับคะแนน
            </h3>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Total {scores.length} Records
            </div>
          </div>
          
          <div className="space-y-4">
            {scores.length === 0 ? (
              <div className="rounded-[40px] border-2 border-dashed border-slate-100 bg-white/50 p-24 text-center backdrop-blur-sm">
                <FileText className="mx-auto h-16 w-16 text-slate-200 mb-6" />
                <p className="text-slate-400 font-black text-xl tracking-tight">ยังไม่พบประวัติการรับคะแนน</p>
                <p className="text-slate-400 text-sm mt-2">เข้าร่วมและดำเนินโครงการให้เสร็จสิ้นเพื่อรับคะแนนกิจกรรม</p>
              </div>
            ) : (
              scores.map((score, index) => {
                const isClickable = !!score.project;
                
                const CardContent = (
                  <div 
                    className={`group relative flex items-center justify-between rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-4 duration-500 ${isClickable ? 'hover:shadow-2xl hover:border-indigo-200 hover:-translate-y-1 cursor-pointer' : 'cursor-default'}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center space-x-6">
                      <div className={`h-16 w-16 rounded-2xl flex items-center justify-center text-slate-400 transition-all duration-500 ${isClickable ? 'bg-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-600' : 'bg-slate-50'}`}>
                        <FileText className="h-8 w-8" />
                      </div>
                      <div>
                        <div className={`text-lg font-black text-slate-900 transition-colors flex items-center ${isClickable ? 'group-hover:text-indigo-600' : ''}`}>
                          {score.project?.projectName || score.activityType || "กิจกรรมสะสมคะแนน"}
                          {isClickable && (
                            <ChevronRight className="h-4 w-4 ml-2 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
                          )}
                        </div>
                        <div className="flex items-center mt-1 space-x-4">
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-slate-100 transition-colors ${isClickable ? 'bg-slate-50 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                              {score.activityType || "ทั่วไป"}
                           </span>
                           <div className="flex items-center text-xs font-bold text-slate-400">
                              <Calendar className="mr-1.5 h-3.5 w-3.5" />
                              {new Date(score.awardedAt).toLocaleDateString("th-TH")}
                           </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-baseline justify-end space-x-1">
                        <span className="text-xs font-black text-emerald-500 uppercase">Points</span>
                        <p className="text-4xl font-black text-emerald-500 tracking-tighter">
                          +{Number(score.score)}
                        </p>
                      </div>
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mt-1 transition-colors group-hover:text-emerald-400">Verified Activity</p>
                    </div>
                  </div>
                );

                if (isClickable) {
                  return (
                    <Link key={score.id} href={`/projects/${score.projectId}`} className="block">
                      {CardContent}
                    </Link>
                  );
                }

                return <div key={score.id}>{CardContent}</div>;
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Award, FileText, TrendingUp, Calendar } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ActivityScoresPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const scores = await prisma.activityScore.findMany({
    where: { studentId: (session.user as any).id },
    include: { project: { select: { projectName: true } } },
    orderBy: { awardedAt: "desc" },
  });

  const totalScore = scores.reduce((sum, s) => sum + Number(s.score), 0);
  const targetScore = 1000; // Example target
  const progress = Math.min((totalScore / targetScore) * 100, 100);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">คะแนนกิจกรรมสะสม</h1>
        <p className="text-slate-500">ติดตามคะแนนกิจกรรมที่คุณได้รับจากการเข้าร่วมโครงการต่างๆ</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Total Score Card */}
        <div className="rounded-xl border bg-white p-8 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
          {totalScore >= 85 && (
            <div className="absolute top-0 right-0 p-2">
              <div className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-1 rounded-bl-lg uppercase tracking-tighter animate-pulse border-l border-b border-amber-200">
                Honor Award
              </div>
            </div>
          )}
          
          <div className={`rounded-full ${totalScore >= 85 ? 'bg-amber-100' : 'bg-indigo-100'} p-4 mb-4 transition-colors`}>
            <Award className={`h-10 w-10 ${totalScore >= 85 ? 'text-amber-600' : 'text-indigo-600'}`} />
          </div>
          <p className="text-slate-500 font-medium">คะแนนรวมทั้งหมด</p>
          <p className={`text-5xl font-black ${totalScore >= 85 ? 'text-amber-600' : 'text-slate-900'} mt-2`}>{totalScore}</p>
          
          {totalScore >= 85 && (
            <div className="mt-2 text-xs font-bold text-amber-600 flex items-center">
              <Award className="h-3 w-3 mr-1" />
              ได้รับเข็มเกียรติยศแล้ว
            </div>
          )}

          <div className="mt-6 w-full space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-400 uppercase">
              <span>ความคืบหน้า</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-100">
              <div 
                className={`h-3 rounded-full ${totalScore >= 85 ? 'bg-amber-500' : 'bg-indigo-600'} transition-all duration-1000`} 
                style={{ width: `${progress}%` }} 
              />
            </div>
            <p className="text-xs text-slate-400">เป้าหมายประจำปีการศึกษา: {targetScore} คะแนน</p>
          </div>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between border-b pb-4">
            <h3 className="font-bold text-slate-800 flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-indigo-500" />
              ประวัติการได้รับคะแนน
            </h3>
          </div>
          
          <div className="space-y-4">
            {scores.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <FileText className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                ยังไม่ได้รับคะแนนกิจกรรมจากโครงการใดๆ
              </div>
            ) : (
              scores.map((score) => (
                <div key={score.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-4 transition-colors hover:bg-slate-50">
                  <div className="flex items-center space-x-4">
                    <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{score.project.projectName}</p>
                      <p className="text-sm text-slate-500">{score.activityType}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-emerald-600">+{Number(score.score)}</p>
                    <p className="flex items-center text-xs text-slate-400">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(score.awardedAt).toLocaleDateString("th-TH")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

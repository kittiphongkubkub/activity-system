import Link from "next/link";
import { Award } from "lucide-react";
import { SCORING_CONFIG } from "@/lib/workflow";
import { getCachedScoreTotal } from "@/lib/cache";

interface ScoreCardProps {
  userId: string;
}

export async function ScoreCard({ userId }: ScoreCardProps) {
  // PERF: SQL SUM aggregate + 120s cache — O(1) vs O(N) findMany + JS reduce
  const { total } = await getCachedScoreTotal(userId);
  const progress = Math.min((total / SCORING_CONFIG.ANNUAL_TARGET) * 100, 100);

  return (
    <div className="rounded-[40px] bg-slate-900 p-8 text-white shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 h-64 w-64 -translate-y-24 translate-x-24 rounded-full bg-indigo-500/20 blur-3xl group-hover:bg-indigo-500/30 transition-colors" />
      
      <div className="relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tight">คะแนนสะสม</h3>
          <Award className="h-6 w-6 text-amber-400" />
        </div>
        
        <div className="text-center py-4">
          <p className="text-7xl font-black tracking-tighter">{total}</p>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-3">Total Activity Points</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-xs font-black uppercase tracking-widest text-slate-400">
            <span>Progress</span>
            <span className="text-white">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-white/10 p-0.5">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] transition-all duration-1000" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        </div>

        <div className={`rounded-2xl p-5 border ${total >= SCORING_CONFIG.HONOR_AWARD_THRESHOLD ? 'bg-amber-500/10 border-amber-500/20 text-amber-200' : 'bg-white/5 border-white/10 text-slate-300'}`}>
           <p className="text-xs font-bold leading-relaxed">
              {total >= SCORING_CONFIG.HONOR_AWARD_THRESHOLD 
                ? "ยินดีด้วย! คุณได้รับรางวัลเกียรติยศประจำปีนี้แล้ว สามารถตรวจสอบเกียรติบัตรได้ในหน้าตั้งค่า" 
                : `คุณต้องการอีก ${Math.max(SCORING_CONFIG.HONOR_AWARD_THRESHOLD - total, 0)} คะแนนเพื่อรับรางวัลเกียรติยศ`}
           </p>
        </div>

        <Link href="/activity-scores" className="flex items-center justify-center w-full py-4 rounded-2xl bg-white/10 font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10">
          View Full Report
        </Link>
      </div>
    </div>
  );
}

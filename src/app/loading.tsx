import { Sparkles } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 font-sans">
      <div className="flex flex-col items-center space-y-8 animate-in fade-in duration-1000">
        <div className="relative">
          {/* Animated Background Rings */}
          <div className="absolute inset-0 h-24 w-24 -translate-x-2 -translate-y-2 rounded-full border-4 border-indigo-500/10 animate-ping" />
          <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-purple-500/20 animate-pulse" />
          
          <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-2xl shadow-indigo-200 animate-bounce duration-[2000ms]">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center justify-center">
            กำลังโหลดข้อมูล
            <span className="flex space-x-1 ml-2">
              <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1.5 w-1.5 bg-indigo-600 rounded-full animate-bounce" />
            </span>
          </h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">ActivityFlow Digital System</p>
        </div>
      </div>
    </div>
  );
}

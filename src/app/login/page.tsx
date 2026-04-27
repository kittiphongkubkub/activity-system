"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  ChevronRight, 
  ShieldCheck,
  LayoutDashboard,
  Zap
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 relative overflow-hidden">
      {/* Dynamic Animated Mesh Gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] h-[700px] w-[700px] rounded-full bg-indigo-600/10 blur-[120px] animate-[float_20s_infinite_ease-in-out]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[700px] w-[700px] rounded-full bg-purple-600/10 blur-[120px] animate-[float_25s_infinite_ease-in-out_reverse]" />
        <div className="absolute top-[20%] right-[10%] h-[500px] w-[500px] rounded-full bg-blue-600/5 blur-[100px] animate-[float_30s_infinite_linear]" />
        <div className="absolute bottom-[20%] left-[10%] h-[600px] w-[600px] rounded-full bg-fuchsia-600/5 blur-[110px] animate-[float_22s_infinite_ease-in-out_alternate]" />
      </div>

      {/* Grid Overlay for texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] brightness-100 contrast-150 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(10vw, 15vh) scale(1.1); }
          66% { transform: translate(-15vw, 10vh) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.15; }
        }
      `}</style>
      
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* Left Side: Branding */}
        <div className="hidden lg:flex flex-col space-y-8 text-white">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-3xl bg-indigo-600 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter">Activity<span className="text-indigo-400">Flow</span></h1>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-5xl font-black leading-[1.1] tracking-tight">
              ยกระดับกิจกรรมนักศึกษา <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                สู่ระบบดิจิทัลเต็มรูปแบบ
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed max-w-md">
              ครอบคลุมทุกขั้นตอน ตั้งแต่ <span className="text-white font-bold">"การขออนุมัติ"</span> <br />
              จนถึง <span className="text-white font-bold">"การรับคะแนนกิจกรรม"</span> ครบจบในที่เดียว
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 pt-8">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <Zap className="h-6 w-6 text-indigo-400 mb-2" />
              <p className="text-sm font-bold text-white">รวดเร็ว</p>
              <p className="text-xs text-slate-500">อนุมัติออนไลน์ 100%</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <ShieldCheck className="h-6 w-6 text-emerald-400 mb-2" />
              <p className="text-sm font-bold text-white">แม่นยำ</p>
              <p className="text-xs text-slate-500">คำนวณคะแนนอัตโนมัติ</p>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="rounded-[40px] border border-white/10 bg-slate-900/50 p-10 shadow-2xl backdrop-blur-2xl">
            <div className="mb-10 text-center lg:text-left">
              <h3 className="text-3xl font-black text-white tracking-tight">เข้าสู่ระบบ</h3>
              <p className="mt-2 text-slate-400 font-medium">กรุณาใช้บัญชีมหาวิทยาลัยเพื่อเริ่มต้น</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center space-x-2 rounded-2xl bg-rose-500/10 p-4 text-sm font-bold text-rose-400 border border-rose-500/20">
                  <LayoutDashboard className="h-4 w-4" />
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl bg-slate-800/50 border border-slate-700 px-14 py-4 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                  <a href="#" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">ลืมรหัสผ่าน?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-2xl bg-slate-800/50 border border-slate-700 px-14 py-4 text-white outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    placeholder="••••••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full overflow-hidden rounded-2xl bg-indigo-600 px-8 py-4 text-lg font-black text-white shadow-xl shadow-indigo-600/20 transition-all hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
                  {!isLoading && <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-slate-500">
                ยังไม่มีบัญชี? <a href="#" className="font-black text-indigo-400 hover:text-indigo-300">ติดต่อกองพัฒนานักศึกษา</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { UserPlus, Mail, Shield, Loader2, X, Users, FileText, Award, Sparkles } from "lucide-react";

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: () => void;
}

export function InviteModal({ isOpen, onClose, projectId, onSuccess }: InviteModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to invite member");

      setEmail("");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-all"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <UserPlus className="mr-3 h-6 w-6 text-indigo-600" />
            เชิญสมาชิกเข้าร่วมโครงการ
          </h2>
          <p className="text-slate-500 font-medium pt-2 text-sm">
            ค้นหานักศึกษาด้วยอีเมลมหาวิทยาลัยเพื่อเชิญเข้าร่วมทีมโครงการนี้
          </p>
        </div>

        <form onSubmit={handleInvite} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">อีเมลนักศึกษา</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="email"
                placeholder="example@student.university.ac.th"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">บทบาทในโครงการ</label>
            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1 pr-2 custom-scrollbar">
              {[
                { id: "member", label: "สมาชิกทั่วไป", icon: UserPlus, color: "indigo" },
                { id: "co_owner", label: "ผู้ช่วยหัวหน้า", icon: Shield, color: "purple" },
                { id: "president", label: "ประธานโครงการ", icon: Shield, color: "blue" },
                { id: "vp", label: "รองประธาน", icon: Shield, color: "cyan" },
                { id: "secretary", label: "เลขานุการ", icon: FileText, color: "rose" },
                { id: "treasurer", label: "เหรัญญิก", icon: Award, color: "amber" },
                { id: "pr", label: "ประชาสัมพันธ์", icon: Sparkles, color: "fuchsia" },
                { id: "committee", label: "กรรมการ", icon: Users, color: "slate" },
                { id: "operator", label: "ผู้ดำเนินงาน", icon: UserPlus, color: "emerald" },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${
                    role === r.id 
                      ? `border-${r.color}-500 bg-${r.color}-50 text-${r.color}-700` 
                      : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                  }`}
                >
                  <div className={`p-2 rounded-xl mb-1 ${role === r.id ? `bg-${r.color}-100` : "bg-white"}`}>
                    <r.icon className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-black text-center uppercase tracking-tight">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center">
              <div className="h-2 w-2 rounded-full bg-rose-500 mr-2 animate-pulse" />
              {error}
            </div>
          )}

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "ส่งคำเชิญ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

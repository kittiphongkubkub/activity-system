"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { UserPlus, Mail, Shield, Loader2 } from "lucide-react";

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[32px] border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center">
            <UserPlus className="mr-3 h-6 w-6 text-indigo-600" />
            เชิญสมาชิกเข้าร่วมโครงการ
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium pt-2">
            ค้นหานักศึกษาด้วยอีเมลมหาวิทยาลัยเพื่อเชิญเข้าร่วมทีมโครงการนี้
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleInvite} className="space-y-6 py-4">
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
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("member")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  role === "member" 
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700" 
                    : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                }`}
              >
                <div className={`p-2 rounded-xl mb-2 ${role === "member" ? "bg-indigo-100" : "bg-white"}`}>
                  <UserPlus className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold">สมาชิกทั่วไป</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("co_owner")}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                  role === "co_owner" 
                    ? "border-purple-500 bg-purple-50 text-purple-700" 
                    : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                }`}
              >
                <div className={`p-2 rounded-xl mb-2 ${role === "co_owner" ? "bg-purple-100" : "bg-white"}`}>
                  <Shield className="h-5 w-5" />
                </div>
                <span className="text-sm font-bold">ผู้ช่วยหัวหน้า</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center">
              <div className="h-2 w-2 rounded-full bg-rose-500 mr-2 animate-pulse" />
              {error}
            </div>
          )}

          <DialogFooter className="pt-4">
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
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

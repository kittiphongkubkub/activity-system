"use client";

import { useState, useEffect } from "react";
import { Mail, Check, X, Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

interface Invitation {
  id: string;
  role: string;
  project: {
    projectName: string;
    owner: {
      fullName: string;
    };
  };
}

export function InvitationList() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const res = await fetch("/api/projects/invitations");
      if (res.ok) {
        const data = await res.json();
        setInvitations(data);
      }
    } catch (err) {
      console.error("Failed to fetch invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (id: string, status: "accepted" | "rejected") => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/projects/invitations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        setInvitations(prev => prev.filter(inv => inv.id !== id));
        router.refresh();
      }
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการตอบรับคำเชิญ");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-slate-200" /></div>;
  if (invitations.length === 0) return null;

  return (
    <div className="space-y-4">
      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-4 flex items-center">
        <UserPlus className="mr-2 h-4 w-4" />
        คำเชิญเข้าร่วมโครงการ ({invitations.length})
      </h4>
      {invitations.map((inv) => (
        <div key={inv.id} className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-900 leading-tight">
                {inv.project.owner.fullName} <span className="text-slate-400 font-bold">เชิญคุณเข้าร่วม</span>
              </p>
              <p className="text-lg font-black text-indigo-600 tracking-tight">{inv.project.projectName}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">บทบาท: {inv.role === 'co_owner' ? 'ผู้ช่วยหัวหน้า' : 'สมาชิก'}</p>
            </div>
          </div>
          
          <div className="mt-4 flex space-x-3">
            <button
              onClick={() => handleResponse(inv.id, "accepted")}
              disabled={!!processingId}
              className="flex-1 bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors flex items-center justify-center"
            >
              {processingId === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <><Check className="mr-2 h-4 w-4" /> ตอบรับ</>
              )}
            </button>
            <button
              onClick={() => handleResponse(inv.id, "rejected")}
              disabled={!!processingId}
              className="flex-1 bg-slate-50 text-slate-400 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-colors flex items-center justify-center"
            >
               {processingId === inv.id ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <><X className="mr-2 h-4 w-4" /> ปฏิเสธ</>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { 
  Users, 
  Shield, 
  MoreVertical, 
  UserMinus, 
  Mail, 
  Clock, 
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { InviteModal } from "./InviteModal";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
  user: {
    fullName: string;
    email: string;
    studentId: string;
  };
}

interface ProjectTeamProps {
  projectId: string;
  members: Member[];
  ownerId: string;
  currentUserId: string;
}

export function ProjectTeam({ projectId, members, ownerId, currentUserId }: ProjectTeamProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [loadingMemberId, setLoadingMemberId] = useState<string | null>(null);
  const router = useRouter();

  const isOwner = ownerId === currentUserId;
  const isCoOwner = members.some(m => m.userId === currentUserId && m.role === "co_owner" && m.status === "accepted");
  const canManage = isOwner || isCoOwner;

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("คุณยืนยันที่จะลบสมาชิกคนนี้ออกจากโครงการใช่หรือไม่?")) return;

    setLoadingMemberId(memberId);
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${memberId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to remove member");
      
      router.refresh();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการลบสมาชิก");
    } finally {
      setLoadingMemberId(null);
    }
  };

  const roleMap: Record<string, string> = {
    president: "ประธานโครงการ",
    vp: "รองประธานโครงการ",
    secretary: "เลขานุการโครงการ",
    treasurer: "เหรัญญิกโครงการ",
    pr: "ประชาสัมพันธ์โครงการ",
    committee: "กรรมการโครงการ",
    operator: "ผู้ดำเนินโครงการ",
    participant: "ผู้เข้าร่วม/ผู้ช่วย",
    co_owner: "ผู้ช่วยหัวหน้าโครงการ (Co-Owner)",
    member: "สมาชิกทั่วไป",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center">
            <Users className="mr-3 h-6 w-6 text-indigo-600" />
            รายชื่อคณะกรรมการ/สมาชิก
          </h3>
          <p className="text-sm text-slate-500 font-medium">จัดการบทบาทและสมาชิกผู้รับผิดชอบโครงการ</p>
        </div>
        
        {canManage && (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-slate-200"
          >
            เพิ่มสมาชิก
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Owner Card (Always First) */}
        {members.find(m => m.userId === ownerId) === undefined && (
          <div className="group relative rounded-3xl border p-5 transition-all hover:shadow-xl bg-white border-indigo-100 ring-1 ring-indigo-50">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-black bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                  👑
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-black text-slate-900">หัวหน้าโครงการ (เจ้าของ)</p>
                    <div className="bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-indigo-100">
                      Owner
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">ผู้สร้างโครงการและผู้รับผิดชอบหลัก</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
              <div className="flex items-center text-[10px] font-black uppercase text-indigo-500 tracking-widest">
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                สิทธิ์จัดการสูงสุด
              </div>
            </div>
          </div>
        )}

        {members.map((member) => (
          <div 
            key={member.id}
            className={`group relative rounded-3xl border p-5 transition-all hover:shadow-xl ${
              member.status === 'pending' ? 'bg-slate-50/50 border-slate-100 border-dashed' : 'bg-white border-slate-100 hover:border-indigo-100'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-lg font-black ${
                  member.role === 'co_owner' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {member.user.fullName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-black text-slate-900">{member.user.fullName}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <div className={cn(
                      "text-[10px] font-black uppercase px-2 py-0.5 rounded-md border",
                      member.role === 'co_owner' ? "bg-purple-50 text-purple-600 border-purple-100" : "bg-slate-50 text-slate-500 border-slate-200"
                    )}>
                      {roleMap[member.role] || member.role}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1.5">{member.user.studentId} • {member.user.email}</p>
                </div>
              </div>

              {canManage && member.userId !== ownerId && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  disabled={loadingMemberId === member.id}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                >
                  <UserMinus className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
              <div className="flex items-center">
                {member.status === 'accepted' ? (
                  <div className="flex items-center text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                    เข้าร่วมแล้ว
                  </div>
                ) : member.status === 'pending' ? (
                  <div className="flex items-center text-[10px] font-black uppercase text-amber-500 tracking-widest">
                    <Clock className="mr-1.5 h-3.5 w-3.5" />
                    รอการตอบรับ
                  </div>
                ) : (
                  <div className="flex items-center text-[10px] font-black uppercase text-rose-500 tracking-widest">
                    <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
                    ปฏิเสธคำเชิญ
                  </div>
                )}
              </div>
              
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                {member.status === 'accepted' ? 'เข้าร่วมเมื่อ' : 'เชิญเมื่อ'} {new Date(member.joinedAt).toLocaleDateString("th-TH")}
              </p>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
            <Users className="h-10 w-10 text-slate-200 mb-3" />
            <p className="text-slate-400 font-bold">ยังไม่มีสมาชิกเพิ่มเติมในโครงการนี้</p>
          </div>
        )}
      </div>

      <InviteModal 
        isOpen={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)} 
        projectId={projectId}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

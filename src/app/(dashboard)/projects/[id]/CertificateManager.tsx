"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Loader2, CheckCircle, Package, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificateManagerProps {
  projectId: string;
  currentStatus: string;
}

export default function CertificateManager({ projectId, currentStatus }: CertificateManagerProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const updateStatus = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/certificate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const statuses = [
    { value: "none", label: "ยังไม่เริ่ม", icon: Award, color: "text-slate-400" },
    { value: "processing", label: "กำลังจัดทำ", icon: Loader2, color: "text-amber-500" },
    { value: "ready", label: "พร้อมรับ", icon: Package, color: "text-emerald-500" },
    { value: "collected", label: "รับแล้ว", icon: CheckCircle, color: "text-blue-500" },
  ];

  return (
    <section className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center">
        <Award className="mr-2 h-4 w-4 text-indigo-600" />
        จัดการเกียรติบัตร (สำหรับเจ้าหน้าที่)
      </h3>
      
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {statuses.map((item) => {
          const Icon = item.icon;
          const isActive = status === item.value;
          
          return (
            <button
              key={item.value}
              disabled={loading}
              onClick={() => updateStatus(item.value)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                isActive 
                  ? "bg-indigo-50 border-indigo-200 shadow-sm" 
                  : "bg-white border-slate-100 hover:border-slate-200",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 mb-2",
                isActive ? "text-indigo-600" : item.color,
                item.value === "processing" && isActive && "animate-spin"
              )} />
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                isActive ? "text-indigo-700" : "text-slate-500"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
      
      {loading && (
        <p className="mt-3 text-[10px] text-center text-slate-400 italic">กำลังบันทึกข้อมูล...</p>
      )}
    </section>
  );
}

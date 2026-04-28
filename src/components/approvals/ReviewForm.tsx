"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, AlertCircle, Loader2, Send } from "lucide-react";

export default function ReviewForm({ 
  projectId, 
  stepId, 
  stepName 
}: { 
  projectId: string; 
  stepId: string;
  stepName: string;
}) {
  const [decision, setDecision] = useState<"approve" | "reject" | "revision" | "">("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!decision) return alert("กรุณาเลือกผลการพิจารณา");

    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stepId, decision, comments }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.error || "บันทึกการพิจารณาไม่สำเร็จ");
      }

      router.push("/approvals");
      router.refresh();
    } catch (err: any) {
      alert(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-xl border-2 border-indigo-100 bg-indigo-50/30 p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-bold text-slate-800">
        พิจารณาโครงการ (ขั้นตอน: {stepName})
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setDecision("approve")}
            className={`flex items-center justify-center rounded-lg border-2 p-4 transition-all ${
              decision === "approve" 
                ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200"
            }`}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" />
            <span className="font-bold">อนุมัติ</span>
          </button>
          
          <button
            type="button"
            onClick={() => setDecision("revision")}
            className={`flex items-center justify-center rounded-lg border-2 p-4 transition-all ${
              decision === "revision" 
                ? "border-orange-500 bg-orange-50 text-orange-700" 
                : "border-slate-200 bg-white text-slate-600 hover:border-orange-200"
            }`}
          >
            <AlertCircle className="mr-2 h-5 w-5" />
            <span className="font-bold">ส่งกลับแก้ไข</span>
          </button>

          <button
            type="button"
            onClick={() => setDecision("reject")}
            className={`flex items-center justify-center rounded-lg border-2 p-4 transition-all ${
              decision === "reject" 
                ? "border-rose-500 bg-rose-50 text-rose-700" 
                : "border-slate-200 bg-white text-slate-600 hover:border-rose-200"
            }`}
          >
            <XCircle className="mr-2 h-5 w-5" />
            <span className="font-bold">ปฏิเสธ</span>
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            ความเห็นเพิ่มเติม (ไม่บังคับ)
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-indigo-500"
            placeholder="ระบุเหตุผลในการอนุมัติหรือส่งกลับแก้ไข..."
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !decision}
            className="flex items-center rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            ยืนยันผลการพิจารณา
          </button>
        </div>
      </form>
    </section>
  );
}

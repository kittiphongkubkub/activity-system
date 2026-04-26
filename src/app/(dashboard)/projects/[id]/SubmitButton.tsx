"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2 } from "lucide-react";

export default function SubmitButton({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleOpenModal = () => {
    if (confirm("คุณยืนยันที่จะส่งโครงการนี้เพื่อขออนุมัติใช่หรือไม่? (เมื่อส่งแล้วจะไม่สามารถแก้ไขได้จนกว่าจะได้รับคำสั่งให้แก้ไข)")) {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/submit`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("ส่งโครงการไม่สำเร็จ");

      router.refresh();
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการส่งโครงการ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleOpenModal}
      disabled={loading}
      className="flex items-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Send className="mr-2 h-4 w-4" />
      )}
      ส่งขออนุมัติ
    </button>
  );
}

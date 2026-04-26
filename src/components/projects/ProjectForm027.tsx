"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { project027Schema, Project027Input } from "@/lib/validations/project027";
import { Send, Loader2, AlertCircle, ArrowRight, Upload, X, FileText } from "lucide-react";

export default function ProjectForm027({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Project027Input>({
    resolver: zodResolver(project027Schema) as any,
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setAttachments([...attachments, {
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          fileSize: data.fileSize,
          mimeType: data.mimeType
        }]);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: Project027Input) => {
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${projectId}/summary`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, attachments }),
      });

      if (!response.ok) throw new Error("ส่งสรุปผลไม่สำเร็จ");

      router.push(`/projects/${projectId}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-12">
      {error && (
        <div className="flex items-center rounded-lg bg-red-50 p-4 text-red-700">
          <AlertCircle className="mr-2 h-5 w-5" />
          {error}
        </div>
      )}

      {/* Actual Logistics */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-slate-800 border-b pb-2">ผลการดำเนินงานจริง</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">วันที่เริ่มจริง</label>
            <input
              type="date"
              {...register("actualStartDate")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
            {errors.actualStartDate && <p className="mt-1 text-xs text-red-500">{errors.actualStartDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">วันที่สิ้นสุดจริง</label>
            <input
              type="date"
              {...register("actualEndDate")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
            {errors.actualEndDate && <p className="mt-1 text-xs text-red-500">{errors.actualEndDate.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">สถานที่จัดจริง</label>
            <input
              {...register("actualLocation")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
            {errors.actualLocation && <p className="mt-1 text-xs text-red-500">{errors.actualLocation.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">จำนวนผู้เข้าร่วมจริง</label>
            <input
              type="number"
              {...register("actualParticipants")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
            {errors.actualParticipants && <p className="mt-1 text-xs text-red-500">{errors.actualParticipants.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">งบประมาณที่ใช้จริง (บาท)</label>
            <input
              type="number"
              {...register("budgetUsed")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
            {errors.budgetUsed && <p className="mt-1 text-xs text-red-500">{errors.budgetUsed.message}</p>}
          </div>
        </div>
      </section>

      {/* Outcome & Feedback */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-slate-800 border-b pb-2">เนื้อหาสรุปผล</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">สรุปผลการดำเนินงาน</label>
            <textarea
              {...register("outcomeSummary")}
              rows={5}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
              placeholder="อธิบายว่าโครงการสำเร็จตามวัตถุประสงค์อย่างไร..."
            />
            {errors.outcomeSummary && <p className="mt-1 text-xs text-red-500">{errors.outcomeSummary.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">ปัญหาและอุปสรรค</label>
            <textarea
              {...register("problemsFaced")}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">ข้อเสนอแนะสำหรับการจัดครั้งถัดไป</label>
            <textarea
              {...register("suggestions")}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* Attachments */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-slate-800 border-b pb-2">เอกสารแนบสรุปผล</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg border bg-slate-50">
                <div className="flex items-center space-x-3 truncate">
                  <FileText className="h-5 w-5 text-indigo-500" />
                  <span className="text-sm font-medium truncate">{file.fileName}</span>
                </div>
                <button 
                  type="button"
                  onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                  className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>
            ))}
          </div>

          <div className="relative">
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              id="summary-file-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="summary-file-upload"
              className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                isUploading ? 'bg-slate-50 border-slate-300' : 'hover:bg-slate-50 border-slate-300 hover:border-indigo-400'
              }`}
            >
              {isUploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                  <p className="mt-2 text-sm font-medium text-slate-500">กำลังอัพโหลด...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-sm font-medium text-slate-600">คลิกเพื่ออัพโหลดรูปภาพหรือเอกสารสรุปโครงการ</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, Word, Image (สูงสุด 10MB)</p>
                </div>
              )}
            </label>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg px-6 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
        >
          ยกเลิก
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 shadow-lg disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Send className="mr-2 h-5 w-5" />
          )}
          ส่งสรุปผล (027)
        </button>
      </div>
    </form>
  );
}

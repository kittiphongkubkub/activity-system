"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { project025Schema, Project025Input } from "@/lib/validations/project025";
import { Save, Send, Loader2, AlertCircle, Upload, X, FileText } from "lucide-react";

const ProjectForm025 = ({ initialData }: { initialData?: any }) => {
  const router = useRouter();
  const [advisors, setAdvisors] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Project025Input>({
    resolver: zodResolver(project025Schema) as any,
    defaultValues: initialData || {
      academicYear: "2567",
      semester: 1,
      expectedParticipants: 0,
      budgetRequested: 0,
    },
  });

  useEffect(() => {
    fetch("/api/users/advisors")
      .then((res) => res.json())
      .then((data) => setAdvisors(data))
      .catch(err => console.error("Failed to load advisors", err));
  }, []);

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

  const onSubmit = async (data: Project025Input) => {
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/projects", {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, attachments }),
      });

      if (!response.ok) throw new Error("บันทึกข้อมูลไม่สำเร็จ");

      router.push("/projects");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-12">
      {/* Download Template Alert */}
      <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
        <div className="flex items-center">
          <div className="rounded-lg bg-blue-500 p-2 text-white mr-4 shadow-sm">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900">แบบฟอร์มมาตรฐานจากทางมหาวิทยาลัย</h4>
            <p className="text-xs text-blue-700">ดาวน์โหลดแบบฟอร์ม มฉก.วท.025 เพื่อเตรียมข้อมูลประกอบการสร้างโครงการ</p>
          </div>
        </div>
        <a 
          href="/forms/form-025.docx" 
          download 
          className="flex items-center rounded-lg bg-white px-4 py-2 text-sm font-bold text-blue-600 shadow-sm border border-blue-200 hover:bg-blue-50 transition-colors"
        >
          <Upload className="mr-2 h-4 w-4 rotate-180" />
          ดาวน์โหลดไฟล์ .docx
        </a>
      </div>

      {error && (
        <div className="flex items-center rounded-lg bg-red-50 p-4 text-red-700">
          <AlertCircle className="mr-2 h-5 w-5" />
          {error}
        </div>
      )}

      {/* Basic Info */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-slate-800 border-b pb-2">ข้อมูลทั่วไป</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">ชื่อโครงการ</label>
            <input
              {...register("projectName")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
              placeholder="ระบุชื่อโครงการเต็ม"
            />
            {errors.projectName && <p className="mt-1 text-xs text-red-500">{errors.projectName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">ประเภทโครงการ</label>
            <select
              {...register("projectType")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            >
              <option value="">เลือกประเภท...</option>
              <option value="วิชาการ">วิชาการ</option>
              <option value="บริการสังคม">บริการสังคม</option>
              <option value="กีฬา">กีฬา</option>
              <option value="ทำนุบำรุงศิลปวัฒนธรรม">ทำนุบำรุงศิลปวัฒนธรรม</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
            {errors.projectType && <p className="mt-1 text-xs text-red-500">{errors.projectType.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">อาจารย์ที่ปรึกษา</label>
            <select
              {...register("advisorId")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            >
              <option value="">เลือกอาจารย์...</option>
              {advisors.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.fullName} ({advisor.department})
                </option>
              ))}
            </select>
            {errors.advisorId && <p className="mt-1 text-xs text-red-500">{errors.advisorId.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">ปีการศึกษา</label>
            <input
              {...register("academicYear")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
              placeholder="เช่น 2567"
            />
            {errors.academicYear && <p className="mt-1 text-xs text-red-500">{errors.academicYear.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">ภาคการศึกษา</label>
            <select
              {...register("semester")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>ฤดูร้อน</option>
            </select>
            {errors.semester && <p className="mt-1 text-xs text-red-500">{errors.semester.message}</p>}
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-sm font-medium text-slate-700">ประเภทองค์กร</label>
              <select
                {...register("organizationType")}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
              >
                <option value="">เลือกประเภท...</option>
                <option value="union">สโมสรนักศึกษา</option>
                <option value="club">ชมรม/คณะวิชา</option>
                <option value="working_group">คณะทำงานโครงการ</option>
              </select>
              {errors.organizationType && <p className="mt-1 text-xs text-red-500">{errors.organizationType.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">บทบาทของคุณ</label>
              <select
                {...register("studentRole")}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
              >
                <option value="">เลือกบทบาท...</option>
                <option value="president">ประธานโครงการ</option>
                <option value="vp">รองประธานโครงการ</option>
                <option value="committee">กรรมการโครงการ</option>
                <option value="operator">ผู้ดำเนินโครงการ</option>
                <option value="participant">ผู้เข้าร่วม/ผู้ฟัง</option>
              </select>
              {errors.studentRole && <p className="mt-1 text-xs text-red-500">{errors.studentRole.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">ระดับผลกระทบ</label>
              <select
                {...register("impactLevel")}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
              >
                <option value="">เลือกระดับ...</option>
                <option value="national">ระดับชาติ</option>
                <option value="community">ระดับชุมชน</option>
                <option value="university">ระดับมหาวิทยาลัย</option>
                <option value="faculty">ระดับวิชาชีพ/คณะ</option>
                <option value="personal">ระดับส่วนบุคคล</option>
              </select>
              {errors.impactLevel && <p className="mt-1 text-xs text-red-500">{errors.impactLevel.message}</p>}
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-slate-800 border-b pb-2">รายละเอียดโครงการ</h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">หลักการและเหตุผล / รายละเอียด</label>
            <textarea
              {...register("description")}
              rows={4}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">วัตถุประสงค์</label>
            <textarea
              {...register("objectives")}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
            {errors.objectives && <p className="mt-1 text-xs text-red-500">{errors.objectives.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">ผลที่คาดว่าจะได้รับ</label>
            <textarea
              {...register("expectedOutcome")}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
            {errors.expectedOutcome && <p className="mt-1 text-xs text-red-500">{errors.expectedOutcome.message}</p>}
          </div>
        </div>
      </section>

      {/* Logistics & Budget */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-slate-800 border-b pb-2">วัน เวลา สถานที่ และงบประมาณ</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">วันที่เริ่ม</label>
            <input
              type="date"
              {...register("plannedStartDate")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
            {errors.plannedStartDate && <p className="mt-1 text-xs text-red-500">{errors.plannedStartDate.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">วันที่สิ้นสุด</label>
            <input
              type="date"
              {...register("plannedEndDate")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
            {errors.plannedEndDate && <p className="mt-1 text-xs text-red-500">{errors.plannedEndDate.message}</p>}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700">สถานที่</label>
            <input
              {...register("location")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
            {errors.location && <p className="mt-1 text-xs text-red-500">{errors.location.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">จำนวนผู้เข้าร่วม (โดยประมาณ)</label>
            <input
              type="number"
              {...register("expectedParticipants")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
            {errors.expectedParticipants && <p className="mt-1 text-xs text-red-500">{errors.expectedParticipants.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">งบประมาณที่ขอ (บาท)</label>
            <input
              type="number"
              {...register("budgetRequested")}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-indigo-500"
            />
            {errors.budgetRequested && <p className="mt-1 text-xs text-red-500">{errors.budgetRequested.message}</p>}
          </div>
        </div>
      </section>

      {/* Attachments */}
      <section className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-6 text-lg font-bold text-slate-800 border-b pb-2">เอกสารแนบ</h3>
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
              id="file-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="file-upload"
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
                  <p className="mt-2 text-sm font-medium text-slate-600">คลิกเพื่ออัพโหลดเอกสารแนบ</p>
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
          className="flex items-center rounded-lg bg-slate-800 px-6 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          บันทึกร่าง
        </button>
      </div>
    </form>
  );
};

export default ProjectForm025;

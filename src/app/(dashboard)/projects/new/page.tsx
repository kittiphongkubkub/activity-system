import ProjectForm025 from "@/components/projects/ProjectForm025";

export default function NewProjectPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">ขออนุมัติจัดโครงการ (แบบ 025)</h1>
        <p className="text-slate-500">กรอกรายละเอียดเพื่อขออนุมัติดำเนินกิจกรรมนักศึกษา</p>
      </div>

      <ProjectForm025 />
    </div>
  );
}

import { cn } from "@/lib/utils";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "ร่าง", color: "text-slate-600", bg: "bg-slate-100" },
  submitted: { label: "ส่งแล้ว", color: "text-blue-600", bg: "bg-blue-100" },
  under_review: { label: "กำลังพิจารณา", color: "text-indigo-600", bg: "bg-indigo-100" },
  revision_required: { label: "ต้องแก้ไข", color: "text-orange-600", bg: "bg-orange-100" },
  approved: { label: "อนุมัติแล้ว", color: "text-emerald-600", bg: "bg-emerald-100" },
  rejected: { label: "ปฏิเสธ", color: "text-rose-600", bg: "bg-rose-100" },
  summary_submitted: { label: "ส่งสรุปผลแล้ว", color: "text-purple-600", bg: "bg-purple-100" },
  completed: { label: "ปิดโครงการ", color: "text-green-600", bg: "bg-green-100" },
};

export const StatusBadge = ({ status }: { status: string }) => {
  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.bg,
        config.color
      )}
    >
      {config.label}
    </span>
  );
};

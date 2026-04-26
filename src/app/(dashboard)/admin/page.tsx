import prisma from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Users, FileCheck, Award, TrendingUp, CheckCircle, Clock, XCircle } from "lucide-react";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = (session.user as any).role;
  if (role !== "admin") redirect("/");

  // Fetch Stats
  const [userCount, projectCount, completedCount, pendingCount] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.project.count({ where: { status: "completed" } }),
    prisma.project.count({ where: { status: { in: ["submitted", "under_review", "summary_submitted", "summary_under_review"] } } }),
  ]);

  const stats = [
    { label: "ผู้ใช้ทั้งหมด", value: userCount, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "โครงการทั้งหมด", value: projectCount, icon: FileCheck, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "ปิดโครงการแล้ว", value: completedCount, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "รอการพิจารณา", value: pendingCount, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">แผงควบคุมผู้ดูแลระบบ (Admin)</h1>
        <p className="text-slate-500">ภาพรวมการทำงานของระบบและสถิติโครงการทั้งหมด</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className={`rounded-lg p-3 ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Recent Activity or detailed stats could go here */}
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-bold text-slate-800">กิจกรรมล่าสุด</h3>
          <p className="text-sm text-slate-400 italic">ฟังก์ชันติดตามความเคลื่อนไหวล่าสุดกำลังอยู่ระหว่างการพัฒนา...</p>
        </section>

        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-bold text-slate-800">สัดส่วนประเภทกิจกรรม</h3>
          <p className="text-sm text-slate-400 italic">กราฟสถิติกำลังอยู่ระหว่างการพัฒนา...</p>
        </section>
      </div>
    </div>
  );
}

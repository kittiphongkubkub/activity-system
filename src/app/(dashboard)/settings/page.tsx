import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  User, 
  Bell, 
  Key, 
  ShieldCheck
} from "lucide-react";
import { redirect } from "next/navigation";

import SettingsForm from "@/components/settings/SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as any;

  return (
    <div className="mx-auto max-w-5xl space-y-10 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">ตั้งค่าบัญชีผู้ใช้</h1>
          <p className="text-slate-500 mt-1">จัดการความปลอดภัย การแจ้งเตือน และสิทธิ์การใช้งานของคุณ</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-4">
        {/* Sidebar Settings Navigation (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-1">
            <a href="#profile" className="flex w-full items-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition-all">
              <User className="mr-3 h-4 w-4" />
              ข้อมูลส่วนตัว
            </a>
            <a href="#password" className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all">
              <Key className="mr-3 h-4 w-4" />
              รหัสผ่าน
            </a>
            <a href="#notifications" className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all">
              <Bell className="mr-3 h-4 w-4" />
              การแจ้งเตือน
            </a>
            <a href="#access" className="flex w-full items-center rounded-xl px-4 py-3 text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm transition-all">
              <ShieldCheck className="mr-3 h-4 w-4" />
              สิทธิ์การเข้าถึง
            </a>
          </div>
        </div>

        <SettingsForm user={user} />
      </div>
    </div>
  );
}

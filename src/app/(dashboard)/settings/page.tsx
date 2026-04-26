import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { 
  User, 
  Shield, 
  Mail, 
  Lock, 
  Building, 
  GraduationCap, 
  Bell, 
  Key, 
  Smartphone,
  Eye,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import { redirect } from "next/navigation";

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

        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-12">
          
          {/* 1. Profile Section */}
          <section id="profile" className="scroll-mt-24 space-y-6">
            <div className="flex items-center space-x-2 text-indigo-600">
              <User className="h-5 w-5" />
              <h2 className="text-xl font-black uppercase tracking-wider">ข้อมูลส่วนตัว</h2>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-6 sm:space-y-0 sm:space-x-8 pb-8 border-b border-slate-50">
                <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl ring-4 ring-white">
                  {user.name?.[0]}
                </div>
                <div className="text-center sm:text-left space-y-2">
                  <h4 className="text-3xl font-black text-slate-900">{user.name}</h4>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    <span className="rounded-full bg-indigo-50 px-4 py-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest border border-indigo-100">
                      {user.role}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-4 py-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest border border-emerald-100">
                      Active Account
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-2">
                {[
                  { label: "อีเมลติดต่อ", value: user.email, icon: Mail },
                  { label: "รหัสนักศึกษา / ไอดี", value: user.studentId || "N/A", icon: GraduationCap },
                  { label: "คณะ / หน่วยงาน", value: user.faculty || "ไม่ได้ระบุ", icon: Building },
                  { label: "สาขาวิชา", value: user.department || "ไม่ได้ระบุ", icon: Building },
                ].map((field) => (
                  <div key={field.label} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                      <field.icon className="mr-2 h-3.5 w-3.5 text-indigo-500" /> {field.label}
                    </label>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-3 text-sm font-bold text-slate-700">
                      {field.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 2. Password Section */}
          <section id="password" className="scroll-mt-24 space-y-6">
            <div className="flex items-center space-x-2 text-indigo-600">
              <Key className="h-5 w-5" />
              <h2 className="text-xl font-black uppercase tracking-wider">เปลี่ยนรหัสผ่าน</h2>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">รหัสผ่านปัจจุบัน</label>
                  <div className="relative">
                    <input type="password" placeholder="••••••••" className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all" />
                    <Eye className="absolute right-5 top-3.5 h-4 w-4 text-slate-400 cursor-pointer" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">รหัสผ่านใหม่</label>
                    <input type="password" placeholder="อย่างน้อย 8 ตัวอักษร" className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ยืนยันรหัสผ่านใหม่</label>
                    <input type="password" placeholder="กรอกรหัสผ่านใหม่อีกครั้ง" className="w-full rounded-2xl border border-slate-200 px-5 py-3 text-sm focus:border-indigo-500 outline-none" />
                  </div>
                </div>
              </div>
              <button className="rounded-2xl bg-indigo-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all">
                อัปเดตรหัสผ่าน
              </button>
            </div>
          </section>

          {/* 3. Notifications Section */}
          <section id="notifications" className="scroll-mt-24 space-y-6">
            <div className="flex items-center space-x-2 text-indigo-600">
              <Bell className="h-5 w-5" />
              <h2 className="text-xl font-black uppercase tracking-wider">การแจ้งเตือน</h2>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm space-y-4">
              {[
                { title: "อีเมลแจ้งเตือนสถานะ", desc: "รับอีเมลเมื่อมีการเปลี่ยนแปลงสถานะโครงการ", enabled: true },
                { title: "แจ้งเตือนการอนุมัติ", desc: "รับการแจ้งเตือนในระบบเมื่ออาจารย์อนุมัติงาน", enabled: true },
                { title: "คะแนนกิจกรรมสะสม", desc: "แจ้งเตือนเมื่อคุณได้รับคะแนนกิจกรรมใหม่", enabled: true },
                { title: "ข่าวสารและประกาศ", desc: "รับข้อมูลข่าวสารจากกองพัฒนานักศึกษา", enabled: false },
              ].map((item) => (
                <div key={item.title} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/30">
                  <div>
                    <p className="text-sm font-black text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <div className={`h-6 w-11 rounded-full p-1 cursor-pointer transition-colors ${item.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}>
                    <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Access Rights Section */}
          <section id="access" className="scroll-mt-24 space-y-6">
            <div className="flex items-center space-x-2 text-indigo-600">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="text-xl font-black uppercase tracking-wider">สิทธิ์การเข้าถึง</h2>
            </div>
            <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm space-y-6">
              <div className="flex items-center space-x-4 p-5 rounded-2xl bg-indigo-50 border border-indigo-100">
                <div className="rounded-xl bg-white p-3 shadow-sm">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 tracking-tight">คุณกำลังใช้งานในสิทธิ์ระดับ: <span className="text-indigo-600 uppercase">{user.role}</span></p>
                  <p className="text-xs text-slate-500">สิทธิ์ของคุณถูกกำหนดโดยระบบตามตำแหน่งงานหรือสถานะนักศึกษา</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "สร้างและส่งโครงการ (025)",
                  "ติดตามสถานะโครงการแบบ Real-time",
                  "ยื่นสรุปโครงการ (027)",
                  "ดูประวัติคะแนนกิจกรรม",
                  user.role !== 'student' ? "อนุมัติโครงการที่ได้รับมอบหมาย" : null,
                  user.role !== 'student' ? "เขียนความเห็นและสั่งแก้ไขโครงการ" : null,
                ].filter(Boolean).map((permission) => (
                  <div key={permission} className="flex items-center space-x-3 text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm font-medium">{permission}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

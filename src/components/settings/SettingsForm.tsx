"use client";

import { useState } from "react";
import { 
  User, 
  Mail, 
  Building, 
  GraduationCap, 
  Bell, 
  Key, 
  Eye, 
  EyeOff,
  CheckCircle2,
  Shield,
  ShieldCheck
} from "lucide-react";

interface SettingsFormProps {
  user: {
    name: string;
    email: string;
    role: string;
    studentId?: string;
    faculty?: string;
    department?: string;
  };
}

export default function SettingsForm({ user }: SettingsFormProps) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "รหัสผ่านใหม่ไม่ตรงกัน" });
      return;
    }
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร" });
      return;
    }

    setIsChangingPassword(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "เปลี่ยนรหัสผ่านสำเร็จแล้ว" });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage({ type: "error", text: data.error || "เกิดข้อผิดพลาด" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const [notifications, setNotifications] = useState([
    { id: 'email', title: "อีเมลแจ้งเตือนสถานะ", desc: "รับอีเมลเมื่อมีการเปลี่ยนแปลงสถานะโครงการ", enabled: true },
    { id: 'approval', title: "แจ้งเตือนการอนุมัติ", desc: "รับการแจ้งเตือนในระบบเมื่ออาจารย์อนุมัติงาน", enabled: true },
    { id: 'score', title: "คะแนนกิจกรรมสะสม", desc: "แจ้งเตือนเมื่อคุณได้รับคะแนนกิจกรรมใหม่", enabled: true },
    { id: 'news', title: "ข่าวสารและประกาศ", desc: "รับข้อมูลข่าวสารจากกองพัฒนานักศึกษา", enabled: false },
  ]);

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(item => 
      item.id === id ? { ...item, enabled: !item.enabled } : item
    ));
  };

  return (
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
        
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
          <form onSubmit={handlePasswordChange} className="space-y-6">
            {message.text && (
              <div className={`p-4 rounded-xl text-sm font-bold flex items-center ${
                message.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
              }`}>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {message.text}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รหัสผ่านปัจจุบัน</label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">รหัสผ่านใหม่</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ยืนยันรหัสผ่านใหม่</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all pr-12"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="rounded-2xl bg-indigo-600 px-8 py-3 text-sm font-black text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {isChangingPassword ? "กำลังประมวลผล..." : "อัปเดตรหัสผ่าน"}
            </button>
          </form>
        </div>
      </section>

      {/* 3. Notifications Section */}
      <section id="notifications" className="scroll-mt-24 space-y-6">
        <div className="flex items-center space-x-2 text-indigo-600">
          <Bell className="h-5 w-5" />
          <h2 className="text-xl font-black uppercase tracking-wider">การแจ้งเตือน</h2>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm space-y-4">
          {notifications.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 bg-slate-50/30">
              <div>
                <p className="text-sm font-black text-slate-800">{item.title}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
              <button 
                type="button"
                onClick={() => toggleNotification(item.id)}
                className={`h-6 w-11 rounded-full p-1 transition-colors ${item.enabled ? 'bg-indigo-600' : 'bg-slate-200'}`}
              >
                <div className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${item.enabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
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
  );
}

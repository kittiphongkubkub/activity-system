"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Award, 
  Settings, 
  Users,
  LogOut,
  ShieldCheck,
  Bell,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession, signOut } from "next-auth/react";

const Sidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = (require("react").useState)(0);
  const role = (session?.user as any)?.role;

  (require("react").useEffect)(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/notifications/unread-count");
        const data = await res.json();
        setUnreadCount(data.count);
      } catch (err) {
        console.error(err);
      }
    };

    if (session) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [session]);

  const routes = [
    {
      label: "แผงควบคุม",
      icon: LayoutDashboard,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "จัดการระบบ (Admin)",
      icon: ShieldCheck,
      href: "/admin",
      active: pathname === "/admin",
      show: role === "admin",
    },
    {
      label: "โครงการของฉัน",
      icon: FileText,
      href: "/projects",
      active: pathname.startsWith("/projects"),
      show: role === "student" || role === "admin",
    },
    {
      label: "การอนุมัติ",
      icon: CheckSquare,
      href: "/approvals",
      active: pathname.startsWith("/approvals"),
      show: role !== "student",
    },
    {
      label: "คะแนนกิจกรรม",
      icon: Award,
      href: "/activity-scores",
      active: pathname.startsWith("/activity-scores"),
    },
    {
      label: "การแจ้งเตือน",
      icon: Bell,
      href: "/notifications",
      active: pathname.startsWith("/notifications"),
    },
    {
      label: "จัดการผู้ใช้งาน",
      icon: Users,
      href: "/admin/users",
      active: pathname.startsWith("/admin/users"),
      show: role === "admin",
    },
    {
      label: "ตั้งค่า",
      icon: Settings,
      href: "/settings",
      active: pathname.startsWith("/settings"),
    },
  ];

  return (
    <div className="flex h-full w-full flex-col bg-slate-950 text-white shadow-2xl relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-indigo-600/10 blur-3xl" />
      <div className="absolute top-1/2 -right-32 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl" />
      
      <div className="flex h-24 items-center px-8 border-b border-white/5 relative z-10">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-indigo-500/20 group-hover:rotate-12 transition-transform duration-300">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tight text-white leading-none">Activity<span className="text-indigo-400">Flow</span></h1>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Digital System</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto px-4 py-8 relative z-10">
        <div className="space-y-2">
          {routes.map((route) => (
            (route.show !== false) && (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "group flex items-center rounded-2xl px-5 py-3.5 text-sm font-bold transition-all duration-300 relative overflow-hidden",
                  route.active 
                    ? "bg-white/10 text-white shadow-sm ring-1 ring-white/10" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                {route.active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                )}
                <route.icon className={cn(
                  "mr-4 h-5 w-5 transition-all duration-300",
                  route.active ? "text-indigo-400 scale-110" : "text-slate-500 group-hover:text-indigo-400 group-hover:scale-110"
                )} />
                {route.label}
                {route.label === "การแจ้งเตือน" && unreadCount > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg shadow-rose-500/20 animate-bounce">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                {route.active && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                )}
              </Link>
            )
          ))}
        </div>
      </div>

      <div className="mt-auto border-t border-white/5 p-6 relative z-10 bg-slate-950/50 backdrop-blur-sm">
        <div className="mb-6 rounded-2xl bg-indigo-600/10 p-4 border border-indigo-500/20">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Status</p>
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
            <p className="text-xs font-bold text-slate-300">ระบบทำงานปกติ</p>
          </div>
        </div>
        
        <button
          onClick={() => signOut()}
          className="group flex w-full items-center rounded-2xl px-5 py-4 text-sm font-bold text-slate-400 transition-all duration-300 hover:bg-rose-500/10 hover:text-rose-500"
        >
          <div className="mr-4 rounded-lg bg-slate-900 p-2 group-hover:bg-rose-500/20 transition-colors">
            <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </div>
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  Calendar, 
  Info, 
  Award, 
  FileText, 
  ChevronRight,
  ExternalLink,
  Settings
} from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: any;
  projectId: string | null;
}

export const NotificationList = ({ initialNotifications }: { initialNotifications: Notification[] }) => {
  const [notifications, setNotifications] = useState(initialNotifications);
  const router = useRouter();

  const markAsRead = async (id?: string, all?: boolean) => {
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, all }),
      });

      if (res.ok) {
        if (all) {
          setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } else {
          setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        }
        // router.refresh(); // Removed to prevent unnecessary full-page re-renders
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "score_awarded": return { icon: Award, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" };
      case "status_change": return { icon: FileText, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" };
      case "system": return { icon: Settings, color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-100" };
      default: return { icon: Info, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" };
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">การแจ้งเตือน</h1>
          <p className="text-slate-500 mt-1">อัปเดตความเคลื่อนไหวล่าสุดของคุณในระบบ</p>
        </div>
        <button 
          onClick={() => markAsRead(undefined, true)}
          className="text-sm font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-colors"
        >
          ทำเครื่องหมายว่าอ่านแล้วทั้งหมด
        </button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 bg-white py-20">
            <div className="rounded-full bg-slate-50 p-6 mb-4">
              <Bell className="h-12 w-12 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold text-lg">ยังไม่มีการแจ้งเตือนใหม่</p>
            <p className="text-slate-300 text-sm mt-1">เมื่อมีความเคลื่อนไหว เราจะแจ้งให้คุณทราบทันที</p>
          </div>
        ) : (
          notifications.map((notif) => {
            const config = getIcon(notif.type);
            return (
              <div
                key={notif.id}
                className={`group relative flex items-start space-x-5 rounded-3xl border bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-indigo-100 ${
                  !notif.isRead ? "ring-2 ring-indigo-500/5 border-indigo-100" : "border-slate-100"
                }`}
              >
                {!notif.isRead && (
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 h-12 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]" />
                )}
                
                <div className={`flex-shrink-0 rounded-2xl p-3.5 ${config.bg} ${config.color} ${config.border} border shadow-sm transition-transform group-hover:scale-110`}>
                  <config.icon className="h-7 w-7" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-black tracking-tight ${!notif.isRead ? "text-slate-900" : "text-slate-600"}`}>
                      {notif.title}
                    </h3>
                    <span className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full">
                      <Calendar className="mr-1.5 h-3 w-3" />
                      {new Date(notif.createdAt).toLocaleDateString("th-TH")}
                    </span>
                  </div>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{notif.message}</p>
                  
                  <div className="pt-4 flex items-center space-x-3">
                    {notif.projectId ? (
                      <Link 
                        href={`/projects/${notif.projectId}`}
                        className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-slate-200 hover:bg-indigo-600 transition-all group/btn"
                      >
                        เปิดดูโครงการ
                        <ExternalLink className="ml-2 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    ) : notif.type === "score_awarded" ? (
                      <Link 
                        href="/activity-scores"
                        className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-500 transition-all group/btn"
                      >
                        ดูคะแนนกิจกรรม
                        <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                    ) : null}
                    
                    {!notif.isRead && (
                      <button 
                        onClick={() => markAsRead(notif.id)}
                        className="text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        ทำเครื่องหมายว่าอ่านแล้ว
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

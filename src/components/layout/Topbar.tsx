"use client";

import { Bell, User, Search, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

const Topbar = () => {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = (require("react").useState)(0);

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
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [session]);

  return (
    <header className="flex h-20 items-center justify-between border-b bg-white/70 backdrop-blur-md px-10 sticky top-0 z-40">
      <div className="flex w-96 items-center rounded-2xl bg-slate-100/50 px-4 py-2.5 border border-slate-200/50 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="ค้นหาโครงการหรือกิจกรรม..."
          className="ml-3 w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
        />
      </div>
      
      <div className="flex items-center space-x-6">
        <Link href="/notifications" className="relative rounded-2xl p-2.5 text-slate-400 transition-all hover:bg-indigo-50 hover:text-indigo-600 group">
          <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
          {unreadCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white ring-2 ring-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
        
        <div className="h-8 w-[1px] bg-slate-200" />
        
        <Link href="/settings" className="flex items-center space-x-4 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-800 leading-none group-hover:text-indigo-600 transition-colors">
              {session?.user?.name || "User"}
            </p>
            <div className="flex items-center justify-end mt-1">
              <Sparkles className="h-2.5 w-2.5 text-amber-500 mr-1" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                {(session?.user as any)?.role || "Guest"}
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden">
               <User className="h-5 w-5" />
               <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Topbar;

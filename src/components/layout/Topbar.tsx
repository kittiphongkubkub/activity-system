"use client";

import { Bell, User, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";

const Topbar = () => {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/notifications/unread-count");
      const data = await res.json();
      setUnreadCount(data.count);
    } catch (err) {
      console.error(err);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;

    // Fetch accurate count once on mount
    fetchUnreadCount();

    // ── SSE: real-time push ──────────────────────────────────────────
    // Replaces polling. Server pushes events the instant a notification
    // is created — no DB hits, no lag, no unnecessary requests.
    const connectSSE = () => {
      const es = new EventSource("/api/notifications/stream");
      eventSourceRef.current = es;

      es.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_notification") {
            // Increment badge immediately — optimistic + accurate
            setUnreadCount((prev) => prev + 1);
          } else if (data.type === "unread_count") {
            setUnreadCount(data.count);
          }
          // "connected" type — ignore, no action needed
        } catch {
          // Malformed event — ignore
        }
      };

      es.onerror = () => {
        // EventSource auto-reconnects after error, but close and let it retry
        es.close();
        eventSourceRef.current = null;
        // Reconnect after 5s to avoid hammering the server
        setTimeout(connectSSE, 5_000);
      };
    };

    connectSSE();

    // ── Fallback: slow poll every 120s ───────────────────────────────
    // Keeps the count accurate even if SSE drops (e.g. server restart)
    const fallbackInterval = setInterval(fetchUnreadCount, 120_000);

    // ── Visibility: re-sync count when user returns to tab ──────────
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchUnreadCount();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      eventSourceRef.current?.close();
      clearInterval(fallbackInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [session, fetchUnreadCount]);

  return (
    <header className="flex h-20 items-center justify-between border-b bg-white/70 backdrop-blur-md px-10 sticky top-0 z-40">
      <div className="flex-1 flex flex-col justify-center">
        <h2 className="text-lg font-black text-slate-800 tracking-tight leading-none">
          ระบบจัดการเอกสารโครงการกิจกรรม
        </h2>
        <div className="flex items-center mt-1.5">
          <div className="h-1 w-1 rounded-full bg-indigo-500 mr-2" />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
            Activity Project Management System
          </p>
        </div>
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

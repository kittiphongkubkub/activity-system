"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

// Lazy-load Sentry — no crash if package isn't installed
let captureException: ((err: unknown) => void) | null = null;
try {
  captureException = require("@sentry/nextjs").captureException;
} catch {
  // Sentry not installed
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Forward to Sentry for production debugging
    if (captureException) {
      captureException(error);
    } else {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 font-sans">
      <div className="w-full max-w-md rounded-[40px] bg-white p-12 shadow-2xl shadow-slate-200 border border-slate-100 text-center animate-in fade-in zoom-in duration-500">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-rose-50 text-rose-500 shadow-inner">
          <AlertCircle className="h-12 w-12" />
        </div>
        
        <h1 className="mb-2 text-3xl font-black text-slate-900 tracking-tight">เกิดข้อผิดพลาดบางอย่าง</h1>
        <p className="mb-10 text-slate-500 font-medium leading-relaxed">
          ขออภัย ระบบขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง หรือกลับไปยังหน้าหลัก
        </p>

        <div className="flex flex-col space-y-4">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center rounded-2xl bg-slate-950 px-8 py-4 text-sm font-black text-white transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-slate-200"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            ลองใหม่อีกครั้ง
          </button>
          
          <Link
            href="/"
            className="flex items-center justify-center rounded-2xl bg-white border border-slate-200 px-8 py-4 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
          >
            <Home className="mr-2 h-4 w-4" />
            กลับหน้าหลัก
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-50">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
            Error ID: {error.digest || "Unknown"}
          </p>
        </div>
      </div>
    </div>
  );
}

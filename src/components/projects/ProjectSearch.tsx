"use client";

import { Search, Filter, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce"; // I'll create this hook if it doesn't exist

export const ProjectSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const docType = searchParams.get("docType") || "025";
  
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }
    
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    // Preserve docType
    params.set("docType", docType);

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, status, router, pathname, searchParams, docType]);

  const isSummary = docType === "027";

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 rounded-[32px] border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40">
      <div className="flex flex-1 items-center rounded-2xl bg-slate-50 px-5 py-4 w-full border border-transparent focus-within:border-indigo-200 focus-within:bg-white focus-within:ring-8 focus-within:ring-indigo-500/5 transition-all duration-300">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาชื่อโครงการ..."
          className="ml-3 w-full bg-transparent text-sm font-bold outline-none placeholder:text-slate-400 text-slate-700"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-xl hover:bg-rose-50 transition-all">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="flex items-center space-x-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-72">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-6 py-4 pr-12 text-sm font-black text-slate-600 outline-none focus:border-indigo-200 focus:bg-white focus:ring-8 focus:ring-indigo-500/5 transition-all duration-300 cursor-pointer hover:border-slate-200"
          >
            <option value="">สถานะทั้งหมด</option>
            {isSummary ? (
              <>
                <option value="approved">รอสรุปผล (อนุมัติแล้ว)</option>
                <option value="summary_submitted">ส่งสรุปผลแล้ว</option>
                <option value="summary_under_review">พิจารณาสรุปผล</option>
                <option value="summary_revision_required">ต้องแก้ไขสรุปผล</option>
                <option value="completed">ปิดโครงการเรียบร้อย</option>
                <option value="summary_rejected">สรุปผลถูกปฏิเสธ</option>
              </>
            ) : (
              <>
                <option value="draft">ร่างโครงการ</option>
                <option value="submitted">ส่งโครงการแล้ว</option>
                <option value="under_review">กำลังพิจารณา</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="revision_required">ต้องแก้ไข</option>
                <option value="rejected">ปฏิเสธโครงการ</option>
              </>
            )}
          </select>
          <Filter className="absolute right-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

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

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, status, router, pathname, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
      <div className="flex flex-1 items-center rounded-xl bg-slate-50 px-4 py-3 w-full border border-slate-100 focus-within:border-indigo-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/5 transition-all">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาตามชื่อโครงการ..."
          className="ml-3 w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="flex items-center space-x-3 w-full sm:w-auto">
        <div className="relative w-full sm:w-64">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-5 py-3 pr-12 text-sm font-bold text-slate-600 outline-none focus:border-indigo-200 focus:ring-4 focus:ring-indigo-500/5 transition-all cursor-pointer hover:border-slate-300"
          >
            <option value="">สถานะทั้งหมด</option>
            <option value="draft">ร่าง</option>
            <option value="submitted">ส่งแล้ว</option>
            <option value="under_review">กำลังพิจารณา</option>
            <option value="approved">อนุมัติแล้ว</option>
            <option value="rejected">ปฏิเสธ</option>
            <option value="revision_required">ต้องแก้ไข</option>
            <option value="completed">ปิดโครงการ</option>
          </select>
          <Filter className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

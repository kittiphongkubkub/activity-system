"use client";

import { Search, Filter, X } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce"; // I'll create this hook if it doesn't exist

export const ProjectSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [status, setStatus] = (require("react").useState)(searchParams.get("status") || "");
  
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedQuery) {
      params.set("query", debouncedQuery);
    } else {
      params.delete("query");
    }
    
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedQuery, status, router, pathname, searchParams]);

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex flex-1 items-center rounded-lg bg-slate-100 px-3 py-2 w-full">
        <Search className="h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาตามชื่อโครงการ..."
          className="ml-2 w-full bg-transparent text-sm outline-none"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <div className="flex items-center space-x-2 w-full sm:w-auto">
        <div className="relative w-full">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full appearance-none rounded-lg border bg-white px-4 py-2 pr-10 text-sm font-medium text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
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
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

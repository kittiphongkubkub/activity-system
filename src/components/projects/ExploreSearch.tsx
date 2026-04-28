"use client";

import { Search, Filter, X, ChevronDown } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";

const PROJECT_TYPES = [
  "ด้านวิชาการ/วิชาชีพ",
  "ด้านกีฬาและนันทนาการ",
  "ด้านศิลปวัฒนธรรม",
  "ด้านอาสาพัฒนา/บำเพ็ญประโยชน์",
  "ด้านจริยธรรม/คุณธรรม",
  "ทั่วไป"
];

const STATUS_OPTIONS = [
  { value: "approved", label: "อนุมัติแล้ว (Ongoing)" },
  { value: "completed", label: "เสร็จสิ้นแล้ว (Completed)" },
];

export const ExploreSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [type, setType] = useState(searchParams.get("type") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");

  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedSearch) {
      params.set("search", debouncedSearch);
    } else {
      params.delete("search");
    }

    if (type) {
      params.set("type", type);
    } else {
      params.delete("type");
    }

    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedSearch, type, status, router, pathname, searchParams]);

  const clearFilters = () => {
    setSearch("");
    setType("");
    setStatus("");
    router.push(pathname);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อโครงการ, ประเภทกิจกรรม หรือสถานที่..."
            className="w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-4 py-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
          />
          {search && (
            <button 
              onClick={() => setSearch("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-all"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <button 
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`flex items-center justify-center rounded-2xl border border-slate-200 px-6 py-4 text-sm font-bold transition-all shadow-sm ${isFilterOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
        >
          <Filter className="mr-2 h-4 w-4" />
          ตัวกรอง
          {(type || status) && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
              {(type && status) ? 2 : 1}
            </span>
          )}
        </button>
      </div>

      {isFilterOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">ประเภทกิจกรรม</label>
            <div className="relative">
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">ทั้งหมด</option>
                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">สถานะโครงการ</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-600 outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">ทั้งหมด</option>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-end pb-1">
            <button 
              onClick={clearFilters}
              className="text-xs font-bold text-rose-500 hover:text-rose-600 px-4 py-3 rounded-xl hover:bg-rose-50 transition-all flex items-center"
            >
              <X className="mr-2 h-3 w-3" />
              ล้างการกรองทั้งหมด
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

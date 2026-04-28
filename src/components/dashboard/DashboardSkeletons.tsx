export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-[32px] bg-white border border-slate-100 p-8 shadow-sm animate-pulse">
          <div className="mb-6 h-12 w-12 rounded-2xl bg-slate-100" />
          <div className="space-y-3">
            <div className="h-4 w-24 bg-slate-100 rounded" />
            <div className="h-10 w-16 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProjectsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex items-center justify-between rounded-[28px] border border-slate-50 bg-white p-6 shadow-sm animate-pulse">
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-50" />
            <div className="ml-5 space-y-2">
              <div className="h-6 w-48 bg-slate-50 rounded" />
              <div className="h-4 w-32 bg-slate-50 rounded" />
            </div>
          </div>
          <div className="h-8 w-24 bg-slate-50 rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function ScoreSkeleton() {
  return (
    <div className="rounded-[40px] bg-slate-900 p-8 text-white shadow-2xl animate-pulse">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-6 w-24 bg-white/10 rounded" />
          <div className="h-6 w-6 bg-white/10 rounded" />
        </div>
        <div className="text-center py-4 space-y-3">
          <div className="mx-auto h-16 w-24 bg-white/10 rounded" />
          <div className="mx-auto h-4 w-32 bg-white/10 rounded" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-white/10 rounded" />
            <div className="h-3 w-8 bg-white/10 rounded" />
          </div>
          <div className="h-3 w-full rounded-full bg-white/10" />
        </div>
        <div className="h-12 w-full bg-white/10 rounded-2xl" />
      </div>
    </div>
  );
}

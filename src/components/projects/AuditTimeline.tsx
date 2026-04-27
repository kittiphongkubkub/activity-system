import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Send, 
  RefreshCw,
  User as UserIcon,
  Timer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistance } from "date-fns";
import { th } from "date-fns/locale";

interface AuditLog {
  id: string;
  action: string;
  fromStatus: string | null;
  toStatus: string | null;
  comments: string | null;
  stepName: string | null;
  createdAt: Date;
  user: {
    fullName: string;
    role: string;
  } | null;
}

export const AuditTimeline = ({ logs }: { logs: AuditLog[] }) => {
  const sortedLogs = [...logs].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const getActionInfo = (action: string) => {
    switch (action) {
      case "submit":
      case "summary_submit":
        return { icon: Send, color: "bg-blue-500", text: "ส่งโครงการ", label: "Submit" };
      case "resubmit":
      case "summary_resubmit":
        return { icon: RefreshCw, color: "bg-indigo-500", text: "ส่งแก้ไขโครงการ", label: "Resubmit" };
      case "approve":
        return { icon: CheckCircle2, color: "bg-emerald-500", text: "อนุมัติ", label: "Approve" };
      case "reject":
        return { icon: XCircle, color: "bg-rose-500", text: "ปฏิเสธ", label: "Reject" };
      case "request_revision":
        return { icon: AlertCircle, color: "bg-amber-500", text: "ส่งกลับแก้ไข", label: "Revision" };
      default:
        return { icon: Clock, color: "bg-slate-400", text: "ดำเนินการ", label: "Action" };
    }
  };

  return (
    <div className="flow-root relative">
      <div className="absolute top-0 left-4 -bottom-8 w-0.5 bg-slate-100 hidden sm:block" />
      
      <ul role="list" className="space-y-8">
        {sortedLogs.map((log, logIdx) => {
          const info = getActionInfo(log.action);
          const ActionIcon = info.icon;
          
          // Calculate duration from previous log (next in sorted list as it's descending)
          const nextLog = sortedLogs[logIdx + 1];
          const duration = nextLog 
            ? formatDistance(new Date(log.createdAt), new Date(nextLog.createdAt), { locale: th })
            : null;

          return (
            <li key={log.id} className="relative">
              <div className="relative flex items-start space-x-4 sm:space-x-6">
                {/* Icon Column */}
                <div className="relative z-10">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white shadow-sm",
                    info.color,
                    "text-white"
                  )}>
                    <ActionIcon className="h-4 w-4" />
                  </div>
                </div>

                {/* Content Column */}
                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest text-white",
                          info.color
                        )}>
                          {info.text}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800">
                          {log.stepName || "ดำเนินการ"}
                        </h4>
                      </div>
                      <div className="flex items-center text-[10px] font-bold text-slate-400">
                        <Clock className="mr-1 h-3 w-3" />
                        {new Date(log.createdAt).toLocaleDateString("th-TH", {
                          day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 mb-3">
                      <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <UserIcon className="h-3 w-3 text-slate-400" />
                      </div>
                      <p className="text-xs font-bold text-slate-600">
                        {log.user?.fullName || "ระบบอัตโนมัติ"}
                        <span className="ml-2 font-medium text-slate-400 text-[10px] uppercase">
                          • {log.user?.role || "System"}
                        </span>
                      </p>
                    </div>

                    {log.comments && (
                      <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 mb-3">
                        <p className="text-xs text-slate-600 italic leading-relaxed">
                          "{log.comments}"
                        </p>
                      </div>
                    )}

                    {duration && (
                      <div className="flex items-center text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2 pt-2 border-t border-slate-50">
                        <Timer className="mr-1.5 h-3 w-3" />
                        ใช้เวลาดําเนินการ: {duration}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

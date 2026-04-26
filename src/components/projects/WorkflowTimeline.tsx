import { CheckCircle2, Clock, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  stepOrder: number;
  stepName: string;
  status: string;
  comments?: string;
  reviewedAt?: Date;
}

export const WorkflowTimeline = ({ steps }: { steps: Step[] }) => {
  const sortedSteps = [...steps].sort((a, b) => a.stepOrder - b.stepOrder);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
      case "in_review":
        return <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />;
      case "rejected":
        return <XCircle className="h-6 w-6 text-rose-500" />;
      case "revision_required":
        return <AlertCircle className="h-6 w-6 text-orange-500" />;
      default:
        return <Clock className="h-6 w-6 text-slate-300" />;
    }
  };

  return (
    <div className="flow-root relative">
      <ul role="list" className="space-y-0">
        {sortedSteps.map((step, stepIdx) => (
          <li key={step.id}>
            <div className="relative pb-10 group">
              {/* Connecting Line */}
              {stepIdx !== sortedSteps.length - 1 ? (
                <span
                  className={cn(
                    "absolute left-4 top-8 -ml-px h-full w-0.5 transition-colors duration-500",
                    step.status === "approved" ? "bg-emerald-500" : "bg-slate-200"
                  )}
                  aria-hidden="true"
                />
              ) : null}

              <div className="relative flex items-start space-x-6">
                {/* Icon Column */}
                <div className="relative">
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white shadow-sm transition-all duration-500",
                    step.status === "approved" ? "bg-emerald-500 text-white" : 
                    step.status === "in_review" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" :
                    step.status === "rejected" ? "bg-rose-500 text-white" :
                    step.status === "revision_required" ? "bg-orange-500 text-white" :
                    "bg-slate-100 text-slate-400"
                  )}>
                    {getStatusIcon(step.status)}
                  </div>
                  {step.status === "in_review" && (
                    <span className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-20" />
                  )}
                </div>

                {/* Content Column */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h4 className={cn(
                      "text-base font-black tracking-tight transition-colors",
                      step.status === "approved" ? "text-emerald-700" : 
                      step.status === "in_review" ? "text-indigo-600" : "text-slate-900"
                    )}>
                      {step.stepName}
                    </h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
                      {step.status === "approved" && step.reviewedAt 
                        ? `อนุมัติเมื่อ ${new Date(step.reviewedAt).toLocaleDateString("th-TH")}`
                        : step.status.replace("_", " ")}
                    </span>
                  </div>
                  
                  {step.comments && (
                    <div className="mt-3 rounded-2xl bg-slate-50 p-4 border border-slate-100 relative overflow-hidden group-hover:bg-white group-hover:shadow-sm transition-all">
                      <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-indigo-400 transition-colors" />
                      <p className="text-sm font-medium text-slate-600 italic leading-relaxed">
                        "{step.comments}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "approved":
      return <CheckCircle2 className="h-5 w-5" />;
    case "in_review":
      return <Loader2 className="h-5 w-5 animate-spin" />;
    case "rejected":
      return <XCircle className="h-5 w-5" />;
    case "revision_required":
      return <AlertCircle className="h-5 w-5" />;
    default:
      return <Clock className="h-5 w-5" />;
  }
};

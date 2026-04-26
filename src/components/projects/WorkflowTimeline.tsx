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
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {sortedSteps.map((step, stepIdx) => (
          <li key={step.id}>
            <div className="relative pb-8">
              {stepIdx !== sortedSteps.length - 1 ? (
                <span
                  className="absolute left-3 top-4 -ml-px h-full w-0.5 bg-slate-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="flex h-6 items-center justify-center rounded-full bg-white">
                    {getStatusIcon(step.status)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {step.stepName}
                    </p>
                    {step.comments && (
                      <p className="mt-1 text-sm text-slate-500 bg-slate-50 p-2 rounded border">
                        {step.comments}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-slate-500">
                    {step.status === "approved" && step.reviewedAt ? (
                      new Date(step.reviewedAt).toLocaleDateString("th-TH")
                    ) : (
                      <span className="capitalize">{step.status.replace("_", " ")}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

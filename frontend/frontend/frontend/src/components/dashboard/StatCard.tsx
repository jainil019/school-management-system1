import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: LucideIcon;
  positive?: boolean;
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  positive = true,
}: StatCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Icon size={21} />
        </div>

        <div
          className={`flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold ${
            positive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-red-50 text-red-500"
          }`}
        >
          {positive ? (
            <ArrowUpRight size={13} />
          ) : (
            <ArrowDownRight size={13} />
          )}

          {change}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>

        <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </h2>
      </div>

      <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-3/4 rounded-full bg-blue-500" />
      </div>
    </div>
  );
}

export default StatCard;
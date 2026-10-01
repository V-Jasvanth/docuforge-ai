import React from "react";
import { Card } from "../ui/Card";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, description, icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("p-5 flex items-start justify-between", className)}>
      <div className="space-y-1">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
          </span>
          {trend && (
            <span
              className={cn(
                "text-xs font-semibold px-1.5 py-0.5 rounded",
                trend.isPositive
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              )}
            >
              {trend.value}
            </span>
          )}
        </div>
        {description && <p className="text-[11px] text-slate-400 dark:text-slate-500">{description}</p>}
      </div>
      <div className="p-2.5 rounded-lg bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 shrink-0">
        {icon}
      </div>
    </Card>
  );
}

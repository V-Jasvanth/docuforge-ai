import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "error";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    default: "border-transparent bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900",
    secondary: "border-transparent bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100",
    outline: "text-slate-950 dark:text-slate-50 border-slate-300 dark:border-slate-700",
    success: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    warning: "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    error: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
  };

  return <div className={cn(base, variants[variant], className)} {...props} />;
}

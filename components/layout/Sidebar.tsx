"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  FileText,
  GitBranch,
  SearchCode,
  Settings,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/projects", icon: FolderGit2 },
    { name: "Documentation", href: "/projects/demo-1/documentation", icon: FileText },
    { name: "Repositories", href: "/projects/demo-1/repository", icon: GitBranch },
    { name: "Analysis", href: "/projects/demo-1/analysis", icon: SearchCode },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div className="p-4">
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center space-x-3 px-3 py-2 mb-6">
          <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold shadow-md">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base leading-tight block">
              DocuForge AI
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Developer SaaS
            </span>
          </div>
        </Link>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                )}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={cn("h-4 w-4", isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400")} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-brand-500" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / System Status */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Foundation v1.0</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Provider-independent AI architecture ready.
          </p>
        </div>
      </div>
    </aside>
  );
}

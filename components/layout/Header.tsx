"use client";

import React from "react";
import { Search, Bell, User as UserIcon, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/Button";

export function Header() {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-10 px-6 flex items-center justify-between">
      {/* Search Bar */}
      <div className="relative w-72">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search projects, repos, docs..."
          className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center space-x-3">
        <Link href="/projects/new">
          <Button size="sm" className="space-x-1">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </Link>

        {/* Notifications */}
        <button
          aria-label="Notifications"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 relative cursor-pointer"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-brand-600" />
        </button>

        {/* User Profile */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-600">
            <UserIcon className="h-4 w-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-none">
              Alex Vance
            </p>
            <p className="text-[10px] text-slate-500 leading-tight">Senior Engineer</p>
          </div>
        </div>
      </div>
    </header>
  );
}

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { SearchCode, FileCode, CheckCircle2, Filter, Layers, Server } from "lucide-react";
import { Badge } from "../ui/Badge";

export function AnalysisTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <SearchCode className="h-4 w-4 text-brand-500" />
                Structured Codebase Analysis
              </CardTitle>
              <CardDescription>
                Metadata extracted by the Codebase Analyzer engine (Filtering out node_modules, build artifacts, and binary files)
              </CardDescription>
            </div>
            <Badge variant="success">Completed</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Analysis Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Scanned Files</span>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">84</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Filtered / Ignored</span>
              <span className="text-xl font-bold text-slate-400">1,420 files</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Lines of Code</span>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">12,450</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Analysis Duration</span>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">1.8s</span>
            </div>
          </div>

          {/* Languages & Framework */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-brand-500" /> Detected Frameworks & Stack
              </h4>
              <ul className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
                <li className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span>Primary Framework:</span>
                  <span className="font-semibold">Next.js v15.1 (App Router)</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span>UI Engine:</span>
                  <span className="font-semibold">React v19 + Tailwind CSS</span>
                </li>
                <li className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span>ORM Layer:</span>
                  <span className="font-semibold">Prisma ORM v6</span>
                </li>
              </ul>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-emerald-500" /> Filtering & Exclusion Rules
              </h4>
              <p className="text-xs text-slate-500">
                The analyzer automatically ignored non-essential binary and build directories to prevent sending unnecessary noise to AI context window.
              </p>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono pt-1">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">node_modules</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">.next</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">dist</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">coverage</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">__pycache__</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Progress } from "../ui/Progress";
import { FileText, Cpu, Database, Server, GitCommit, AlertTriangle } from "lucide-react";

export function OverviewTab() {
  return (
    <div className="space-y-6">
      {/* Coverage Card */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation Readiness & Coverage</CardTitle>
          <CardDescription>
            Overall documentation completeness synthesized from repository structure and AI analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">82%</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              High Coverage
            </span>
          </div>
          <Progress value={82} showLabel />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Total Sections</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-base">13</span>
            </div>
            <div>
              <span className="text-slate-500 block">Generated</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-base">10</span>
            </div>
            <div>
              <span className="text-slate-500 block">Needs Review</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 text-base">2</span>
            </div>
            <div>
              <span className="text-slate-500 block">Not Generated</span>
              <span className="font-semibold text-slate-400 text-base">1</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Codebase Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-brand-500" />
              Detected Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p><strong className="text-slate-900 dark:text-slate-100">Framework:</strong> Next.js App Router</p>
            <p><strong className="text-slate-900 dark:text-slate-100">Language:</strong> TypeScript (94.2%)</p>
            <p><strong className="text-slate-900 dark:text-slate-100">Styling:</strong> Tailwind CSS</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-brand-500" />
              API & Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p><strong className="text-slate-900 dark:text-slate-100">API Routes:</strong> 14 Route Handlers</p>
            <p><strong className="text-slate-900 dark:text-slate-100">Auth Solution:</strong> NextAuth / Auth.js</p>
            <p><strong className="text-slate-900 dark:text-slate-100">Validation:</strong> Zod Schemas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-brand-500" />
              Database Models
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p><strong className="text-slate-900 dark:text-slate-100">ORM:</strong> Prisma ORM</p>
            <p><strong className="text-slate-900 dark:text-slate-100">Database:</strong> PostgreSQL</p>
            <p><strong className="text-slate-900 dark:text-slate-100">Entities:</strong> 9 Models Defined</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

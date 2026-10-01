import React from "react";
import { FolderGit2, GitBranch, FileText, AlertTriangle, Sparkles, Plus, ExternalLink } from "lucide-react";
import Link from "next/link";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentProjectsTable } from "@/components/dashboard/RecentProjectsTable";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { aiService } from "@/lib/ai/service";

export default async function DashboardPage() {
  const aiStatus = await aiService.getStatus();

  return (
    <div className="space-y-8">
      {/* Welcome & Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Developer Dashboard
          </h1>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Overview of software codebase analysis, repository sync, and AI documentation.
          </p>
        </div>

        <Link href="/projects/new">
          <Button size="md" className="space-x-1.5 shadow-md">
            <Plus className="h-4 w-4" />
            <span>Connect New Project</span>
          </Button>
        </Link>
      </div>

      {/* AI Provider Architecture Status Notification Banner */}
      {!aiStatus.isConfigured && (
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">AI Service Architecture Initialized</span>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5">{aiStatus.message}</p>
            </div>
          </div>
          <span className="font-mono text-[11px] font-semibold text-amber-700 dark:text-amber-300 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 whitespace-nowrap">
            PROVIDER-INDEPENDENT
          </span>
        </div>
      )}

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Projects"
          value="4"
          description="Active codebases connected"
          icon={<FolderGit2 className="h-5 w-5" />}
          trend={{ value: "+1 this week", isPositive: true }}
        />
        <StatsCard
          title="Repositories Analyzed"
          value="3"
          description="Parsed AST & schemas"
          icon={<GitBranch className="h-5 w-5" />}
        />
        <StatsCard
          title="Docs Generated"
          value="32"
          description="Sections in v1.0 version"
          icon={<FileText className="h-5 w-5" />}
          trend={{ value: "+8 sections", isPositive: true }}
        />
        <StatsCard
          title="Needs Updates"
          value="2"
          description="Potential drift detected"
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          trend={{ value: "2 affected", isPositive: false }}
        />
      </div>

      {/* Recent Projects Table */}
      <RecentProjectsTable />
    </div>
  );
}

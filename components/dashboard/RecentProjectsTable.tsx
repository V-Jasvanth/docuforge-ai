"use client";

import React from "react";
import Link from "next/link";
import { FolderGit2, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "../ui/Badge";
import { Progress } from "../ui/Progress";

export interface DashboardProjectDemo {
  id: string;
  name: string;
  repo: string;
  stack: string;
  docPercentage: number;
  lastAnalyzed: string;
  status: "READY" | "ANALYZING" | "NEEDS_REVIEW";
}

const DEMO_PROJECTS: DashboardProjectDemo[] = [
  {
    id: "demo-1",
    name: "FlowBoard SaaS",
    repo: "V-Jasvanth/Flowboard-Saas",
    stack: "Next.js · React · Node.js",
    docPercentage: 82,
    lastAnalyzed: "10 mins ago",
    status: "READY",
  },
  {
    id: "demo-2",
    name: "InvestoDeck",
    repo: "V-Jasvanth/InvestoDeck-API",
    stack: "Python · Flask · PostgreSQL",
    docPercentage: 64,
    lastAnalyzed: "2 days ago",
    status: "NEEDS_REVIEW",
  },
  {
    id: "demo-3",
    name: "DevHub Analytics",
    repo: "V-Jasvanth/DevHub-Core",
    stack: "TypeScript · Go · Redis",
    docPercentage: 45,
    lastAnalyzed: "5 hours ago",
    status: "ANALYZING",
  },
];

export function RecentProjectsTable() {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            Recent Projects
          </h3>
          <p className="text-xs text-slate-500">Overview of repository analysis & documentation coverage</p>
        </div>
        <Link
          href="/projects"
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
        >
          View All <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-3 px-5">Project Name</th>
              <th className="py-3 px-5">Tech Stack</th>
              <th className="py-3 px-5">Doc Coverage</th>
              <th className="py-3 px-5">Last Analyzed</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {DEMO_PROJECTS.map((proj) => (
              <tr key={proj.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-5 font-semibold text-slate-900 dark:text-slate-100">
                  <Link href={`/projects/${proj.id}`} className="hover:underline flex flex-col">
                    <span>{proj.name}</span>
                    <span className="text-[11px] font-mono text-slate-400 font-normal">{proj.repo}</span>
                  </Link>
                </td>
                <td className="py-4 px-5 text-slate-600 dark:text-slate-400">{proj.stack}</td>
                <td className="py-4 px-5 w-48">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span>{proj.docPercentage}% complete</span>
                    </div>
                    <Progress value={proj.docPercentage} />
                  </div>
                </td>
                <td className="py-4 px-5 text-slate-500 flex items-center gap-1.5 pt-6">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  {proj.lastAnalyzed}
                </td>
                <td className="py-4 px-5">
                  {proj.status === "READY" && <Badge variant="success">Analyzed</Badge>}
                  {proj.status === "NEEDS_REVIEW" && <Badge variant="warning">Needs Review</Badge>}
                  {proj.status === "ANALYZING" && <Badge variant="secondary">In Progress</Badge>}
                </td>
                <td className="py-4 px-5 text-right">
                  <Link
                    href={`/projects/${proj.id}`}
                    className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 transition-colors"
                  >
                    Open Workspace
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

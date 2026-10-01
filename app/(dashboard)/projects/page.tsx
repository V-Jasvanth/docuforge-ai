"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FolderGit2, Plus, Search, Filter, GitBranch, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const projects = [
    {
      id: "demo-1",
      name: "FlowBoard SaaS",
      repo: "V-Jasvanth/Flowboard-Saas",
      stack: "Next.js · React · Node.js",
      framework: "Next.js 15",
      coverage: 82,
      lastAnalyzed: "10 mins ago",
      status: "READY",
      description: "Interactive kanban and workflow management platform for modern engineering teams.",
    },
    {
      id: "demo-2",
      name: "InvestoDeck",
      repo: "V-Jasvanth/InvestoDeck-API",
      stack: "Python · Flask · PostgreSQL",
      framework: "Flask",
      coverage: 64,
      lastAnalyzed: "2 days ago",
      status: "NEEDS_REVIEW",
      description: "Financial modeling and portfolio analytics backend service.",
    },
    {
      id: "demo-3",
      name: "DevHub Analytics",
      repo: "V-Jasvanth/DevHub-Core",
      stack: "TypeScript · Go · Redis",
      framework: "Custom Go Service",
      coverage: 45,
      lastAnalyzed: "5 hours ago",
      status: "ANALYZING",
      description: "High-throughput developer metrics and commit velocity aggregator.",
    },
    {
      id: "demo-4",
      name: "DocuForge AI",
      repo: "V-Jasvanth/DocuForge-AI",
      stack: "Next.js 15 · Tailwind · Prisma",
      framework: "Next.js App Router",
      coverage: 100,
      lastAnalyzed: "Just now",
      status: "READY",
      description: "Understand, document, and maintain your codebase with AI.",
    },
  ];

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.repo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Documentation Projects
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage software codebases connected to DocuForge AI</p>
        </div>

        <Link href="/projects/new">
          <Button size="sm" className="space-x-1.5">
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center space-x-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by project name or repository..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((proj) => (
          <Card key={proj.id} className="p-6 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-brand-600 transition-colors">
                  <Link href={`/projects/${proj.id}`}>{proj.name}</Link>
                </h3>
                <span className="font-mono text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <GitBranch className="h-3 w-3" /> {proj.repo}
                </span>
              </div>
              <Badge variant={proj.status === "READY" ? "success" : proj.status === "NEEDS_REVIEW" ? "warning" : "secondary"}>
                {proj.status.replace("_", " ")}
              </Badge>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{proj.description}</p>

            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Documentation Coverage</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{proj.coverage}%</span>
              </div>
              <Progress value={proj.coverage} />
            </div>

            <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
              <span>Stack: <strong className="text-slate-700 dark:text-slate-300 font-medium">{proj.framework}</strong></span>
              <Link
                href={`/projects/${proj.id}`}
                className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
              >
                Open Workspace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

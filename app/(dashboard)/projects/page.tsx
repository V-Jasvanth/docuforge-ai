"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FolderGit2, Plus, Search, GitBranch, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await fetch("/api/projects");
        const json = await res.json();
        if (res.ok && json.success) {
          setProjects(json.data);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoading(false);
      }
    }
    loadProjects();
  }, []);

  const filtered = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.repository?.owner && p.repository.owner.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.repository?.name && p.repository.name.toLowerCase().includes(searchTerm.toLowerCase()))
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

      {/* Loading state */}
      {isLoading ? (
        <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin text-brand-500" />
          <span>Loading projects from database...</span>
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center space-y-3">
          <FolderGit2 className="h-8 w-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">No Projects Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Connect your first public GitHub repository to start scanning codebases and generating AI documentation.
          </p>
          <Link href="/projects/new">
            <Button size="sm" className="mt-2 space-x-1">
              <Plus className="h-3.5 w-3.5" />
              <span>Connect Repository</span>
            </Button>
          </Link>
        </Card>
      ) : (
        /* Project Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((proj) => {
            const repoStr = proj.repository
              ? `${proj.repository.owner}/${proj.repository.name}`
              : "No Repository Connected";
            const coverage = proj.status === "READY" ? 100 : proj.status === "ANALYZING" ? 40 : 0;

            return (
              <Card
                key={proj.id}
                className="p-6 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-brand-600 transition-colors">
                      <Link href={`/projects/${proj.id}`}>{proj.name}</Link>
                    </h3>
                    <span className="font-mono text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <GitBranch className="h-3 w-3" /> {repoStr}
                    </span>
                  </div>
                  <Badge
                    variant={
                      proj.status === "READY"
                        ? "success"
                        : proj.status === "ANALYZING"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {proj.status}
                  </Badge>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                  {proj.description || "No description provided."}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Analysis Completeness</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{coverage}%</span>
                  </div>
                  <Progress value={coverage} />
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                  <span>
                    Stack: <strong className="text-slate-700 dark:text-slate-300 font-medium">{proj.framework}</strong>
                  </span>
                  <Link
                    href={`/projects/${proj.id}`}
                    className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
                  >
                    Open Workspace <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

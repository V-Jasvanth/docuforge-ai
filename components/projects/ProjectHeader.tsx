"use client";

import React from "react";
import { GitBranch, RefreshCw, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

export interface ProjectHeaderProps {
  projectId: string;
  name: string;
  repo: string;
  branch: string;
  framework: string;
  languages: string[];
  status: string;
  lastAnalyzed: string;
  onReanalyze?: () => void;
  isAnalyzing?: boolean;
}

export function ProjectHeader({
  name,
  repo,
  branch,
  framework,
  languages,
  status,
  lastAnalyzed,
  onReanalyze,
  isAnalyzing = false,
}: ProjectHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Title & Metadata */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{name}</h1>
            {isAnalyzing || status === "ANALYZING" ? (
              <Badge variant="secondary" className="flex items-center gap-1 animate-pulse">
                <Loader2 className="h-3 w-3 animate-spin text-brand-500" />
                Analyzing Repository...
              </Badge>
            ) : status === "ERROR" ? (
              <Badge variant="error" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Analysis Failed
              </Badge>
            ) : (
              <Badge variant="success" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {status || "Analyzed"}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-mono">
              <GitBranch className="h-3.5 w-3.5" />
              {repo} ({branch})
            </span>
            <span>·</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{framework}</span>
            <span>·</span>
            <span>{languages.length > 0 ? languages.slice(0, 4).join(" · ") : "Languages Pending"}</span>
            <span>·</span>
            <span>Last analyzed: {lastAnalyzed}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onReanalyze}
            isLoading={isAnalyzing}
            className="space-x-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Re-analyze Codebase</span>
          </Button>

          <Button size="sm" className="space-x-1.5">
            <Sparkles className="h-4 w-4" />
            <span>Generate Docs</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

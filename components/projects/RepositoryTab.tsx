import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { GitBranch, Folder, File, ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "../ui/Badge";
import { CodebaseAnalysisResult } from "@/lib/analyzer/types";
import { formatBytes } from "@/lib/utils";

export interface RepositoryTabProps {
  repository?: {
    owner: string;
    name: string;
    url: string;
    branch: string;
    lastSyncedAt?: string | Date | null;
  } | null;
  analysis?: CodebaseAnalysisResult | null;
}

export function RepositoryTab({ repository, analysis }: RepositoryTabProps) {
  const repoName = repository ? `${repository.owner}/${repository.name}` : "GitHub Repository";
  const repoUrl = repository?.url || `https://github.com/${repoName}`;
  const branch = repository?.branch || "main";

  const filesPreview = analysis?.fileMetadataList.slice(0, 15) || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-brand-500" />
                Connected GitHub Repository
              </CardTitle>
              <CardDescription>Target branch, repository URL, and file tree structure scan</CardDescription>
            </div>
            <Badge variant="success" className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Connected
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
            <div>
              <span className="text-slate-500 block font-medium">Repository URL</span>
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-brand-600 hover:underline flex items-center gap-1 mt-0.5"
              >
                {repoName} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Active Branch</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                {branch}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Last Synced Scan</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">
                {repository?.lastSyncedAt
                  ? new Date(repository.lastSyncedAt).toLocaleString()
                  : "Just now"}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 flex justify-between items-center">
              <span>Repository File Tree ({analysis?.totalFileCount || 0} items)</span>
              <span className="text-[11px] font-mono text-slate-400 font-normal">
                {analysis?.scannedFilesCount || 0} analyzed · {analysis?.ignoredFileCount || 0} filtered
              </span>
            </h4>

            {filesPreview.length > 0 ? (
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-mono">
                {filesPreview.map((item) => (
                  <div
                    key={item.path}
                    className={`px-4 py-2 flex items-center justify-between transition-colors ${
                      item.isIgnored
                        ? "opacity-50 bg-slate-100/50 dark:bg-slate-900/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate pr-4">
                      {item.extension ? (
                        <File className="h-4 w-4 text-slate-400 shrink-0" />
                      ) : (
                        <Folder className="h-4 w-4 text-amber-500 shrink-0" />
                      )}
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.path}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 shrink-0 text-[11px] font-sans">
                      <span className="text-slate-400">{formatBytes(item.sizeBytes)}</span>
                      {item.isIgnored ? (
                        <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-500 font-mono text-[10px]">
                          IGNORED ({item.ignoreReason || "filter rule"})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-mono text-[10px]">
                          {item.category}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
                No file tree scan records available yet. Click &quot;Re-analyze Codebase&quot; to fetch tree.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

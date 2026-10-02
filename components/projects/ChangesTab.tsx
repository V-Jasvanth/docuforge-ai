"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { AlertTriangle, FileCode, RefreshCw, CheckCircle, Eye, X, Loader2 } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { DetailedDriftAnalysis, FileChange, SectionImpact } from "@/lib/documentation/drift";

export interface ChangesTabProps {
  projectId: string;
}

export function ChangesTab({ projectId }: ChangesTabProps) {
  const [driftData, setDriftData] = useState<DetailedDriftAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileChange | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchDriftAnalysis = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/documentation/drift`);
      const json = await res.json();
      if (res.ok && json.success) {
        setDriftData(json.data);
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDriftAnalysis();
  }, [fetchDriftAnalysis]);

  const handleRegenerateOutdated = async () => {
    if (!projectId || isRegenerating) return;
    setIsRegenerating(true);
    setNotification(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/documentation/drift/regenerate-outdated`, {
        method: "POST",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setNotification({
          type: "success",
          message: json.message || "Outdated sections successfully regenerated!",
        });
        await fetchDriftAnalysis();
      } else {
        setNotification({ type: "error", message: json.error || "Failed to regenerate outdated sections." });
      }
    } catch {
      setNotification({ type: "error", message: "Network error regenerating outdated sections." });
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-3">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-brand-500" />
        <p className="text-xs font-medium">Analyzing repository history & checking documentation drift...</p>
      </div>
    );
  }

  const fileChanges = driftData?.fileChanges || [];
  const affectedSections = driftData?.affectedSections || [];
  const isDriftDetected = driftData?.isDriftDetected || false;

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            notification.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Drift Detection Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                Documentation Drift Engine
              </CardTitle>
              <CardDescription>
                Identifies potentially outdated documentation by comparing repository scans and mapping changed files to documentation sections.
              </CardDescription>
            </div>
            {isDriftDetected && (
              <Button
                size="sm"
                onClick={handleRegenerateOutdated}
                isLoading={isRegenerating}
                className="space-x-1 shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Regenerate Outdated Sections ({affectedSections.length})</span>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status Banner */}
          {isDriftDetected ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
              <p className="font-bold text-sm">Documentation Drift Detected</p>
              <p className="mt-1">{driftData?.summary}</p>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold">Documentation Up To Date</p>
                <p className="mt-0.5">{driftData?.summary || "No documentation drift detected."}</p>
              </div>
            </div>
          )}

          {/* Section Impact List */}
          {affectedSections.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Affected Documentation Sections ({affectedSections.length})
              </h4>

              <div className="grid grid-cols-1 gap-3">
                {affectedSections.map((impact: SectionImpact, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{impact.sectionTitle}</span>
                      <Badge variant="warning" className="text-[10px]">
                        OUTDATED
                      </Badge>
                    </div>

                    <div className="space-y-1 text-slate-600 dark:text-slate-400">
                      {impact.reasons.map((reason: string, rIdx: number) => (
                        <p key={rIdx} className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="text-amber-500">•</span>
                          {reason}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Changed Files Breakdown & Diff Viewer */}
          {fileChanges.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Repository File Changes ({fileChanges.length})
              </h4>

              <div className="space-y-2">
                {fileChanges.map((item: FileChange, idx: number) => (
                  <div
                    key={idx}
                    className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <FileCode className="h-4 w-4 text-brand-500 shrink-0" />
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100 truncate">
                        {item.path}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <Badge
                        variant={item.status === "ADDED" ? "success" : item.status === "REMOVED" ? "danger" : "default"}
                        className="text-[10px]"
                      >
                        {item.status}
                      </Badge>

                      <Button size="sm" variant="outline" onClick={() => setSelectedFile(item)} className="h-7 text-[11px] space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>Inspect Diff</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diff Inspector Modal / Card */}
      {selectedFile && (
        <Card className="border-brand-500/30">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <FileCode className="h-4 w-4 text-brand-500" />
                Diff Details: {selectedFile.path}
              </CardTitle>
              <button onClick={() => setSelectedFile(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-4 space-y-3 font-mono text-xs">
            <div className="p-3 rounded bg-slate-900 text-slate-200 space-y-1">
              <p className="text-slate-400">// Change status: {selectedFile.status}</p>
              {selectedFile.oldSize !== undefined && <p className="text-rose-400">- Previous file size: {selectedFile.oldSize} bytes</p>}
              {selectedFile.newSize !== undefined && <p className="text-emerald-400">+ Updated file size: {selectedFile.newSize} bytes</p>}
              <p className="text-amber-400 mt-2">// Impact summary:</p>
              <p className="text-slate-300">File {selectedFile.path} was modified during repository sync.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

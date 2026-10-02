import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { SearchCode, Filter, Layers, Server, Database, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { CodebaseAnalysisResult } from "@/lib/analyzer/types";

export interface AnalysisTabProps {
  analysis?: CodebaseAnalysisResult | null;
  isLoading?: boolean;
}

export function AnalysisTab({ analysis, isLoading }: AnalysisTabProps) {
  if (isLoading) {
    return (
      <div className="p-8 text-center border border-dashed border-slate-300 dark:border-slate-800 rounded-xl space-y-3">
        <SearchCode className="h-8 w-8 text-brand-500 animate-pulse mx-auto" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Fetching Real Codebase Analysis...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-8 text-center space-y-3">
          <SearchCode className="h-8 w-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">No Analysis Results Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Click &quot;Re-analyze Codebase&quot; above to trigger a real GitHub file tree scan and stack parser.
          </p>
        </CardContent>
      </Card>
    );
  }

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
            <Badge variant={analysis.status === "COMPLETED" ? "success" : "error"}>
              {analysis.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Analysis Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Total Files in Repo</span>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{analysis.totalFileCount}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Scanned / Analyzed</span>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">{analysis.scannedFilesCount}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Filtered / Ignored</span>
              <span className="text-xl font-bold text-slate-400">{analysis.ignoredFileCount} files</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium block">Est. Lines of Code</span>
              <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {analysis.estimatedLinesOfCode.toLocaleString()}
              </span>
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
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {analysis.framework?.name ? `${analysis.framework.name} ${analysis.framework.version || ""}` : "Not Specified / Plain Codebase"}
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span>Package Managers:</span>
                  <span className="font-semibold">
                    {analysis.packageManagers.length > 0 ? analysis.packageManagers.join(", ") : "None Detected"}
                  </span>
                </li>
                <li className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                  <span>Database Systems:</span>
                  <span className="font-semibold">
                    {analysis.databases.length > 0 ? analysis.databases.join(", ") : "None Detected"}
                  </span>
                </li>
              </ul>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-emerald-500" /> Language Distribution
              </h4>
              <div className="space-y-1.5 text-xs">
                {analysis.languages.slice(0, 5).map((l) => (
                  <div key={l.language} className="flex items-center justify-between">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{l.language}</span>
                    <span className="font-mono text-slate-500">
                      {l.percentage}% ({l.fileCount} files)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* API Routes */}
          {analysis.apiRoutes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Server className="h-4 w-4 text-brand-500" /> Detected API Endpoints ({analysis.apiRoutes.length})
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-mono">
                {analysis.apiRoutes.slice(0, 10).map((r, idx) => (
                  <div key={idx} className="px-4 py-2 flex items-center justify-between">
                    <span className="font-bold text-brand-600 dark:text-brand-400">{r.path}</span>
                    <span className="text-slate-400 text-[11px] font-sans">{r.handlerFile}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Database Models */}
          {analysis.databaseModels.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-emerald-500" /> Database Entities & Models ({analysis.databaseModels.length})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {analysis.databaseModels.map((m) => (
                  <div key={m.name} className="p-3 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-800/40 space-y-1">
                    <span className="font-bold font-mono text-slate-900 dark:text-slate-100 block">{m.name}</span>
                    <span className="text-[11px] text-slate-500">{m.fieldsCount} attributes / fields</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies List */}
          {analysis.dependencies.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Parsed Dependencies ({analysis.dependencies.length})
              </h4>
              <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                {analysis.dependencies.slice(0, 30).map((d) => (
                  <span
                    key={d.name}
                    className={`px-2 py-0.5 rounded border ${
                      d.isDevDependency
                        ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                        : "bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border-brand-200 dark:border-brand-800 font-semibold"
                    }`}
                  >
                    {d.name}@{d.version}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Warnings / Notices */}
          {analysis.analysisWarnings.length > 0 && (
            <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Analyzer Notices
              </p>
              <ul className="list-disc pl-4 space-y-0.5">
                {analysis.analysisWarnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

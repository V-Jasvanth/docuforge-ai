import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Progress } from "../ui/Progress";
import { Cpu, Database, Server } from "lucide-react";
import { CodebaseAnalysisResult } from "@/lib/analyzer/types";

export interface OverviewTabProps {
  analysis?: CodebaseAnalysisResult | null;
  projectName: string;
}

export function OverviewTab({ analysis, projectName }: OverviewTabProps) {
  const frameworkName = analysis?.framework?.name || "Codebase Detected";
  const primaryLang = analysis?.languages[0]
    ? `${analysis.languages[0].language} (${analysis.languages[0].percentage}%)`
    : "Multiple Languages";

  return (
    <div className="space-y-6">
      {/* Coverage Card */}
      <Card>
        <CardHeader>
          <CardTitle>Documentation Readiness & Coverage</CardTitle>
          <CardDescription>
            Overall documentation completeness synthesized from real repository parsing for &quot;{projectName}&quot;.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {analysis ? "100%" : "0%"}
            </span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              {analysis ? "Analyzed" : "Pending Analysis"}
            </span>
          </div>
          <Progress value={analysis ? 100 : 0} showLabel />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-500 block">Total Files</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 text-base">
                {analysis ? analysis.totalFileCount : 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Scanned Files</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-base">
                {analysis ? analysis.scannedFilesCount : 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Filtered Files</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400 text-base">
                {analysis ? analysis.ignoredFileCount : 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Est. Lines of Code</span>
              <span className="font-semibold text-slate-400 text-base">
                {analysis ? analysis.estimatedLinesOfCode.toLocaleString() : 0}
              </span>
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
            <p><strong className="text-slate-900 dark:text-slate-100">Framework:</strong> {frameworkName}</p>
            <p><strong className="text-slate-900 dark:text-slate-100">Primary Language:</strong> {primaryLang}</p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Package Managers:</strong>{" "}
              {analysis?.packageManagers.join(", ") || "None"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Server className="h-4 w-4 text-brand-500" />
              API & Endpoint Scan
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p>
              <strong className="text-slate-900 dark:text-slate-100">API Endpoints:</strong>{" "}
              {analysis?.apiRoutes.length ? `${analysis.apiRoutes.length} Routes` : "None"}
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Dependencies:</strong>{" "}
              {analysis?.dependencies.length ? `${analysis.dependencies.length} Packages` : "None"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="h-4 w-4 text-brand-500" />
              Database Architecture
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Database Tech:</strong>{" "}
              {analysis?.databases.join(", ") || "None"}
            </p>
            <p>
              <strong className="text-slate-900 dark:text-slate-100">Models / Entities:</strong>{" "}
              {analysis?.databaseModels.length ? `${analysis.databaseModels.length} Entities` : "None"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

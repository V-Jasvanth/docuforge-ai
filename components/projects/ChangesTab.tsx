import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { AlertTriangle, FileCode, ArrowRight, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

export function ChangesTab() {
  const driftItems = [
    {
      file: "app/api/projects/route.ts",
      changeType: "Modified API parameters & Zod validation schema",
      affectedDocs: ["API Reference", "Environment Variables"],
      severity: "HIGH",
    },
    {
      file: "prisma/schema.prisma",
      changeType: "Added new fields to Project and User models",
      affectedDocs: ["Database Architecture", "Project Overview"],
      severity: "MEDIUM",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                Documentation Drift Detection
              </CardTitle>
              <CardDescription>
                Identifies potentially outdated documentation based on recent repository commits and changed source files.
              </CardDescription>
            </div>
            <Button size="sm" className="space-x-1">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Regenerate Affected Sections</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300">
            <p className="font-semibold">2 Codebase Changes Detected</p>
            <p className="mt-0.5">
              The repository was modified 2 hours ago. Source code updates may cause documentation drift in API Reference and Database sections.
            </p>
          </div>

          <div className="space-y-3">
            {driftItems.map((item, idx) => (
              <div
                key={idx}
                className="p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 font-mono text-slate-900 dark:text-slate-100 font-semibold">
                    <FileCode className="h-4 w-4 text-brand-500" />
                    <span>{item.file}</span>
                  </div>
                  <p className="text-slate-500">{item.changeType}</p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-slate-400">Affects:</span>
                    {item.affectedDocs.map((doc) => (
                      <Badge key={doc} variant="outline" className="text-[10px]">
                        {doc}
                      </Badge>
                    ))}
                  </div>

                  <Button size="sm" variant="outline">
                    Update Section
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

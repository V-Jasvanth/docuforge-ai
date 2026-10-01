import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { GitBranch, Folder, File, ExternalLink, ShieldCheck } from "lucide-react";
import { Badge } from "../ui/Badge";

export function RepositoryTab() {
  const fileTreeSample = [
    { name: "app/", type: "dir", info: "Next.js App Router Pages & API Routes" },
    { name: "components/", type: "dir", info: "Reusable UI & Feature components" },
    { name: "lib/", type: "dir", info: "Core services (ai, analyzer, db, github, doc)" },
    { name: "prisma/", type: "dir", info: "Prisma schema & migrations" },
    { name: "package.json", type: "file", info: "Dependencies & scripts" },
    { name: "tailwind.config.ts", type: "file", info: "Design tokens & theme config" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-brand-500" />
                Connected Repository Information
              </CardTitle>
              <CardDescription>Target branch, commit details, and file structure navigation</CardDescription>
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
                href="https://github.com/V-Jasvanth/Flowboard-Saas"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-brand-600 hover:underline flex items-center gap-1 mt-0.5"
              >
                V-Jasvanth/Flowboard-Saas <ExternalLink className="h-3 w-3" />
              </a>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Active Branch</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                main
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Last Synced Commit</span>
              <span className="font-mono text-slate-800 dark:text-slate-200 mt-0.5 block">
                a7f82b9 (chore: initialize foundation)
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Codebase Tree Preview
            </h4>
            <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-mono">
              {fileTreeSample.map((item) => (
                <div key={item.name} className="px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <div className="flex items-center space-x-2">
                    {item.type === "dir" ? (
                      <Folder className="h-4 w-4 text-amber-500" />
                    ) : (
                      <File className="h-4 w-4 text-slate-400" />
                    )}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                  </div>
                  <span className="text-slate-400 text-[11px] font-sans">{item.info}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

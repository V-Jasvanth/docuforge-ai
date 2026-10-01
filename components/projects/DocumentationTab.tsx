"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { STANDARD_DOC_SECTIONS, DocSectionKey } from "@/lib/documentation/types";
import { FileText, RefreshCw, Edit3, CheckCircle2, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { getStatusBadgeColor } from "@/lib/utils";

interface MockSectionState {
  key: DocSectionKey;
  status: "GENERATED" | "NEEDS_REVIEW" | "OUTDATED" | "NOT_GENERATED";
  lastGenerated: string;
}

const INITIAL_MOCK_SECTIONS: Record<string, MockSectionState> = {
  readme: { key: "readme", status: "GENERATED", lastGenerated: "10 mins ago" },
  overview: { key: "overview", status: "GENERATED", lastGenerated: "10 mins ago" },
  architecture: { key: "architecture", status: "GENERATED", lastGenerated: "10 mins ago" },
  installation: { key: "installation", status: "GENERATED", lastGenerated: "10 mins ago" },
  environment_variables: { key: "environment_variables", status: "NEEDS_REVIEW", lastGenerated: "2 days ago" },
  api_reference: { key: "api_reference", status: "OUTDATED", lastGenerated: "3 days ago" },
  database: { key: "database", status: "GENERATED", lastGenerated: "10 mins ago" },
  folder_structure: { key: "folder_structure", status: "GENERATED", lastGenerated: "10 mins ago" },
  configuration: { key: "configuration", status: "GENERATED", lastGenerated: "10 mins ago" },
  deployment: { key: "deployment", status: "GENERATED", lastGenerated: "10 mins ago" },
  development: { key: "development", status: "GENERATED", lastGenerated: "10 mins ago" },
  troubleshooting: { key: "troubleshooting", status: "NOT_GENERATED", lastGenerated: "Never" },
  contributing: { key: "contributing", status: "GENERATED", lastGenerated: "10 mins ago" },
};

export function DocumentationTab() {
  const [selectedSection, setSelectedSection] = useState<DocSectionKey>("readme");
  const [sections, setSections] = useState(INITIAL_MOCK_SECTIONS);
  const activeSpec = STANDARD_DOC_SECTIONS.find((s) => s.key === selectedSection);
  const activeState = sections[selectedSection] || { status: "NOT_GENERATED", lastGenerated: "Never" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sidebar Section List */}
      <div className="lg:col-span-4 space-y-3">
        <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
            Documentation Sections
          </h3>
          <div className="space-y-1">
            {STANDARD_DOC_SECTIONS.map((sec) => {
              const state = sections[sec.key] || { status: "NOT_GENERATED" };
              const isSelected = selectedSection === sec.key;

              return (
                <button
                  key={sec.key}
                  onClick={() => setSelectedSection(sec.key)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
                    isSelected
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 font-semibold border border-brand-200 dark:border-brand-800"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <FileText className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${getStatusBadgeColor(state.status)}`}>
                    {state.status.replace("_", " ")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Documentation Editor / Viewer Workspace */}
      <div className="lg:col-span-8">
        <Card className="min-h-[600px] flex flex-col justify-between">
          <CardHeader className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-500" />
                  {activeSpec?.title}
                </CardTitle>
                <CardDescription className="mt-1">{activeSpec?.description}</CardDescription>
              </div>

              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" className="space-x-1">
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Edit Section</span>
                </Button>
                <Button size="sm" className="space-x-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Regenerate AI</span>
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 flex-1 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/50">
              <div className="flex items-center space-x-3">
                <span>Status: <strong className="text-slate-900 dark:text-slate-100">{activeState.status.replace("_", " ")}</strong></span>
                <span>·</span>
                <span>Last Generated: <strong className="text-slate-900 dark:text-slate-100">{activeState.lastGenerated}</strong></span>
              </div>
              <span className="font-mono text-[11px]">v1.0.0</span>
            </div>

            {/* Markdown Preview Area */}
            <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed space-y-4 p-4 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/30 dark:bg-slate-900/30">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                # {activeSpec?.title} — DocuForge AI Foundation
              </h2>
              <p>
                This technical section is managed by DocuForge AI. The pipeline transforms codebase parsing into structured, verified markdown documentation.
              </p>
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded border font-mono text-[11px]">
                <code>
                  {`// Section Key: ${selectedSection}\n// Status: ${activeState.status}\n// Service Architecture Ready for AI API Provider`}
                </code>
              </div>
              <p>
                Developers can review, edit inline, or trigger individual section AI regeneration whenever codebase changes occur.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

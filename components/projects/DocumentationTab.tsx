"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card";
import { Button } from "../ui/Button";
import { STANDARD_DOC_SECTIONS, DocSectionKey } from "@/lib/documentation/types";
import {
  FileText,
  RefreshCw,
  Edit3,
  CheckCircle2,
  Sparkles,
  Save,
  Eye,
  Loader2,
  AlertCircle,
  Download,
  FileArchive,
  FileType,
  History,
  AlertTriangle,
} from "lucide-react";
import { getStatusBadgeColor } from "@/lib/utils";

export interface DocumentationTabProps {
  projectId: string;
}

export function DocumentationTab({ projectId }: DocumentationTabProps) {
  const [selectedSectionKey, setSelectedSectionKey] = useState<DocSectionKey>("readme");
  const [sectionsMap, setSectionsMap] = useState<Record<string, { id?: string; content: string; status: string; lastGeneratedAt?: string }>>({});
  const [versions, setVersions] = useState<Array<{ id: string; version: string; createdAt: string; changelog?: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [generationStep, setGenerationStep] = useState<string | null>(null);
  const [isRegeneratingSection, setIsRegeneratingSection] = useState(false);
  const [isRegeneratingOutdated, setIsRegeneratingOutdated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchDocumentation = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/documentation`);
      const json = await res.json();
      if (res.ok && json.data?.sections) {
        const map: Record<string, any> = {};
        json.data.sections.forEach((sec: any) => {
          map[sec.key] = {
            id: sec.id,
            content: sec.content,
            status: sec.status,
            lastGeneratedAt: sec.lastGeneratedAt,
          };
        });
        setSectionsMap(map);
      }

      // Fetch version history
      const vRes = await fetch(`/api/projects/${projectId}/documentation/versions`);
      const vJson = await vRes.json();
      if (vRes.ok && vJson.data) {
        setVersions(vJson.data);
      }
    } catch {
      // Fallback cleanly
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchDocumentation();
  }, [fetchDocumentation]);

  const activeSpec = STANDARD_DOC_SECTIONS.find((s) => s.key === selectedSectionKey);
  const activeSectionData = sectionsMap[selectedSectionKey] || {
    content: "",
    status: "NOT_GENERATED",
    lastGeneratedAt: undefined,
  };

  const outdatedCount = Object.values(sectionsMap).filter((s) => s.status === "OUTDATED" || s.status === "NEEDS_REVIEW").length;

  useEffect(() => {
    setEditedContent(activeSectionData.content || `# ${activeSpec?.title || "Section"}\n\nNot generated yet. Click "Generate All Documentation" or "Regenerate AI" to build this section.`);
    setIsEditMode(false);
  }, [selectedSectionKey, activeSectionData.content, activeSpec?.title]);

  const handleGenerateAll = async () => {
    if (!projectId || isGeneratingAll) return;
    setIsGeneratingAll(true);
    setNotification(null);

    const steps = [
      "Preparing codebase analysis context...",
      "Generating README & Project Overview...",
      "Generating Architecture & API Reference...",
      "Generating Database & Configuration guides...",
      "Finalizing & saving version snapshots...",
    ];

    let stepIndex = 0;
    setGenerationStep(steps[0]);

    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex < steps.length) {
        setGenerationStep(steps[stepIndex]);
      }
    }, 900);

    try {
      const res = await fetch(`/api/projects/${projectId}/documentation/generate`, {
        method: "POST",
      });
      const json = await res.json();

      clearInterval(stepInterval);

      if (res.ok && json.success) {
        setNotification({ type: "success", message: "All 13 documentation sections generated successfully!" });
        await fetchDocumentation();
      } else {
        setNotification({ type: "error", message: json.error || "Documentation generation failed." });
      }
    } catch (err: unknown) {
      clearInterval(stepInterval);
      const msg = err instanceof Error ? err.message : "Network error generating documentation.";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsGeneratingAll(false);
      setGenerationStep(null);
    }
  };

  const handleRegenerateOutdated = async () => {
    if (!projectId || isRegeneratingOutdated) return;
    setIsRegeneratingOutdated(true);
    setNotification(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/documentation/drift/regenerate-outdated`, {
        method: "POST",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setNotification({ type: "success", message: json.message || "Regenerated outdated sections!" });
        await fetchDocumentation();
      } else {
        setNotification({ type: "error", message: json.error || "Failed to regenerate outdated sections." });
      }
    } catch {
      setNotification({ type: "error", message: "Network error regenerating outdated sections." });
    } finally {
      setIsRegeneratingOutdated(false);
    }
  };

  const handleRegenerateSingleSection = async () => {
    if (!projectId || isRegeneratingSection) return;
    setIsRegeneratingSection(true);
    setNotification(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/documentation/${selectedSectionKey}/regenerate`, {
        method: "POST",
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setNotification({ type: "success", message: `Section '${activeSpec?.title}' regenerated successfully!` });
        await fetchDocumentation();
      } else {
        setNotification({ type: "error", message: json.error || "Section regeneration failed." });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error regenerating section.";
      setNotification({ type: "error", message: msg });
    } finally {
      setIsRegeneratingSection(false);
    }
  };

  const handleSaveEdits = async () => {
    if (!projectId || isSaving) return;
    setIsSaving(true);
    setNotification(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/documentation/${selectedSectionKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionKey: selectedSectionKey,
          content: editedContent,
          title: activeSpec?.title,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setNotification({ type: "success", message: `Saved edits for '${activeSpec?.title}'` });
        setIsEditMode(false);
        await fetchDocumentation();
      } else {
        setNotification({ type: "error", message: json.error || "Failed to save edits." });
      }
    } catch {
      setNotification({ type: "error", message: "Network error saving edits." });
    } font-sans finally {
      setIsSaving(false);
    }
  };

  const triggerExport = (format: "readme" | "zip" | "pdf") => {
    window.open(`/api/projects/${projectId}/documentation/export/${format}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Export & Action Header Toolbar */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileText className="h-4 w-4 text-brand-500" />
            Documentation Exports & Tools
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Export complete documentation bundle as Markdown, ZIP, or PDF.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => triggerExport("readme")} className="text-xs space-x-1">
            <Download className="h-3.5 w-3.5" />
            <span>Export README.md</span>
          </Button>

          <Button variant="outline" size="sm" onClick={() => triggerExport("zip")} className="text-xs space-x-1">
            <FileArchive className="h-3.5 w-3.5" />
            <span>Export ZIP</span>
          </Button>

          <Button variant="outline" size="sm" onClick={() => triggerExport("pdf")} className="text-xs space-x-1">
            <FileType className="h-3.5 w-3.5" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            notification.type === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          }`}
        >
          <div className="flex items-center space-x-2">
            {notification.type === "success" ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Outdated Sections Banner */}
      {outdatedCount > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
            <span>
              <strong>{outdatedCount} section(s)</strong> are marked as outdated due to recent code changes.
            </span>
          </div>
          <Button size="sm" onClick={handleRegenerateOutdated} isLoading={isRegeneratingOutdated} className="h-7 text-xs space-x-1">
            <RefreshCw className="h-3 w-3" />
            <span>Regenerate Outdated</span>
          </Button>
        </div>
      )}

      {/* Progress Notification Banner during Generate All */}
      {isGeneratingAll && (
        <div className="p-4 rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-600 dark:text-brand-300 text-xs flex items-center space-x-3 animate-pulse">
          <Loader2 className="h-5 w-5 animate-spin text-brand-500 shrink-0" />
          <div>
            <span className="font-bold">DocuForge AI Pipeline Active</span>
            <p className="text-slate-600 dark:text-slate-400 mt-0.5">{generationStep || "Generating technical documentation..."}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar Section List & Version History */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between px-2 pt-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Doc Sections (13)
              </h3>
              <Button
                size="sm"
                onClick={handleGenerateAll}
                isLoading={isGeneratingAll}
                className="text-xs h-8 px-2.5 space-x-1"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Generate All</span>
              </Button>
            </div>

            <div className="space-y-1">
              {STANDARD_DOC_SECTIONS.map((sec) => {
                const state = sectionsMap[sec.key] || { status: "NOT_GENERATED" };
                const isSelected = selectedSectionKey === sec.key;

                return (
                  <button
                    key={sec.key}
                    onClick={() => setSelectedSectionKey(sec.key)}
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

          {/* Version Snapshots Card */}
          {versions.length > 0 && (
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
              <h4 className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 px-1 pt-1">
                <History className="h-3.5 w-3.5 text-brand-500" />
                Version History ({versions.length})
              </h4>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {versions.map((ver) => (
                  <div key={ver.id} className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-[11px]">
                    <span className="font-mono font-bold text-brand-600 dark:text-brand-400">v{ver.version}</span>
                    <span className="text-slate-400">{new Date(ver.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Documentation Editor / Viewer Workspace */}
        <div className="lg:col-span-8">
          <Card className="min-h-[650px] flex flex-col justify-between">
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
                  {isEditMode ? (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setIsEditMode(false)} className="space-x-1">
                        <Eye className="h-3.5 w-3.5" />
                        <span>Preview</span>
                      </Button>
                      <Button size="sm" onClick={handleSaveEdits} isLoading={isSaving} className="space-x-1">
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Edits</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={() => setIsEditMode(true)} className="space-x-1">
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Edit Markdown</span>
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleRegenerateSingleSection}
                        isLoading={isRegeneratingSection}
                        className="space-x-1"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Regenerate AI</span>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 flex-1 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <span>
                    Status: <strong className="text-slate-900 dark:text-slate-100">{activeSectionData.status.replace("_", " ")}</strong>
                  </span>
                  <span>·</span>
                  <span>
                    Last Generated:{" "}
                    <strong className="text-slate-900 dark:text-slate-100">
                      {activeSectionData.lastGeneratedAt ? new Date(activeSectionData.lastGeneratedAt).toLocaleString() : "Not generated yet"}
                    </strong>
                  </span>
                </div>
                <span className="font-mono text-[11px]">Key: {selectedSectionKey}</span>
              </div>

              {/* View / Edit Mode Toggle */}
              {isEditMode ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Markdown Editor</label>
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={20}
                    className="w-full font-mono text-xs p-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-900 text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500 leading-relaxed resize-y"
                  />
                </div>
              ) : (
                /* Markdown Preview Area */
                <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed space-y-4 p-5 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/30 dark:bg-slate-900/30 whitespace-pre-wrap font-sans">
                  {editedContent}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

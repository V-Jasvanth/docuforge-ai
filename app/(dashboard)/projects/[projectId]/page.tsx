"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { OverviewTab } from "@/components/projects/OverviewTab";
import { RepositoryTab } from "@/components/projects/RepositoryTab";
import { AnalysisTab } from "@/components/projects/AnalysisTab";
import { DocumentationTab } from "@/components/projects/DocumentationTab";
import { ChangesTab } from "@/components/projects/ChangesTab";
import { SettingsTab } from "@/components/projects/SettingsTab";
import { CodebaseAnalysisResult } from "@/lib/analyzer/types";
import {
  LayoutDashboard,
  GitBranch,
  SearchCode,
  FileText,
  AlertTriangle,
  Settings,
} from "lucide-react";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = (params?.projectId as string) || "";
  const [activeTab, setActiveTab] = useState("overview");

  const [projectData, setProjectData] = useState<any>(null);
  const [analysisData, setAnalysisData] = useState<CodebaseAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setProjectData(json.data.project);
        if (json.data.latestAnalysis?.summary) {
          setAnalysisData(json.data.latestAnalysis.summary as CodebaseAnalysisResult);
        }
      } else {
        setErrorMsg(json.error || "Failed to load project details.");
      }
    } catch {
      setErrorMsg("Failed to connect to server.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectDetails();
  }, [fetchProjectDetails]);

  const handleTriggerAnalysis = async () => {
    if (!projectId || isAnalyzing) return;
    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setAnalysisData(json.data.summary);
        await fetchProjectDetails();
      } else {
        setErrorMsg(json.error || "Analysis failed.");
      }
    } catch {
      setErrorMsg("Network error during analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const workspaceTabs: TabItem[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard /> },
    { id: "repository", label: "Repository", icon: <GitBranch /> },
    { id: "analysis", label: "Code Analysis", icon: <SearchCode /> },
    { id: "documentation", label: "Documentation", icon: <FileText />, badge: 13 },
    { id: "changes", label: "Changes & Drift", icon: <AlertTriangle />, badge: 2 },
    { id: "settings", label: "Settings", icon: <Settings /> },
  ];

  const projectName = projectData?.name || "Project Workspace";
  const repoName = projectData?.repository
    ? `${projectData.repository.owner}/${projectData.repository.name}`
    : "Connected Repository";
  const branchName = projectData?.repository?.branch || "main";
  const frameworkName = projectData?.framework || analysisData?.framework?.name || "Codebase Detected";
  const languagesList = projectData?.languages || analysisData?.languages?.map((l) => l.language) || [];
  const statusStr = projectData?.status || "IDLE";
  const lastAnalyzed = projectData?.lastAnalyzedAt
    ? new Date(projectData.lastAnalyzedAt).toLocaleString()
    : "Not analyzed yet";

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="underline font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Project Workspace Header */}
      <ProjectHeader
        projectId={projectId}
        name={projectName}
        repo={repoName}
        branch={branchName}
        framework={frameworkName}
        languages={languagesList}
        status={statusStr}
        lastAnalyzed={lastAnalyzed}
        onReanalyze={handleTriggerAnalysis}
        isAnalyzing={isAnalyzing}
      />

      {/* Navigation Tabs */}
      <Tabs tabs={workspaceTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Workspace Tab Contents */}
      <div className="pt-2">
        {activeTab === "overview" && <OverviewTab analysis={analysisData} projectName={projectName} />}
        {activeTab === "repository" && <RepositoryTab repository={projectData?.repository} analysis={analysisData} />}
        {activeTab === "analysis" && <AnalysisTab analysis={analysisData} isLoading={isLoading} />}
        {activeTab === "documentation" && <DocumentationTab projectId={projectId} />}
        {activeTab === "changes" && <ChangesTab projectId={projectId} />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

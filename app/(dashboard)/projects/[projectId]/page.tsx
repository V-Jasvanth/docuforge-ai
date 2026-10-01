"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { ProjectHeader } from "@/components/projects/ProjectHeader";
import { Tabs, TabItem } from "@/components/ui/Tabs";
import { OverviewTab } from "@/components/projects/OverviewTab";
import { RepositoryTab } from "@/components/projects/RepositoryTab";
import { AnalysisTab } from "@/components/projects/AnalysisTab";
import { DocumentationTab } from "@/components/projects/DocumentationTab";
import { ChangesTab } from "@/components/projects/ChangesTab";
import { SettingsTab } from "@/components/projects/SettingsTab";
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
  const projectId = (params?.projectId as string) || "demo-1";
  const [activeTab, setActiveTab] = useState("overview");

  const workspaceTabs: TabItem[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard /> },
    { id: "repository", label: "Repository", icon: <GitBranch /> },
    { id: "analysis", label: "Code Analysis", icon: <SearchCode /> },
    { id: "documentation", label: "Documentation", icon: <FileText />, badge: 13 },
    { id: "changes", label: "Changes & Drift", icon: <AlertTriangle />, badge: 2 },
    { id: "settings", label: "Settings", icon: <Settings /> },
  ];

  return (
    <div className="space-y-6">
      {/* Project Workspace Header */}
      <ProjectHeader
        name="FlowBoard SaaS"
        repo="V-Jasvanth/Flowboard-Saas"
        branch="main"
        framework="Next.js App Router"
        languages={["TypeScript", "CSS", "JSON"]}
        status="Analyzed"
        lastAnalyzed="10 mins ago"
      />

      {/* Navigation Tabs */}
      <Tabs tabs={workspaceTabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Workspace Tab Contents */}
      <div className="pt-2">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "repository" && <RepositoryTab />}
        {activeTab === "analysis" && <AnalysisTab />}
        {activeTab === "documentation" && <DocumentationTab />}
        {activeTab === "changes" && <ChangesTab />}
        {activeTab === "settings" && <SettingsTab />}
      </div>
    </div>
  );
}

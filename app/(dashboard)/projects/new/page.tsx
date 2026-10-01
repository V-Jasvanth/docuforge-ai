"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, GitBranch, Sparkles, FolderGit2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";

export default function NewProjectPage() {
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = "/projects/demo-1";
    }, 700);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/projects" className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 space-x-1">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Projects</span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-brand-500" />
            Connect New Project
          </CardTitle>
          <CardDescription>
            Connect a GitHub repository or enter project details for AI codebase analysis & documentation generation.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Project Name"
              placeholder="e.g. FlowBoard SaaS"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="GitHub Repository URL"
              placeholder="https://github.com/owner/repository"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
            />

            <Input
              label="Target Branch"
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
            />

            <Textarea
              label="Project Description (Optional)"
              placeholder="Brief description of the codebase or system purpose..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Initial Analysis Pipeline:</p>
              <p>Upon submission, the Codebase Analyzer will scan files, exclude node_modules, detect dependencies, and prepare structured project metadata.</p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <Link href="/projects">
              <Button type="button" variant="outline" size="sm">
                Cancel
              </Button>
            </Link>
            <Button type="submit" size="sm" isLoading={isLoading} className="space-x-1">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Initialize Project</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

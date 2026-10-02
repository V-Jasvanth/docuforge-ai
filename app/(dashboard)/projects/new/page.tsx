"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, FolderGit2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { parseGitHubUrl } from "@/lib/validation";

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRepoUrlChange = (val: string) => {
    setRepoUrl(val);
    setErrorMessage(null);

    // Auto-fill project name if empty
    if (!name.trim() && val.trim()) {
      const parsed = parseGitHubUrl(val);
      if (parsed) {
        setName(parsed.repo.charAt(0).toUpperCase() + parsed.repo.slice(1));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      setErrorMessage("Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repository)");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || parsed.repo,
          repositoryUrl: parsed.url,
          branch: branch.trim() || "main",
          description: description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create project.");
      }

      const createdProject = data.data;

      // Trigger repository tree scan
      fetch(`/api/projects/${createdProject.id}/analyze`, { method: "POST" }).catch(() => {});

      // Redirect to project workspace
      router.push(`/projects/${createdProject.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 space-x-1"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Projects</span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FolderGit2 className="h-5 w-5 text-brand-500" />
            Connect GitHub Repository
          </CardTitle>
          <CardDescription>
            Enter a public or authorized GitHub repository URL. DocuForge AI will parse its file tree, detect technology stacks, and store structured metadata.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Input
              label="GitHub Repository URL"
              placeholder="https://github.com/facebook/react"
              value={repoUrl}
              onChange={(e) => handleRepoUrlChange(e.target.value)}
              required
            />

            <Input
              label="Project Name"
              placeholder="e.g. React Core Engine"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              placeholder="Brief summary of codebase purpose or system architecture..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200/60 dark:border-slate-700/50 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 dark:text-slate-300">Analysis Safety & Security:</p>
              <p>DocuForge AI inspects GitHub REST file trees and package manifests. It never executes repository code, runs npm install, or downloads binary artifacts.</p>
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
              <span>Connect & Analyze Repository</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

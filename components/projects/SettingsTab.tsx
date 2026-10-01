"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/Card";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Settings, Save, Trash2 } from "lucide-react";

export function SettingsTab() {
  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-brand-500" />
            Project Settings
          </CardTitle>
          <CardDescription>Configure project metadata, repository target branch, and analysis preferences</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input label="Project Name" defaultValue="FlowBoard SaaS" />
          <Textarea
            label="Project Description"
            defaultValue="Interactive kanban and workflow management platform for modern engineering teams."
            rows={3}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Target Branch" defaultValue="main" />
            <Input label="Framework Override" defaultValue="Next.js App Router" />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
          <Button size="sm" className="space-x-1">
            <Save className="h-3.5 w-3.5" />
            <span>Save Settings</span>
          </Button>
        </CardFooter>
      </Card>

      <Card className="border-rose-200 dark:border-rose-950/50">
        <CardHeader>
          <CardTitle className="text-rose-600 dark:text-rose-400 text-base">Danger Zone</CardTitle>
          <CardDescription>Permanently remove this project and all associated documentation history</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-500">
            Once deleted, all generated documentation sections, analysis history, and snapshots cannot be recovered.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="danger" size="sm" className="space-x-1">
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Project</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

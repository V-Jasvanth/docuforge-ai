import {
  ProjectStatus,
  AnalysisStatus,
  DocSectionStatus,
  ActivityType,
} from "@prisma/client";

export interface UserSession {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string | null;
  repository?: {
    name: string;
    owner: string;
    branch: string;
  } | null;
  framework?: string | null;
  languages: string[];
  status: ProjectStatus;
  lastAnalyzedAt?: Date | string | null;
  lastDocGeneratedAt?: Date | string | null;
  docVersion: string;
  docCompletionPercentage: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ActivityItem {
  id: string;
  projectId?: string | null;
  userId: string;
  type: ActivityType;
  title: string;
  description?: string | null;
  createdAt: Date | string;
}

export interface NavItem {
  title: string;
  href: string;
  icon: string;
  badge?: string | number;
  disabled?: boolean;
}

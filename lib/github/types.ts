export interface GitHubRepoMetadata {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  htmlUrl: string;
  description: string | null;
  defaultBranch: string;
  language: string | null;
  stargazersCount: number;
  updatedAt: string;
}

export interface GitHubBranch {
  name: string;
  sha: string;
  protected: boolean;
}

export interface GitHubFileNode {
  path: string;
  type: "file" | "dir";
  size: number;
  sha: string;
  url: string;
}

export interface GitHubCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
}

export interface GitHubServiceStatus {
  isConfigured: boolean;
  message: string;
}

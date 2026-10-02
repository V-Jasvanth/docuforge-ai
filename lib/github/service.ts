import {
  GitHubRepoMetadata,
  GitHubBranch,
  GitHubFileNode,
  GitHubCommit,
  GitHubServiceStatus,
} from "./types";
import { parseGitHubUrl, ParsedGitHubUrl } from "@/lib/validation";

export class GitHubService {
  private clientId: string | undefined;
  private clientSecret: string | undefined;
  private token: string | undefined;

  constructor() {
    // Keep secrets server-side
    this.clientId = process.env.GITHUB_CLIENT_ID;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET;
    this.token = process.env.GITHUB_TOKEN;
  }

  public getStatus(): GitHubServiceStatus {
    const isConfigured = Boolean(this.token || (this.clientId && this.clientSecret));
    return {
      isConfigured,
      message: isConfigured
        ? "GitHub authentication configured for expanded rate limits."
        : "Public GitHub API access active (Unauthenticated mode).",
    };
  }

  public parseUrl(url: string): ParsedGitHubUrl | null {
    return parseGitHubUrl(url);
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DocuForge-AI-Codebase-Analyzer",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    } else if (this.clientId && this.clientSecret) {
      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
      headers["Authorization"] = `Basic ${credentials}`;
    }

    return headers;
  }

  public async getRepositoryMetadata(owner: string, repo: string): Promise<GitHubRepoMetadata> {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const res = await fetch(url, { headers: this.getHeaders(), cache: "no-store" });

    if (res.status === 404) {
      throw new Error(`GitHub Repository '${owner}/${repo}' not found or is private.`);
    }

    if (res.status === 403) {
      const rateLimitReset = res.headers.get("x-ratelimit-reset");
      throw new Error(
        `GitHub API rate limit exceeded. ${
          rateLimitReset ? `Resets at ${new Date(Number(rateLimitReset) * 1000).toLocaleTimeString()}` : ""
        }`
      );
    }

    if (!res.ok) {
      throw new Error(`GitHub API error (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      owner: data.owner?.login || owner,
      private: data.private ?? false,
      htmlUrl: data.html_url,
      description: data.description || null,
      defaultBranch: data.default_branch || "main",
      language: data.language || null,
      stargazersCount: data.stargazers_count || 0,
      updatedAt: data.updated_at || new Date().toISOString(),
    };
  }

  public async getFileTree(owner: string, repo: string, branch: string = "main"): Promise<GitHubFileNode[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
    const res = await fetch(url, { headers: this.getHeaders(), cache: "no-store" });

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(`Branch '${branch}' or tree not found for repository '${owner}/${repo}'.`);
      }
      throw new Error(`GitHub API error fetching file tree (${res.status}): ${res.statusText}`);
    }

    const data = await res.json();
    const tree: Array<{ path: string; type: string; size?: number; sha: string; url: string }> = data.tree || [];

    return tree.map((item) => ({
      path: item.path,
      type: item.type === "tree" ? "dir" : "file",
      size: item.size || 0,
      sha: item.sha,
      url: item.url,
    }));
  }

  public async getFileContent(owner: string, repo: string, path: string, branch: string = "main"): Promise<string> {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const res = await fetch(rawUrl, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
      cache: "no-store",
    });

    if (!res.ok) {
      // Fallback to official API if raw endpoint returns 404 or restricted
      const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const apiRes = await fetch(apiUrl, { headers: this.getHeaders(), cache: "no-store" });
      if (!apiRes.ok) {
        throw new Error(`Unable to fetch content for file '${path}' (${res.status}).`);
      }
      const apiData = await apiRes.json();
      if (apiData.encoding === "base64" && apiData.content) {
        return Buffer.from(apiData.content, "base64").toString("utf-8");
      }
      throw new Error(`File content format unsupported for '${path}'.`);
    }

    return await res.text();
  }

  public async listBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/branches`;
    const res = await fetch(url, { headers: this.getHeaders(), cache: "no-store" });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.map((b: { name: string; commit: { sha: string }; protected?: boolean }) => ({
      name: b.name,
      sha: b.commit?.sha || "",
      protected: Boolean(b.protected),
    }));
  }

  public async getRecentCommits(owner: string, repo: string, branch: string = "main"): Promise<GitHubCommit[]> {
    const url = `https://api.github.com/repos/${owner}/${repo}/commits?sha=${branch}&per_page=5`;
    const res = await fetch(url, { headers: this.getHeaders(), cache: "no-store" });

    if (!res.ok) {
      return [];
    }

    const data = await res.json();
    return data.map((item: { sha: string; commit: { message: string; author: { name: string; email: string; date: string } } }) => ({
      sha: item.sha,
      message: item.commit?.message || "",
      author: {
        name: item.commit?.author?.name || "Unknown",
        email: item.commit?.author?.email || "",
        date: item.commit?.author?.date || new Date().toISOString(),
      },
    }));
  }
}

export const gitHubService = new GitHubService();

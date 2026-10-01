import {
  GitHubRepoMetadata,
  GitHubBranch,
  GitHubFileNode,
  GitHubCommit,
  GitHubServiceStatus,
} from "./types";

export class GitHubService {
  private clientId: string | undefined;
  private clientSecret: string | undefined;

  constructor() {
    // Ensure credentials stay strictly server-side
    this.clientId = process.env.GITHUB_CLIENT_ID;
    this.clientSecret = process.env.GITHUB_CLIENT_SECRET;
  }

  public getStatus(): GitHubServiceStatus {
    const isConfigured = Boolean(this.clientId && this.clientSecret);
    return {
      isConfigured,
      message: isConfigured
        ? "GitHub integration is configured."
        : "GitHub client secrets are not set in environment variables.",
    };
  }

  public async getRepositoryMetadata(owner: string, repo: string): Promise<GitHubRepoMetadata> {
    this.assertConfigured();
    throw new Error(
      `GitHub Service: Direct API access for ${owner}/${repo} is not implemented in initialization phase.`
    );
  }

  public async listBranches(_owner: string, _repo: string): Promise<GitHubBranch[]> {
    this.assertConfigured();
    throw new Error("GitHub Service: Branch listing is not implemented in initialization phase.");
  }

  public async getFileTree(_owner: string, _repo: string, _branch: string = "main"): Promise<GitHubFileNode[]> {
    this.assertConfigured();
    throw new Error("GitHub Service: File tree fetching is not implemented in initialization phase.");
  }

  public async getFileContent(_owner: string, _repo: string, _path: string, _branch: string = "main"): Promise<string> {
    this.assertConfigured();
    throw new Error("GitHub Service: File content reading is not implemented in initialization phase.");
  }

  public async getRecentCommits(_owner: string, _repo: string, _branch: string = "main"): Promise<GitHubCommit[]> {
    this.assertConfigured();
    throw new Error("GitHub Service: Commit history retrieval is not implemented in initialization phase.");
  }

  private assertConfigured(): void {
    const status = this.getStatus();
    if (!status.isConfigured) {
      throw new Error(`GitHub Service Error: ${status.message}`);
    }
  }
}

export const gitHubService = new GitHubService();

import { AIProvider } from "./provider.ts";
import {
  AIGenerateOptions,
  AISummarizeOptions,
  AIAnalyzeCodeOptions,
  AIDocGenerationRequest,
  AIDocGenerationResponse,
  AIProviderStatus,
} from "./types.ts";

export class UnconfiguredAIProvider implements AIProvider {
  public name = "Unconfigured AI Provider";

  async getStatus(): Promise<AIProviderStatus> {
    return {
      isConfigured: false,
      providerName: this.name,
      modelName: "none",
      message: "AI provider API key is not configured. Please set AI_API_KEY and AI_PROVIDER in environment variables.",
    };
  }

  async generateText(_options: AIGenerateOptions): Promise<string> {
    throw new Error(
      "AI Service Error: No active AI provider configured. Set AI_API_KEY in your environment variables to enable documentation generation."
    );
  }

  async summarizeCode(_options: AISummarizeOptions): Promise<string> {
    throw new Error(
      "AI Service Error: Code summarization requires an active AI provider key."
    );
  }

  async analyzeCodebase(_options: AIAnalyzeCodeOptions): Promise<Record<string, unknown>> {
    throw new Error(
      "AI Service Error: Codebase AI analysis requires an active AI provider key."
    );
  }

  async generateDocumentationSection(_request: AIDocGenerationRequest): Promise<AIDocGenerationResponse> {
    throw new Error(
      "AI Service Error: Documentation generation is unconfigured. Please connect an AI provider key."
    );
  }

  async regenerateSection(_request: AIDocGenerationRequest): Promise<AIDocGenerationResponse> {
    throw new Error(
      "AI Service Error: Section regeneration is unconfigured. Please connect an AI provider key."
    );
  }
}

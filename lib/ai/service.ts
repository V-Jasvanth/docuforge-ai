import { AIProvider } from "./provider";
import { UnconfiguredAIProvider } from "./placeholder-provider";
import {
  AIGenerateOptions,
  AISummarizeOptions,
  AIAnalyzeCodeOptions,
  AIDocGenerationRequest,
  AIDocGenerationResponse,
  AIProviderStatus,
} from "./types";

export class AIService {
  private static instance: AIService;
  private provider: AIProvider;

  private constructor() {
    this.provider = this.resolveProvider();
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private resolveProvider(): AIProvider {
    const apiKey = process.env.AI_API_KEY;
    const providerName = process.env.AI_PROVIDER || "mock";

    if (!apiKey || apiKey.trim() === "" || providerName === "mock") {
      return new UnconfiguredAIProvider();
    }

    // Provider switching architecture ready for OpenAI, Anthropic, Gemini, etc.
    return new UnconfiguredAIProvider();
  }

  public async getStatus(): Promise<AIProviderStatus> {
    return this.provider.getStatus();
  }

  public async generateText(options: AIGenerateOptions): Promise<string> {
    return this.provider.generateText(options);
  }

  public async summarizeCode(options: AISummarizeOptions): Promise<string> {
    return this.provider.summarizeCode(options);
  }

  public async analyzeCodebase(options: AIAnalyzeCodeOptions): Promise<Record<string, unknown>> {
    return this.provider.analyzeCodebase(options);
  }

  public async generateDocumentationSection(request: AIDocGenerationRequest): Promise<AIDocGenerationResponse> {
    return this.provider.generateDocumentationSection(request);
  }

  public async regenerateSection(request: AIDocGenerationRequest): Promise<AIDocGenerationResponse> {
    return this.provider.regenerateSection(request);
  }
}

export const aiService = AIService.getInstance();

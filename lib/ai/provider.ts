import {
  AIGenerateOptions,
  AISummarizeOptions,
  AIAnalyzeCodeOptions,
  AIDocGenerationRequest,
  AIDocGenerationResponse,
  AIProviderStatus,
} from "./types";

export interface AIProvider {
  name: string;
  getStatus(): Promise<AIProviderStatus>;
  generateText(options: AIGenerateOptions): Promise<string>;
  summarizeCode(options: AISummarizeOptions): Promise<string>;
  analyzeCodebase(options: AIAnalyzeCodeOptions): Promise<Record<string, unknown>>;
  generateDocumentationSection(request: AIDocGenerationRequest): Promise<AIDocGenerationResponse>;
  regenerateSection(request: AIDocGenerationRequest): Promise<AIDocGenerationResponse>;
}

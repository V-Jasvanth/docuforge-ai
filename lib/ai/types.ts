export interface AIGenerateOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AISummarizeOptions {
  code: string;
  language: string;
  filePath: string;
  context?: string;
}

export interface AIAnalyzeCodeOptions {
  files: Array<{ path: string; content: string; language?: string }>;
  framework?: string;
}

export interface AIDocGenerationRequest {
  sectionKey: string;
  sectionTitle: string;
  projectAnalysisContext: Record<string, unknown>;
  existingContent?: string;
  instructions?: string;
}

export interface AIDocGenerationResponse {
  sectionKey: string;
  content: string;
  tokensUsed?: number;
  providerName: string;
  generatedAt: Date;
}

export interface AIProviderStatus {
  isConfigured: boolean;
  providerName: string;
  modelName: string;
  message: string;
}

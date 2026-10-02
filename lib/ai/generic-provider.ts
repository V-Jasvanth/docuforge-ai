import { AIProvider } from "./provider.ts";
import {
  AIGenerateOptions,
  AISummarizeOptions,
  AIAnalyzeCodeOptions,
  AIDocGenerationRequest,
  AIDocGenerationResponse,
  AIProviderStatus,
} from "./types.ts";
import { documentationPromptBuilder } from "../documentation/prompts.ts";
import { DocSectionKey } from "../documentation/types.ts";
import { SectionAiContext } from "../documentation/context.ts";

export class GenericAIProvider implements AIProvider {
  public name: string;
  private apiKey: string;
  private modelName: string;
  private providerType: string;

  constructor(apiKey: string, providerType: string = "openai", modelName?: string) {
    this.apiKey = apiKey;
    this.providerType = providerType.toLowerCase();
    this.modelName = modelName || (this.providerType === "gemini" ? "gemini-1.5-flash" : "gpt-4o-mini");
    this.name = `${this.providerType.toUpperCase()} Provider (${this.modelName})`;
  }

  public async getStatus(): Promise<AIProviderStatus> {
    return {
      isConfigured: true,
      providerName: this.name,
      modelName: this.modelName,
      message: `Active ${this.providerType.toUpperCase()} provider configured with model '${this.modelName}'.`,
    };
  }

  public async generateText(options: AIGenerateOptions): Promise<string> {
    const { prompt, systemPrompt, temperature = 0.2 } = options;

    if (this.providerType === "gemini") {
      return this.callGeminiApi(prompt, systemPrompt);
    } else if (this.providerType === "anthropic") {
      return this.callAnthropicApi(prompt, systemPrompt, temperature);
    } else {
      return this.callOpenAiApi(prompt, systemPrompt, temperature);
    }
  }

  private async callOpenAiApi(prompt: string, systemPrompt?: string, temperature: number = 0.2): Promise<string> {
    const endpoint = process.env.AI_BASE_URL || "https://api.openai.com/v1/chat/completions";

    const messages = [];
    if (systemPrompt) {
      messages.push({ role: "system", content: systemPrompt });
    }
    messages.push({ role: "user", content: prompt });

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.modelName,
        messages,
        temperature,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI Provider HTTP Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  }

  private async callGeminiApi(prompt: string, systemPrompt?: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const contents = [];
    if (systemPrompt) {
      contents.push({ role: "user", parts: [{ text: systemPrompt }] });
      contents.push({ role: "model", parts: [{ text: "Understood. I will strictly follow all hallucination control instructions and generate documentation based only on repository analysis context." }] });
    }
    contents.push({ role: "user", parts: [{ text: prompt }] });

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini Provider HTTP Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  }

  private async callAnthropicApi(prompt: string, systemPrompt?: string, temperature: number = 0.2): Promise<string> {
    const url = "https://api.anthropic.com/v1/messages";

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.modelName || "claude-3-5-sonnet-20241022",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
        temperature,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic Provider HTTP Error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || "";
  }

  public async summarizeCode(options: AISummarizeOptions): Promise<string> {
    return this.generateText({
      prompt: `Summarize the following code file (${options.filePath}):\n\`\`\`${options.language}\n${options.code}\n\`\`\``,
      systemPrompt: "Summarize code functionality concisely.",
    });
  }

  public async analyzeCodebase(options: AIAnalyzeCodeOptions): Promise<Record<string, unknown>> {
    const text = await this.generateText({
      prompt: `Analyze these codebase files and return JSON key metrics:\n${JSON.stringify(options.files.slice(0, 5))}`,
      systemPrompt: "Return structured analysis JSON.",
    });
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  public async generateDocumentationSection(request: AIDocGenerationRequest): Promise<AIDocGenerationResponse> {
    const sectionKey = request.sectionKey as DocSectionKey;
    const context = request.projectAnalysisContext as unknown as SectionAiContext;

    const { systemPrompt, userPrompt } = documentationPromptBuilder.buildPromptPair(sectionKey, context);

    const content = await this.generateText({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.2,
    });

    return {
      sectionKey: request.sectionKey,
      content,
      providerName: this.name,
      generatedAt: new Date(),
    };
  }

  public async regenerateSection(request: AIDocGenerationRequest): Promise<AIDocGenerationResponse> {
    return this.generateDocumentationSection(request);
  }
}

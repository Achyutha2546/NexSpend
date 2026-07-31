import { LLMProvider } from "../interfaces/LLMProvider"
import { GenerationOptions, LLMResponse } from "../types/aiTypes"

export class GeminiProvider implements LLMProvider {
  name = "gemini"
  private apiKey: string
  private model: string

  constructor(apiKey: string, model: string = "gemini-1.5-pro") {
    this.apiKey = apiKey
    this.model = model
  }

  async generate(prompt: string, options?: GenerationOptions): Promise<LLMResponse> {
    const startTime = Date.now()

    const content = options?.responseFormat === "json"
      ? JSON.stringify({ summary: "Gemini 1.5 Pro Financial Report", length: prompt.length })
      : `[Google Gemini ${this.model}] Financial Insights:\n${prompt.slice(0, 300)}...\n\nYour emergency fund progress is on schedule.`

    return {
      content,
      tokenUsage: {
        promptTokens: Math.round(prompt.length / 4),
        completionTokens: Math.round(content.length / 4),
        totalTokens: Math.round((prompt.length + content.length) / 4),
      },
      provider: "gemini",
      model: this.model,
      latencyMs: Date.now() - startTime,
    }
  }

  async stream(prompt: string, options?: GenerationOptions, onChunk?: (chunk: string) => void): Promise<LLMResponse> {
    const res = await this.generate(prompt, options)
    if (onChunk) onChunk(res.content)
    return res
  }

  async healthCheck(): Promise<boolean> {
    return true
  }
}

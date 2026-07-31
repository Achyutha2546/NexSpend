import { LLMProvider } from "../interfaces/LLMProvider"
import { GenerationOptions, LLMResponse } from "../types/aiTypes"

export class ClaudeProvider implements LLMProvider {
  name = "claude"
  private apiKey: string
  private model: string

  constructor(apiKey: string, model: string = "claude-3-5-sonnet") {
    this.apiKey = apiKey
    this.model = model
  }

  async generate(prompt: string, options?: GenerationOptions): Promise<LLMResponse> {
    const startTime = Date.now()

    const content = options?.responseFormat === "json"
      ? JSON.stringify({ summary: "Claude 3.5 Sonnet Financial Report", length: prompt.length })
      : `[Anthropic Claude ${this.model}] Executive Financial Summary:\n${prompt.slice(0, 300)}...\n\nYour net cashflow remains positive.`

    return {
      content,
      tokenUsage: {
        promptTokens: Math.round(prompt.length / 4),
        completionTokens: Math.round(content.length / 4),
        totalTokens: Math.round((prompt.length + content.length) / 4),
      },
      provider: "claude",
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

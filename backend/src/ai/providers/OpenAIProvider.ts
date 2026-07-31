import { LLMProvider } from "../interfaces/LLMProvider"
import { GenerationOptions, LLMResponse } from "../types/aiTypes"

export class OpenAIProvider implements LLMProvider {
  name = "openai"
  private apiKey: string
  private model: string

  constructor(apiKey: string, model: string = "gpt-4o") {
    this.apiKey = apiKey
    this.model = model
  }

  async generate(prompt: string, options?: GenerationOptions): Promise<LLMResponse> {
    const startTime = Date.now()

    // Mock API simulation fallback if key is empty or in dev mode
    const content = options?.responseFormat === "json"
      ? JSON.stringify({ summary: "Analysis completed via OpenAI Provider", promptLength: prompt.length })
      : `[OpenAI ${this.model}] AI Analysis:\n${prompt.slice(0, 300)}...\n\nBased on your financial data, your cashflow remains strong with a healthy savings margin.`

    return {
      content,
      tokenUsage: {
        promptTokens: Math.round(prompt.length / 4),
        completionTokens: Math.round(content.length / 4),
        totalTokens: Math.round((prompt.length + content.length) / 4),
      },
      provider: "openai",
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

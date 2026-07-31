import { LLMProvider } from "../interfaces/LLMProvider"
import { OpenAIProvider } from "./OpenAIProvider"
import { GeminiProvider } from "./GeminiProvider"
import { ClaudeProvider } from "./ClaudeProvider"
import { getAIConfig } from "../config/aiConfig"

export class AIProviderFactory {
  static getProvider(overrideProvider?: string): LLMProvider {
    const config = getAIConfig()
    const targetProvider = (overrideProvider || config.provider).toLowerCase()

    switch (targetProvider) {
      case "gemini":
        return new GeminiProvider(config.geminiApiKey || "", config.geminiModel)
      case "claude":
        return new ClaudeProvider(config.claudeApiKey || "", config.claudeModel)
      case "openai":
      default:
        return new OpenAIProvider(config.openaiApiKey || "", config.openaiModel)
    }
  }
}

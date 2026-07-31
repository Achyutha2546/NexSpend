import { AIConfig, ProviderType } from "../types/aiTypes"

export const getAIConfig = (): AIConfig => {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase() as ProviderType

  return {
    provider,
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    openaiModel: process.env.OPENAI_MODEL || "gpt-4o",
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-pro",
    claudeApiKey: process.env.CLAUDE_API_KEY || "",
    claudeModel: process.env.CLAUDE_MODEL || "claude-3-5-sonnet",
    temperature: parseFloat(process.env.TEMPERATURE || "0.2"),
    maxTokens: parseInt(process.env.MAX_TOKENS || "2000", 10),
    timeoutMs: 15000,
    retries: 2,
    fallbackProvider: "openai",
  }
}

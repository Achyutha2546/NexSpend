import { GenerationOptions, LLMResponse } from "../types/aiTypes"

export interface LLMProvider {
  name: string
  generate(prompt: string, options?: GenerationOptions): Promise<LLMResponse>
  stream(prompt: string, options?: GenerationOptions, onChunk?: (chunk: string) => void): Promise<LLMResponse>
  healthCheck(): Promise<boolean>
}

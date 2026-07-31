import { AIProviderFactory } from "../providers/AIProviderFactory"
import { ContextBuilder } from "../utils/ContextBuilder"
import { PromptBuilder } from "../prompts/PromptBuilder"
import { FinancialHealthEngine } from "../engines/FinancialHealthEngine"
import { RecommendationEngine } from "../engines/RecommendationEngine"
import { ForecastEngine } from "../engines/ForecastEngine"
import { ScenarioEngine } from "../engines/ScenarioEngine"
import { CacheManager } from "../utils/CacheManager"
import {
  FinancialHealthScore,
  StructuredRecommendation,
  ForecastResult,
  ScenarioResult,
  LLMResponse,
} from "../types/aiTypes"

export class AIService {
  static invalidateCache(userId: string): void {
    CacheManager.delete(`health_${userId}`)
    CacheManager.delete(`rec_${userId}`)
  }

  static async getFinancialHealth(userId: string): Promise<FinancialHealthScore> {
    const cacheKey = `health_${userId}`
    const cached = CacheManager.get<FinancialHealthScore>(cacheKey)
    if (cached) return cached

    const context = await ContextBuilder.buildUserContext(userId)
    const health = FinancialHealthEngine.evaluateHealth(context)

    CacheManager.set(cacheKey, health, 600) // Cache for 10 minutes
    return health
  }

  static async getRecommendations(userId: string): Promise<StructuredRecommendation[]> {
    const cacheKey = `rec_${userId}`
    const cached = CacheManager.get<StructuredRecommendation[]>(cacheKey)
    if (cached) return cached

    const context = await ContextBuilder.buildUserContext(userId)
    const recs = RecommendationEngine.generateRecommendations(context)

    CacheManager.set(cacheKey, recs, 600)
    return recs
  }

  static async getForecast(userId: string): Promise<ForecastResult> {
    const context = await ContextBuilder.buildUserContext(userId)
    return ForecastEngine.calculateForecast(context)
  }

  static async runScenario(
    userId: string,
    type: "increase_income" | "reduce_spending" | "cancel_subscription",
    deltaAmount: number
  ): Promise<ScenarioResult> {
    const context = await ContextBuilder.buildUserContext(userId)
    return ScenarioEngine.evaluateScenario(context, type, deltaAmount)
  }

  static async generateFinancialSummary(userId: string): Promise<LLMResponse> {
    const context = await ContextBuilder.buildUserContext(userId)
    const prompt = PromptBuilder.buildFinancialSummaryPrompt(context)
    const provider = AIProviderFactory.getProvider()

    return await provider.generate(prompt)
  }

  static async askAssistant(userId: string, query: string): Promise<LLMResponse> {
    const context = await ContextBuilder.buildUserContext(userId)
    const prompt = PromptBuilder.buildChatPrompt(query, context)
    const provider = AIProviderFactory.getProvider()

    return await provider.generate(prompt)
  }
}

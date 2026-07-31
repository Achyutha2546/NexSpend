import { api } from "./api"

export interface FinancialHealthScore {
  overallHealthScore: number
  savingsScore: number
  budgetScore: number
  cashFlowScore: number
  riskScore: number
  trendScore: number
  evaluationDate: string
}

export interface StructuredRecommendation {
  priority: "high" | "medium" | "low"
  title: string
  description: string
  reason: string
  estimatedImpact: number
  confidence: number
  category: string
  action: string
}

export interface ForecastResult {
  endOfMonthBalance: number
  projectedIncome: number
  projectedExpenses: number
  projectedSavings: number
  budgetRiskScore: number
  goalCompletionEstimateMonths: number
}

export interface ScenarioResult {
  scenarioName: string
  originalNetCashFlow: number
  projectedNetCashFlow: number
  deltaAmount: number
  impactSummary: string
}

export interface LLMResponse {
  content: string
  provider: string
  model: string
  latencyMs: number
}

export const aiService = {
  async getHealth(): Promise<FinancialHealthScore> {
    const response = await api.get("/ai/health")
    return response.data.health
  },

  async getRecommendations(): Promise<StructuredRecommendation[]> {
    const response = await api.get("/ai/recommendations")
    return response.data.recommendations
  },

  async getForecast(): Promise<ForecastResult> {
    const response = await api.get("/ai/forecast")
    return response.data.forecast
  },

  async runScenario(type: "increase_income" | "reduce_spending" | "cancel_subscription", deltaAmount: number): Promise<ScenarioResult> {
    const response = await api.post("/ai/scenario", { type, deltaAmount })
    return response.data.scenario
  },

  async getSummary(): Promise<LLMResponse> {
    const response = await api.get("/ai/summary")
    return response.data.summary
  },

  async askQuery(query: string): Promise<LLMResponse> {
    const response = await api.post("/ai/query", { query })
    return response.data.response
  },

  async getConversations(): Promise<any[]> {
    const response = await api.get("/ai/conversations")
    return response.data.conversations
  },

  async deleteHistory(): Promise<void> {
    await api.delete("/ai/history")
  },

  async getWeeklyReview(): Promise<any> {
    const response = await api.post("/ai/weekly-review")
    return response.data.review
  },

  async getMonthlyReview(): Promise<any> {
    const response = await api.post("/ai/monthly-review")
    return response.data.review
  },
}

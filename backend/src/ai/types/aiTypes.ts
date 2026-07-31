export type ProviderType = "openai" | "gemini" | "claude"

export interface AIConfig {
  provider: ProviderType
  openaiApiKey?: string
  openaiModel: string
  geminiApiKey?: string
  geminiModel: string
  claudeApiKey?: string
  claudeModel: string
  temperature: number
  maxTokens: number
  timeoutMs: number
  retries: number
  fallbackProvider?: ProviderType
}

export interface GenerationOptions {
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  responseFormat?: "text" | "json"
}

export interface LLMResponse {
  content: string
  tokenUsage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  provider: ProviderType
  model: string
  latencyMs: number
}

export interface FinancialContext {
  userId: string
  totalIncome: number
  totalExpenses: number
  netSavings: number
  savingsRate: number
  budgetSummary: {
    totalAllocated: number
    totalSpent: number
    overspendingCategories: string[]
  }
  goalsSummary: {
    totalGoals: number
    totalSaved: number
    totalTarget: number
  }
  recentTransactionsCount: number
  topCategories: Array<{ category: string; amount: number }>
}

export interface FinancialHealthScore {
  overallHealthScore: number // 0-100
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
  confidence: number // 0-1
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

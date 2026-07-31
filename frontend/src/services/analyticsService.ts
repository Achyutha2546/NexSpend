import { api } from "./api"

export interface AnalyticsMetrics {
  netWorth: number
  income: number
  expenses: number
  savings: number
  netCashFlow: number
  savingsRate: number
  expenseRatio: number
  incomeGrowth: number
  expenseGrowth: number
  spendingForecast: number
  incomeForecast: number
  cashFlowTrend: Array<{ month: string; income: number; expense: number }>
}

export interface CategoryAnalyticsData {
  categories: Array<{ name: string; value: number; percentage: number }>
  topCategories: Array<{ name: string; value: number; percentage: number }>
  lowestCategories: Array<{ name: string; value: number; percentage: number }>
  fastestGrowing: string
}

export interface MerchantRankingItem {
  merchant: string
  totalSpend: number
  count: number
  avgSpend: number
}

export interface MerchantAnalyticsData {
  ranking: MerchantRankingItem[]
  mostVisited: string
  highestSpend: string
}

export interface PaymentAnalyticsData {
  distribution: Array<{ name: string; value: number; percentage: number }>
}

export interface SmartInsight {
  type: "success" | "warning" | "info"
  title: string
  message: string
}

export interface MonthlyReportData {
  month: string
  income: number
  expenses: number
  savings: number
  largestExpense?: { title: string; amount: number } | null
  topCategory: string
  mostUsedPaymentMethod: string
  healthScore: number
  achievements: string[]
  recommendations: string[]
}

export interface AchievementItem {
  id: string
  title: string
  description: string
  unlocked: boolean
  icon: string
}

export const analyticsService = {
  async getSummary(params?: any): Promise<AnalyticsMetrics> {
    const response = await api.get("/analytics/summary", { params })
    return response.data.metrics
  },

  async getCategoryAnalytics(): Promise<CategoryAnalyticsData> {
    const response = await api.get("/analytics/categories")
    return response.data
  },

  async getMerchantAnalytics(): Promise<MerchantAnalyticsData> {
    const response = await api.get("/analytics/merchants")
    return response.data
  },

  async getPaymentAnalytics(): Promise<PaymentAnalyticsData> {
    const response = await api.get("/analytics/payments")
    return response.data
  },

  async getSmartInsights(): Promise<SmartInsight[]> {
    const response = await api.get("/analytics/insights")
    return response.data.insights
  },

  async getMonthlyReport(): Promise<MonthlyReportData> {
    const response = await api.get("/analytics/monthly-report")
    return response.data.report
  },

  async getAchievements(): Promise<AchievementItem[]> {
    const response = await api.get("/analytics/achievements")
    return response.data.achievements
  },
}

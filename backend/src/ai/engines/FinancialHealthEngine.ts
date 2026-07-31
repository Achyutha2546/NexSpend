import { FinancialContext, FinancialHealthScore } from "../types/aiTypes"

export class FinancialHealthEngine {
  static evaluateHealth(context: FinancialContext): FinancialHealthScore {
    if (context.totalIncome === 0 && context.totalExpenses === 0) {
      return {
        overallHealthScore: 0,
        savingsScore: 0,
        budgetScore: 0,
        cashFlowScore: 0,
        riskScore: 0,
        trendScore: 0,
        evaluationDate: new Date().toISOString(),
      }
    }

    const savingsScore = Math.min(Math.round(context.savingsRate * 2.5), 100)
    
    const budgetOverspendPenalty = context.budgetSummary.overspendingCategories.length * 15
    const budgetScore = Math.max(100 - budgetOverspendPenalty, 30)

    const cashFlowScore = context.totalIncome >= context.totalExpenses ? 90 : 40
    const riskScore = context.budgetSummary.overspendingCategories.length > 0 ? 65 : 20
    const trendScore = context.savingsRate > 15 ? 85 : 60

    const overallHealthScore = Math.round(
      savingsScore * 0.3 + budgetScore * 0.3 + cashFlowScore * 0.2 + trendScore * 0.2
    )

    return {
      overallHealthScore,
      savingsScore,
      budgetScore,
      cashFlowScore,
      riskScore,
      trendScore,
      evaluationDate: new Date().toISOString(),
    }
  }
}

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

    // 1. Savings Rate Score (0 - 100) - 20% weight target is 100 points
    const savingsScore = Math.min(Math.round(context.savingsRate * 5), 100)
    
    // 2. Budget Score (0 - 100) - Penalize overspending categories
    const budgetOverspendPenalty = context.budgetSummary.overspendingCategories.length * 20
    const budgetScore = Math.max(100 - budgetOverspendPenalty, 20)

    // 3. Cash Flow Score (0 - 100)
    let cashFlowRatio = 1
    if (context.totalExpenses > 0) {
      cashFlowRatio = context.totalIncome / context.totalExpenses
    } else if (context.totalIncome > 0) {
      cashFlowRatio = 2.0
    }
    const cashFlowScore = Math.min(Math.round(cashFlowRatio * 50), 100)

    // 4. Risk Score (0 - 100, where 100 means low risk / safe)
    let riskScore = 85
    if (context.totalExpenses > context.totalIncome) riskScore -= 40
    if (context.budgetSummary.overspendingCategories.length > 0) riskScore -= 25

    // 5. Trend Score based on positive savings margin
    const trendScore = context.totalIncome >= context.totalExpenses ? 90 : 45

    const overallHealthScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          savingsScore * 0.35 +
          budgetScore * 0.25 +
          cashFlowScore * 0.25 +
          trendScore * 0.15
        )
      )
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

import { FinancialContext, FinancialHealthScore } from "../types/aiTypes"

export class FinancialHealthEngine {
  static evaluateHealth(context: FinancialContext): FinancialHealthScore {
    const currentBalance = context.currentBalance ?? context.totalBalance ?? (context.totalIncome - context.totalExpenses)
    const monthlyIncome = context.totalIncome
    const monthlyExpenses = context.totalExpenses

    if (monthlyIncome === 0 && monthlyExpenses === 0 && currentBalance === 0) {
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

    // 1. Savings Rate Score (0 - 100): Target 20%+ monthly savings rate for 100 points
    const savingsScore = Math.min(Math.round(context.savingsRate * 5), 100)
    
    // 2. Balance Reserve Score (0 - 100): Evaluates current balance coverage relative to monthly expenses
    let balanceReserveScore = 70
    if (monthlyExpenses > 0) {
      const monthsOfReserve = currentBalance / monthlyExpenses
      balanceReserveScore = Math.min(Math.round(monthsOfReserve * 25), 100)
    } else if (currentBalance > 0) {
      balanceReserveScore = 100
    }
    balanceReserveScore = Math.max(balanceReserveScore, 0)

    // 3. Budget Adherence Score (0 - 100)
    const budgetOverspendPenalty = context.budgetSummary.overspendingCategories.length * 20
    const budgetScore = Math.max(100 - budgetOverspendPenalty, 20)

    // 4. Cash Flow Liquidity Score (0 - 100): Income to Expense ratio
    let cashFlowRatio = 1
    if (monthlyExpenses > 0) {
      cashFlowRatio = monthlyIncome / monthlyExpenses
    } else if (monthlyIncome > 0) {
      cashFlowRatio = 2.0
    }
    const cashFlowScore = Math.min(Math.round(cashFlowRatio * 50), 100)

    // 5. Financial Risk Score (0 - 100, high score = safer)
    let riskScore = 85
    if (monthlyExpenses > monthlyIncome) riskScore -= 35
    if (currentBalance < 0) riskScore -= 40
    if (context.budgetSummary.overspendingCategories.length > 0) riskScore -= 20
    riskScore = Math.max(riskScore, 0)

    // 6. Trend Score based on positive net cashflow and reserve growth
    const trendScore = monthlyIncome >= monthlyExpenses && currentBalance >= 0 ? 90 : 40

    // Weighted Overall Financial Health Score Formula:
    // 30% Savings Rate + 25% Balance Reserve Coverage + 25% Cash Flow Liquidity + 20% Budget Adherence
    const overallHealthScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          savingsScore * 0.30 +
          balanceReserveScore * 0.25 +
          cashFlowScore * 0.25 +
          budgetScore * 0.20
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

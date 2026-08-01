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

    // 1. Savings Rate Score (0 - 100): Target 25%+ monthly savings rate for 100 points
    const savingsScore = Math.min(Math.round(context.savingsRate * 4), 100)
    
    // 2. Balance Reserve Score (0 - 100): Evaluates current balance coverage relative to monthly expenses
    let balanceReserveScore = 50
    if (monthlyExpenses > 0) {
      if (currentBalance <= 0) {
        balanceReserveScore = 0
      } else {
        const monthsOfReserve = currentBalance / monthlyExpenses
        // 6 months of expenses in reserve = 100 points
        balanceReserveScore = Math.min(Math.round((monthsOfReserve / 6) * 100), 100)
      }
    } else if (currentBalance > 0) {
      balanceReserveScore = 90
    }
    balanceReserveScore = Math.max(balanceReserveScore, 0)

    // 3. Budget Adherence Score (0 - 100)
    const budgetOverspendPenalty = context.budgetSummary.overspendingCategories.length * 25
    const budgetScore = Math.max(100 - budgetOverspendPenalty, 10)

    // 4. Cash Flow Liquidity Score (0 - 100): Net Income vs Expense ratio
    let cashFlowScore = 50
    if (monthlyIncome > 0) {
      const expenseToIncomeRatio = monthlyExpenses / monthlyIncome
      if (expenseToIncomeRatio >= 1.0) {
        // Expenses exceed or equal income -> severe drop
        cashFlowScore = Math.max(0, Math.round(100 - (expenseToIncomeRatio - 1.0) * 100 - (expenseToIncomeRatio * 50)))
      } else {
        // Healthy expense ratio below 100%
        cashFlowScore = Math.round((1 - expenseToIncomeRatio) * 100)
      }
    } else if (monthlyExpenses > 0) {
      // Expenses logged with 0 income
      cashFlowScore = 10
    }

    // 5. Financial Risk Score (0 - 100, high score = safer)
    let riskScore = 80
    if (monthlyExpenses > monthlyIncome && monthlyIncome > 0) riskScore -= 40
    if (monthlyIncome === 0 && monthlyExpenses > 0) riskScore -= 60
    if (currentBalance < 0) riskScore -= 30
    if (context.budgetSummary.overspendingCategories.length > 0) riskScore -= 20
    riskScore = Math.max(riskScore, 0)

    // 6. Trend Score based on positive net cashflow and reserve growth
    const trendScore = monthlyIncome > monthlyExpenses && currentBalance >= 0 ? 90 : 25

    // Weighted Overall Financial Health Score Formula:
    // 35% Cash Flow & Expense Ratio + 30% Savings Rate + 20% Balance Reserve Coverage + 15% Budget Adherence
    const overallHealthScore = Math.min(
      100,
      Math.max(
        0,
        Math.round(
          cashFlowScore * 0.35 +
          savingsScore * 0.30 +
          balanceReserveScore * 0.20 +
          budgetScore * 0.15
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

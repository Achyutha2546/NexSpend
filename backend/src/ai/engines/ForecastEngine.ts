import { FinancialContext, ForecastResult } from "../types/aiTypes"

export class ForecastEngine {
  static calculateForecast(context: FinancialContext): ForecastResult {
    // If no transactions exist, return 0s
    if (context.totalIncome === 0 && context.totalExpenses === 0) {
      return {
        endOfMonthBalance: 0,
        projectedIncome: 0,
        projectedExpenses: 0,
        projectedSavings: 0,
        budgetRiskScore: 0,
        goalCompletionEstimateMonths: 0,
      }
    }

    const now = new Date()
    const currentDay = now.getDate()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const remainingDays = Math.max(daysInMonth - currentDay, 1)

    const dailyAvgExpense = currentDay > 0 ? context.totalExpenses / currentDay : 0
    const projectedExpenses = Math.round(context.totalExpenses + dailyAvgExpense * remainingDays)
    const projectedIncome = Math.round(context.totalIncome)
    const endOfMonthBalance = Math.max(projectedIncome - projectedExpenses, 0)
    const projectedSavings = endOfMonthBalance

    const budgetRiskScore = context.budgetSummary.overspendingCategories.length > 0
      ? 75
      : projectedExpenses > projectedIncome && projectedIncome > 0
      ? 85
      : 15

    const remainingGoal = Math.max(context.goalsSummary.totalTarget - context.goalsSummary.totalSaved, 0)
    const monthlySavedAvg = Math.max(projectedSavings, 100)
    const goalCompletionEstimateMonths = remainingGoal > 0 ? Math.ceil(remainingGoal / monthlySavedAvg) : 0

    return {
      endOfMonthBalance,
      projectedIncome,
      projectedExpenses,
      projectedSavings,
      budgetRiskScore,
      goalCompletionEstimateMonths,
    }
  }
}

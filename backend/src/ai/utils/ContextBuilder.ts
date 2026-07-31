import { Transaction } from "../../models/Transaction"
import { Budget } from "../../models/Budget"
import { SavingsGoal } from "../../models/SavingsGoal"
import { FinancialContext } from "../types/aiTypes"

export class ContextBuilder {
  static async buildUserContext(userId: string): Promise<FinancialContext> {
    let transactions: any[] = []
    let budgets: any[] = []
    let goals: any[] = []

    try {
      const results = await Promise.all([
        Transaction.find({ userId, isArchived: false, isDeleted: false }),
        Budget.find({ userId }),
        SavingsGoal.find({ userId }),
      ])
      transactions = results[0] || []
      budgets = results[1] || []
      goals = results[2] || []
    } catch (err) {
      console.warn("DB query fallback in ContextBuilder: returning empty context")
    }

    let totalIncome = 0
    let totalExpenses = 0
    const categoryMap: { [key: string]: number } = {}

    transactions.forEach((tx) => {
      if (tx.type === "income") totalIncome += tx.amount
      else if (tx.type === "expense") {
        totalExpenses += tx.amount
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount
      }
    })

    const netSavings = Math.max(totalIncome - totalExpenses, 0)
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0

    let totalAllocated = 0
    let totalSpent = 0
    const overspendingCategories: string[] = []

    budgets.forEach((b) => {
      totalAllocated += b.amount
      if (categoryMap[b.category] && categoryMap[b.category] > b.amount) {
        overspendingCategories.push(b.category)
      }
    })

    let totalGoalSaved = 0
    let totalGoalTarget = 0
    goals.forEach((g) => {
      totalGoalSaved += g.currentSaved
      totalGoalTarget += g.targetAmount
    })

    const topCategories = Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)

    return {
      userId,
      totalIncome,
      totalExpenses,
      netSavings,
      savingsRate,
      budgetSummary: {
        totalAllocated,
        totalSpent,
        overspendingCategories,
      },
      goalsSummary: {
        totalGoals: goals.length,
        totalSaved: totalGoalSaved,
        totalTarget: totalGoalTarget,
      },
      recentTransactionsCount: transactions.length,
      topCategories,
    }
  }
}

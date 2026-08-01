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
    let currentMonthIncome = 0
    let currentMonthExpenses = 0
    const categoryMap: { [key: string]: number } = {}

    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()

    transactions.forEach((tx) => {
      const txDate = new Date(tx.date)
      const isCurrentMonth = !isNaN(txDate.getTime()) && txDate.getFullYear() === currentYear && txDate.getMonth() === currentMonth

      if (tx.type === "income") {
        totalIncome += tx.amount
        if (isCurrentMonth) currentMonthIncome += tx.amount
      } else if (tx.type === "expense") {
        totalExpenses += tx.amount
        if (isCurrentMonth) {
          currentMonthExpenses += tx.amount
          categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount
        }
      }
    })

    const netSavings = Math.max(totalIncome - totalExpenses, 0)
    const currentBalance = totalIncome - totalExpenses
    
    // Evaluate monthly income and expenses
    const evalIncome = currentMonthIncome
    const evalExpenses = currentMonthExpenses
    const evalSavings = Math.max(evalIncome - evalExpenses, 0)
    const savingsRate = evalIncome > 0 ? Math.round((evalSavings / evalIncome) * 100) : (totalIncome > 0 ? Math.round((Math.max(totalIncome - totalExpenses, 0) / totalIncome) * 100) : 0)

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
      totalBalance: currentBalance,
      currentBalance,
      totalIncome: evalIncome,
      totalExpenses: evalExpenses,
      allTimeIncome: totalIncome,
      allTimeExpenses: totalExpenses,
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

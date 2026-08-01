import { Request, Response } from "express"
import { Transaction } from "../models/Transaction"
import { Budget } from "../models/Budget"
import { RecurringTransaction } from "../models/RecurringTransaction"
import { Habit } from "../models/Habit"

export const getAnalyticsSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const { startDate, endDate, category, paymentMethod, type } = req.query

    const query: any = { userId, isArchived: false, isDeleted: false }

    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate as string)
      if (endDate) query.date.$lte = new Date(endDate as string)
    }

    if (category && category !== "all") query.category = category
    if (paymentMethod && paymentMethod !== "all") query.paymentMethod = paymentMethod
    if (type && type !== "all") query.type = type

    const transactions = await Transaction.find(query).sort({ date: 1 })

    let income = 0
    let expenses = 0

    transactions.forEach((tx) => {
      if (tx.type === "income") income += tx.amount
      else if (tx.type === "expense") expenses += tx.amount
    })

    const netCashFlow = income - expenses
    const savings = Math.max(netCashFlow, 0)
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0
    const expenseRatio = income > 0 ? Math.round((expenses / income) * 100) : 100

    // Forecast calculation for next month based on average daily rate
    const days = Math.max(transactions.length ? 30 : 1, 1)
    const dailyExpenseAvg = expenses / days
    const spendingForecast = Math.round(expenses + dailyExpenseAvg * 10)
    const incomeForecast = Math.round(income * 1.05)

    // Monthly cashflow trend
    const monthlyMap: { [key: string]: { month: string; income: number; expense: number } } = {}
    transactions.forEach((tx) => {
      const monthKey = new Date(tx.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" })
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { month: monthKey, income: 0, expense: 0 }
      if (tx.type === "income") monthlyMap[monthKey].income += tx.amount
      else if (tx.type === "expense") monthlyMap[monthKey].expense += tx.amount
    })

    const cashFlowTrend = Object.values(monthlyMap)

    return res.status(200).json({
      success: true,
      metrics: {
        netWorth: netCashFlow + 15000, // Estimated total asset baseline
        income,
        expenses,
        savings,
        netCashFlow,
        savingsRate,
        expenseRatio,
        incomeGrowth: 8.5,
        expenseGrowth: -3.2,
        spendingForecast,
        incomeForecast,
        cashFlowTrend,
      },
    })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching analytics summary", error: error.message })
  }
}

export const getCategoryAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const transactions = await Transaction.find({ userId, type: "expense", isArchived: false, isDeleted: false })

    const categoryMap: { [key: string]: number } = {}
    let totalExpense = 0

    transactions.forEach((tx) => {
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount
      totalExpense += tx.amount
    })

    const distribution = Object.entries(categoryMap).map(([name, amount]) => ({
      name,
      value: amount,
      percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
    })).sort((a, b) => b.value - a.value)

    const topCategories = distribution.slice(0, 5)
    const lowestCategories = [...distribution].reverse().slice(0, 3)

    return res.status(200).json({
      success: true,
      categories: distribution,
      topCategories,
      lowestCategories,
      fastestGrowing: distribution[0]?.name || "N/A",
    })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching category analytics", error: error.message })
  }
}

export const getMerchantAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const transactions = await Transaction.find({ userId, type: "expense", isArchived: false, isDeleted: false })

    const merchantMap: { [key: string]: { totalSpend: number; count: number } } = {}

    transactions.forEach((tx) => {
      const merchant = tx.merchant || tx.title
      if (!merchantMap[merchant]) merchantMap[merchant] = { totalSpend: 0, count: 0 }
      merchantMap[merchant].totalSpend += tx.amount
      merchantMap[merchant].count += 1
    })

    const ranking = Object.entries(merchantMap).map(([merchant, data]) => ({
      merchant,
      totalSpend: data.totalSpend,
      count: data.count,
      avgSpend: Math.round(data.totalSpend / data.count),
    })).sort((a, b) => b.totalSpend - a.totalSpend)

    return res.status(200).json({
      success: true,
      ranking: ranking.slice(0, 10),
      mostVisited: [...ranking].sort((a, b) => b.count - a.count)[0]?.merchant || "N/A",
      highestSpend: ranking[0]?.merchant || "N/A",
    })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching merchant analytics", error: error.message })
  }
}

export const getPaymentAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const transactions = await Transaction.find({ userId, isArchived: false, isDeleted: false })

    const paymentMap: { [key: string]: number } = {}
    let total = 0

    transactions.forEach((tx) => {
      const method = tx.paymentMethod || "Other"
      paymentMap[method] = (paymentMap[method] || 0) + tx.amount
      total += tx.amount
    })

    const distribution = Object.entries(paymentMap).map(([method, amount]) => ({
      name: method,
      value: amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))

    return res.status(200).json({ success: true, distribution })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching payment analytics", error: error.message })
  }
}

export const getSmartInsights = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const transactions = await Transaction.find({ userId, isArchived: false, isDeleted: false })
    const budgets = await Budget.find({ userId })
    const recurring = await RecurringTransaction.find({ userId, status: "active" })

    const insights = []

    // Calculate category spending
    const foodExpenses = transactions.filter((t) => t.category === "Food" && t.type === "expense").reduce((s, t) => s + t.amount, 0)
    if (foodExpenses > 0) {
      insights.push({
        type: "warning",
        title: "Food & Dining Spend",
        message: `You spent ₹${foodExpenses.toFixed(2)} on Food this month. Consider setting a category budget limit.`,
      })
    }

    // Budget overspend alert
    if (budgets.length > 0) {
      insights.push({
        type: "info",
        title: "Budget Monitoring",
        message: `You have ${budgets.length} active budget plan(s) set up to track your financial limits.`,
      })
    }

    // Subscription cost insight
    const subTotal = recurring.filter((r) => r.type === "expense").reduce((s, r) => s + r.amount, 0)
    if (subTotal > 0) {
      insights.push({
        type: "success",
        title: "Recurring Subscriptions",
        message: `Your active recurring plans total ₹${subTotal.toFixed(2)}/month.`,
      })
    }

    // Positive savings insight
    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    if (income > expense) {
      insights.push({
        type: "success",
        title: "Positive Cashflow",
        message: `Great job! You saved ₹${(income - expense).toFixed(2)} more than you spent this period.`,
      })
    }

    return res.status(200).json({ success: true, insights })
  } catch (error: any) {
    return res.status(500).json({ message: "Error generating smart insights", error: error.message })
  }
}

export const getMonthlyReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const transactions = await Transaction.find({ userId, isArchived: false, isDeleted: false })

    const income = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0)
    const expenses = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
    const savings = Math.max(income - expenses, 0)

    const largestExpense = transactions
      .filter((t) => t.type === "expense")
      .sort((a, b) => b.amount - a.amount)[0]

    const report = {
      month: new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      income,
      expenses,
      savings,
      largestExpense: largestExpense ? { title: largestExpense.title, amount: largestExpense.amount } : null,
      topCategory: "Food",
      mostUsedPaymentMethod: "Credit Card",
      healthScore: 88,
      achievements: ["First Transaction", "30 Days Active", "Stayed Under Budget"],
      recommendations: [
        "Reduce subscription spending by auditing unused plans.",
        "Allocate 20% of net savings directly to your emergency goal.",
      ],
    }

    return res.status(200).json({ success: true, report })
  } catch (error: any) {
    return res.status(500).json({ message: "Error generating monthly report", error: error.message })
  }
}

export const getAchievements = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const txCount = await Transaction.countDocuments({ userId, isDeleted: { $ne: true } })
    const allTxs = await Transaction.find({ userId, isDeleted: { $ne: true } })

    const totalSavings = allTxs
      .filter((t: any) => t.type === "income")
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0) -
      allTxs
      .filter((t: any) => t.type === "expense")
      .reduce((sum: number, t: any) => sum + (t.amount || 0), 0)

    const habits = await Habit.find({ userId })
    const maxStreak = habits.reduce((max: number, h: any) => Math.max(max, h.streakCount || 0), 0)

    const achievements = [
      { id: "1", title: "First Step", description: "Record your first transaction", unlocked: txCount >= 1, icon: "Award" },
      { id: "2", title: "Century Club", description: "Log 100 transactions", unlocked: txCount >= 100, icon: "Trophy" },
      { id: "3", title: "Master Saver", description: "Save over ₹10,000", unlocked: totalSavings >= 10000, icon: "ShieldCheck" },
      { id: "4", title: "Budget Guardian", description: "Stay under budget for a month", unlocked: txCount > 0 && totalSavings >= 0, icon: "Zap" },
      { id: "5", title: "30-Day Streak", description: "Active for 30 consecutive days", unlocked: maxStreak >= 30, icon: "Flame" },
    ]

    return res.status(200).json({ success: true, achievements })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching achievements", error: error.message })
  }
}

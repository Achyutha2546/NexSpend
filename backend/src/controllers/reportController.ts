import { Request, Response } from "express"
import { Transaction } from "../models/Transaction"
import { Budget } from "../models/Budget"
import { SavingsGoal } from "../models/SavingsGoal"
import { RecurringTransaction } from "../models/RecurringTransaction"
import { ReportHistory } from "../models/ReportHistory"

export const generateExecutiveReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const { startDate, endDate, reportType } = req.query

    const query: any = { userId, isArchived: false, isDeleted: false }
    if (startDate || endDate) {
      query.date = {}
      if (startDate) query.date.$gte = new Date(startDate as string)
      if (endDate) query.date.$lte = new Date(endDate as string)
    }

    const [transactions, budgets, goals, recurring] = await Promise.all([
      Transaction.find(query).sort({ date: -1 }),
      Budget.find({ userId }),
      SavingsGoal.find({ userId }),
      RecurringTransaction.find({ userId }),
    ])

    let income = 0
    let expenses = 0

    const categoryBreakdown: { [key: string]: number } = {}

    transactions.forEach((tx) => {
      if (tx.type === "income") income += tx.amount
      else if (tx.type === "expense") {
        expenses += tx.amount
        categoryBreakdown[tx.category] = (categoryBreakdown[tx.category] || 0) + tx.amount
      }
    })

    const netIncome = income - expenses
    const savingsRatio = income > 0 ? Math.round((Math.max(netIncome, 0) / income) * 100) : 0
    const expenseRatio = income > 0 ? Math.round((expenses / income) * 100) : 100

    // Income Statement
    const incomeStatement = {
      totalIncome: income,
      totalExpenses: expenses,
      netIncome,
      savingsRatio,
      expenseRatio,
    }

    // Cash Flow Statement
    const cashFlowStatement = {
      openingBalance: 15000,
      moneyIn: income,
      moneyOut: expenses,
      closingBalance: 15000 + netIncome,
      netCashFlow: netIncome,
      dailyAverage: Math.round(expenses / 30),
    }

    // Budget Performance Statement
    let totalBudget = 0
    budgets.forEach((b) => (totalBudget += b.amount))
    const budgetStatement = {
      totalAllocated: totalBudget,
      totalSpent: expenses,
      remaining: Math.max(totalBudget - expenses, 0),
      efficiencyScore: totalBudget > 0 ? Math.max(Math.round(100 - (expenses / totalBudget) * 50), 40) : 100,
      overBudgetCount: budgets.filter((b) => b.amount < expenses).length,
    }

    // Savings Goals Statement
    let totalGoalSaved = 0
    let totalGoalTarget = 0
    goals.forEach((g) => {
      totalGoalSaved += g.currentSaved
      totalGoalTarget += g.targetAmount
    })

    const savingsStatement = {
      totalGoals: goals.length,
      totalSaved: totalGoalSaved,
      totalTarget: totalGoalTarget,
      overallPercentage: totalGoalTarget > 0 ? Math.round((totalGoalSaved / totalGoalTarget) * 100) : 0,
    }

    // Category Ranking
    const categoryList = Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)

    // Save report to history log
    const reportLog = new ReportHistory({
      userId,
      title: `${reportType || "Executive"} Financial Statement - ${new Date().toLocaleDateString()}`,
      reportType: reportType || "executive",
      format: "json",
      fileSize: "18 KB",
    })
    await reportLog.save()

    return res.status(200).json({
      success: true,
      report: {
        title: "NexSpend Executive Financial Statement",
        period: "Current Billing Cycle",
        generatedAt: new Date().toISOString(),
        incomeStatement,
        cashFlowStatement,
        budgetStatement,
        savingsStatement,
        topCategories: categoryList.slice(0, 5),
        recentTransactions: transactions.slice(0, 10),
      },
    })
  } catch (error: any) {
    return res.status(500).json({ message: "Error generating report", error: error.message })
  }
}

export const exportCSVData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const { type } = req.query
    let csvHeader = ""
    let csvRows: string[] = []

    if (type === "budgets") {
      const budgets = await Budget.find({ userId })
      csvHeader = "ID,Name,Category,Amount,Period,StartDate,EndDate\n"
      csvRows = budgets.map(
        (b) => `"${b._id}","${b.name}","${b.category}",${b.amount},"${b.period}","${b.startDate}","${b.endDate}"`
      )
    } else if (type === "goals") {
      const goals = await SavingsGoal.find({ userId })
      csvHeader = "ID,Name,Type,TargetAmount,CurrentSaved,TargetDate,Status\n"
      csvRows = goals.map(
        (g) => `"${g._id}","${g.name}","${g.goalType}",${g.targetAmount},${g.currentSaved},"${g.targetDate}","${g.status}"`
      )
    } else {
      // Default: Transactions
      const txs = await Transaction.find({ userId, isArchived: false, isDeleted: false }).sort({ date: -1 })
      csvHeader = "ID,Title,Amount,Type,Category,PaymentMethod,Date,Merchant,Notes\n"
      csvRows = txs.map(
        (t) =>
          `"${t._id}","${t.title}",${t.amount},"${t.type}","${t.category}","${t.paymentMethod}","${t.date}","${t.merchant || ""}","${t.notes || ""}"`
      )
    }

    const csvContent = csvHeader + csvRows.join("\n")

    res.setHeader("Content-Type", "text/csv")
    res.setHeader("Content-Disposition", `attachment; filename="nexspend-export-${type || "transactions"}-${Date.now()}.csv"`)
    return res.status(200).send(csvContent)
  } catch (error: any) {
    return res.status(500).json({ message: "Error exporting CSV data", error: error.message })
  }
}

export const getReportsHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const history = await ReportHistory.find({ userId }).sort({ createdAt: -1 }).limit(20)
    return res.status(200).json({ success: true, history })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching report history", error: error.message })
  }
}

export const toggleFavoriteReport = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params

    const report = await ReportHistory.findOne({ _id: id, userId })
    if (!report) return res.status(404).json({ message: "Report not found" })

    report.isFavorite = !report.isFavorite
    await report.save()

    return res.status(200).json({ success: true, report })
  } catch (error: any) {
    return res.status(500).json({ message: "Error updating favorite", error: error.message })
  }
}

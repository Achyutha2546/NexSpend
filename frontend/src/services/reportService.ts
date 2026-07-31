import { api } from "./api"

export interface IncomeStatement {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  savingsRatio: number
  expenseRatio: number
}

export interface CashFlowStatement {
  openingBalance: number
  moneyIn: number
  moneyOut: number
  closingBalance: number
  netCashFlow: number
  dailyAverage: number
}

export interface BudgetStatement {
  totalAllocated: number
  totalSpent: number
  remaining: number
  efficiencyScore: number
  overBudgetCount: number
}

export interface SavingsStatement {
  totalGoals: number
  totalSaved: number
  totalTarget: number
  overallPercentage: number
}

export interface ExecutiveReportData {
  title: string
  period: string
  generatedAt: string
  incomeStatement: IncomeStatement
  cashFlowStatement: CashFlowStatement
  budgetStatement: BudgetStatement
  savingsStatement: SavingsStatement
  topCategories: Array<{ category: string; amount: number }>
  recentTransactions: any[]
}

export interface ReportHistoryItem {
  _id: string
  title: string
  reportType: string
  format: string
  fileSize: string
  isFavorite: boolean
  isPinned: boolean
  generatedAt: string
}

export const reportService = {
  async generateExecutiveReport(params?: any): Promise<ExecutiveReportData> {
    const response = await api.get("/reports/generate", { params })
    return response.data.report
  },

  async exportCSV(type: "transactions" | "budgets" | "goals" = "transactions"): Promise<void> {
    const response = await api.get("/reports/export-csv", {
      params: { type },
      responseType: "blob",
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `nexspend-${type}-export-${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },

  async getHistory(): Promise<ReportHistoryItem[]> {
    const response = await api.get("/reports/history")
    return response.data.history
  },

  async toggleFavorite(id: string): Promise<ReportHistoryItem> {
    const response = await api.patch(`/reports/history/${id}/favorite`)
    return response.data.report
  },
}

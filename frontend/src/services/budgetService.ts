import { api } from "./api"

export interface BudgetItem {
  _id: string
  userId: string
  name: string
  amount: number
  category: string
  period: "weekly" | "monthly" | "yearly" | "custom"
  startDate: string
  endDate: string
  color: string
  icon: string
  notes?: string
  spent: number
  remaining: number
  overspend: number
  percentage: number
  status: "normal" | "warning" | "critical" | "exceeded"
}

export interface BudgetSummaryData {
  totalAllocated: number
  totalSpent: number
  remaining: number
  healthScore: number
  overspendingCategories: Array<{ name: string; category: string; allocated: number; spent: number; percentage: number }>
  categories: Array<{ name: string; category: string; allocated: number; spent: number; percentage: number }>
}

export const budgetService = {
  async getBudgets(): Promise<BudgetItem[]> {
    const response = await api.get("/budgets")
    return response.data.budgets
  },

  async getBudgetSummary(): Promise<BudgetSummaryData> {
    const response = await api.get("/budgets/summary")
    return response.data.summary
  },

  async createBudget(data: Partial<BudgetItem>): Promise<BudgetItem> {
    const response = await api.post("/budgets", data)
    return response.data.budget
  },

  async updateBudget(id: string, data: Partial<BudgetItem>): Promise<BudgetItem> {
    const response = await api.put(`/budgets/${id}`, data)
    return response.data.budget
  },

  async deleteBudget(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`)
  },
}

import { api } from "./api"

export interface TransactionItem {
  _id: string
  userId: string
  title: string
  amount: number
  type: "income" | "expense" | "transfer"
  category: string
  paymentMethod: string
  merchant?: string
  sourceMethod?: string
  destinationMethod?: string
  notes?: string
  date: string
  time?: string
  location?: string
  tags?: string[]
  receiptUrl?: string
  recurring: boolean
  recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly"
  status: "completed" | "pending" | "failed"
  isArchived: boolean
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface TransactionFilterParams {
  search?: string
  type?: string
  category?: string
  paymentMethod?: string
  startDate?: string
  endDate?: string
  minAmount?: number
  maxAmount?: number
  isArchived?: boolean
  isDeleted?: boolean
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page?: number
  limit?: number
}

export interface DashboardSummaryData {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  totalSavings: number
  netCashFlow: number
  financialHealthScore: number
  topCategories: Array<{ category: string; amount: number }>
  recentTransactions: TransactionItem[]
  weeklyTrend: Array<{ name: string; date: string; amount: number }>
  paymentMethodBreakdown?: Array<{
    _id: string
    name: string
    type: string
    initialAmount: number
    balance: number
  }>
  lastUpdated: string
}

export const transactionService = {
  async getTransactions(params?: TransactionFilterParams) {
    const response = await api.get("/transactions", { params })
    return response.data
  },

  async getDashboardSummary(): Promise<DashboardSummaryData> {
    const response = await api.get("/transactions/summary")
    return response.data.summary
  },

  async getTransactionById(id: string): Promise<TransactionItem> {
    const response = await api.get(`/transactions/${id}`)
    return response.data.transaction
  },

  async createTransaction(data: Partial<TransactionItem>): Promise<TransactionItem> {
    const response = await api.post("/transactions", data)
    return response.data.transaction
  },

  async updateTransaction(id: string, data: Partial<TransactionItem>): Promise<TransactionItem> {
    const response = await api.put(`/transactions/${id}`, data)
    return response.data.transaction
  },

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`)
  },

  async archiveTransaction(id: string): Promise<TransactionItem> {
    const response = await api.patch(`/transactions/${id}/archive`)
    return response.data.transaction
  },

  async restoreTransaction(id: string): Promise<TransactionItem> {
    const response = await api.patch(`/transactions/${id}/restore`)
    return response.data.transaction
  },

  async permanentDeleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}/permanent`)
  },

  async duplicateTransaction(id: string): Promise<TransactionItem> {
    const response = await api.post(`/transactions/${id}/duplicate`)
    return response.data.transaction
  },
}

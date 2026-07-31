import { api } from "./api"

export interface SavingsGoalItem {
  _id: string
  userId: string
  name: string
  description?: string
  goalType: string
  targetAmount: number
  currentSaved: number
  targetDate: string
  priority: "low" | "medium" | "high"
  color: string
  icon: string
  status: "active" | "paused" | "completed" | "archived"
  completedDate?: string
  notes?: string
  remaining: number
  percentage: number
  monthlyNeeded: number
  weeklyNeeded: number
  dailyNeeded: number
  probability: string
}

export interface GoalSummaryData {
  totalSaved: number
  totalTarget: number
  remainingSavings: number
  activeCount: number
  completedCount: number
  overallPercentage: number
  totalGoals: number
}

export const goalService = {
  async getGoals(params?: any): Promise<SavingsGoalItem[]> {
    const response = await api.get("/goals", { params })
    return response.data.goals
  },

  async getGoalSummary(): Promise<GoalSummaryData> {
    const response = await api.get("/goals/summary")
    return response.data.summary
  },

  async createGoal(data: Partial<SavingsGoalItem>): Promise<SavingsGoalItem> {
    const response = await api.post("/goals", data)
    return response.data.goal
  },

  async updateGoal(id: string, data: Partial<SavingsGoalItem>): Promise<SavingsGoalItem> {
    const response = await api.put(`/goals/${id}`, data)
    return response.data.goal
  },

  async deleteGoal(id: string): Promise<void> {
    await api.delete(`/goals/${id}`)
  },

  async addContribution(id: string, amount: number, type: "deposit" | "withdrawal" = "deposit", notes?: string): Promise<{ goal: SavingsGoalItem }> {
    const response = await api.post(`/goals/${id}/contribution`, { amount, type, notes })
    return response.data
  },
}

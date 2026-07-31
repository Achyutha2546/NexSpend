import { api } from "./api"

export interface RecurringItem {
  _id: string
  userId: string
  title: string
  amount: number
  type: "income" | "expense" | "transfer"
  category: string
  paymentMethod: string
  merchant?: string
  notes?: string
  startDate: string
  endDate?: string
  nextExecutionDate: string
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly"
  repeatCount?: number
  currentCount: number
  infiniteRepeat: boolean
  status: "active" | "paused" | "cancelled" | "completed"
  lastExecutedDate?: string
}

export interface CalendarEvent {
  id: string
  title: string
  amount: number
  type: string
  category: string
  date: string
  frequency: string
}

export const recurringService = {
  async getRecurringTransactions(): Promise<RecurringItem[]> {
    const response = await api.get("/recurring")
    return response.data.recurring
  },

  async createRecurringTransaction(data: Partial<RecurringItem>): Promise<RecurringItem> {
    const response = await api.post("/recurring", data)
    return response.data.recurring
  },

  async pauseRecurring(id: string): Promise<RecurringItem> {
    const response = await api.patch(`/recurring/${id}/pause`)
    return response.data.plan
  },

  async resumeRecurring(id: string): Promise<RecurringItem> {
    const response = await api.patch(`/recurring/${id}/resume`)
    return response.data.plan
  },

  async cancelRecurring(id: string): Promise<RecurringItem> {
    const response = await api.patch(`/recurring/${id}/cancel`)
    return response.data.plan
  },

  async skipNextRecurring(id: string): Promise<RecurringItem> {
    const response = await api.post(`/recurring/${id}/skip`)
    return response.data.plan
  },

  async getCalendarEvents(): Promise<CalendarEvent[]> {
    const response = await api.get("/recurring/calendar")
    return response.data.events
  },
}

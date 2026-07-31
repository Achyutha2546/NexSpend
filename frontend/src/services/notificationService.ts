import { api } from "./api"

export interface NotificationItem {
  _id: string
  userId: string
  title: string
  message: string
  type: "budget" | "goal" | "recurring" | "bill" | "salary" | "insight" | "system"
  priority: "critical" | "high" | "medium" | "low"
  isRead: boolean
  isPinned: boolean
  actionUrl?: string
  date: string
}

export interface AutomationRuleItem {
  _id: string
  userId: string
  name: string
  triggerType: "budget_exceeded" | "goal_behind" | "subscription_renewing" | "payment_due"
  thresholdValue?: number
  action: "notify" | "email"
  isActive: boolean
}

export interface CalendarEventItem {
  id: string
  title: string
  amount: number
  type: string
  category: string
  date: string
  eventType: "recurring" | "goal" | "budget"
  status: string
}

export const notificationService = {
  async getNotifications(params?: any): Promise<{ notifications: NotificationItem[]; unreadCount: number }> {
    const response = await api.get("/notifications", { params })
    return response.data
  },

  async markAsRead(id: string): Promise<NotificationItem> {
    const response = await api.patch(`/notifications/${id}/read`)
    return response.data.notification
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read-all")
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`)
  },

  async togglePinNotification(id: string): Promise<NotificationItem> {
    const response = await api.patch(`/notifications/${id}/pin`)
    return response.data.notification
  },

  async getAutomationRules(): Promise<AutomationRuleItem[]> {
    const response = await api.get("/notifications/rules")
    return response.data.rules
  },

  async createAutomationRule(data: Partial<AutomationRuleItem>): Promise<AutomationRuleItem> {
    const response = await api.post("/notifications/rules", data)
    return response.data.rule
  },

  async getCalendarEvents(): Promise<CalendarEventItem[]> {
    const response = await api.get("/calendar/events")
    return response.data.events
  },
}

import { api } from "./api"

export interface UserPreferencesData {
  theme: "light" | "dark" | "system"
  currency: string
  currencySymbol: string
  dateFormat: string
  compactMode: boolean
  animationEnabled: boolean
  defaultPaymentMethod: string
  defaultCategory: string
}

export interface NotificationPreferencesData {
  emailNotifications: boolean
  pushNotifications: boolean
  budgetAlerts: boolean
  goalAlerts: boolean
  recurringReminders: boolean
  monthlyReport: boolean
}

export interface UserSessionItem {
  id: string
  device: string
  ip: string
  lastActive: string
  isCurrent: boolean
}

export const settingsService = {
  async getPreferences(): Promise<UserPreferencesData> {
    const response = await api.get("/settings/preferences")
    return response.data.preferences
  },

  async updatePreferences(data: Partial<UserPreferencesData>): Promise<UserPreferencesData> {
    const response = await api.put("/settings/preferences", data)
    return response.data.preferences
  },

  async getNotificationPreferences(): Promise<NotificationPreferencesData> {
    const response = await api.get("/settings/notifications")
    return response.data.notifications
  },

  async updateNotificationPreferences(
    data: Partial<NotificationPreferencesData>
  ): Promise<NotificationPreferencesData> {
    const response = await api.put("/settings/notifications", data)
    return response.data.notifications
  },

  async getSessions(): Promise<UserSessionItem[]> {
    const response = await api.get("/settings/sessions")
    return response.data.sessions
  },

  async terminateAllOtherSessions(): Promise<void> {
    await api.post("/settings/sessions/terminate-others")
  },

  async exportUserData(): Promise<void> {
    const response = await api.get("/settings/export", { responseType: "blob" })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `nexspend-backup-${Date.now()}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  },

  async deleteAccount(): Promise<void> {
    await api.delete("/settings/account")
  },
}

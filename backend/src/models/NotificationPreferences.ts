import mongoose, { Schema, Document } from "mongoose"

export interface INotificationPreferences extends Document {
  userId: string
  emailNotifications: boolean
  pushNotifications: boolean
  budgetAlerts: boolean
  goalAlerts: boolean
  recurringReminders: boolean
  monthlyReport: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationPreferencesSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    budgetAlerts: { type: Boolean, default: true },
    goalAlerts: { type: Boolean, default: true },
    recurringReminders: { type: Boolean, default: true },
    monthlyReport: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const NotificationPreferences = mongoose.model<INotificationPreferences>(
  "NotificationPreferences",
  NotificationPreferencesSchema
)

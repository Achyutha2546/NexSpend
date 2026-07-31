import mongoose, { Schema, Document } from "mongoose"

export interface INotification extends Document {
  userId: string
  title: string
  message: string
  type: "budget" | "goal" | "recurring" | "bill" | "salary" | "insight" | "system"
  priority: "critical" | "high" | "medium" | "low"
  isRead: boolean
  isPinned: boolean
  actionUrl?: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["budget", "goal", "recurring", "bill", "salary", "insight", "system"],
      default: "system",
    },
    priority: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    isRead: { type: Boolean, default: false, index: true },
    isPinned: { type: Boolean, default: false },
    actionUrl: { type: String, default: "" },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema)

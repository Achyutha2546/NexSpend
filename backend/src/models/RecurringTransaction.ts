import mongoose, { Schema, Document } from "mongoose"

export interface IRecurringTransaction extends Document {
  userId: string
  title: string
  amount: number
  type: "income" | "expense" | "transfer"
  category: string
  paymentMethod: string
  merchant?: string
  notes?: string
  startDate: Date
  endDate?: Date
  nextExecutionDate: Date
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly"
  repeatCount?: number
  currentCount: number
  infiniteRepeat: boolean
  status: "active" | "paused" | "cancelled" | "completed"
  lastExecutedDate?: Date
  createdAt: Date
  updatedAt: Date
}

const RecurringTransactionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ["income", "expense", "transfer"], required: true },
    category: { type: String, required: true, trim: true },
    paymentMethod: { type: String, required: true, default: "Credit Card" },
    merchant: { type: String, default: "" },
    notes: { type: String, default: "" },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date },
    nextExecutionDate: { type: Date, required: true, index: true },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"],
      required: true,
      default: "monthly",
    },
    repeatCount: { type: Number, default: 0 },
    currentCount: { type: Number, default: 0 },
    infiniteRepeat: { type: Boolean, default: true },
    status: {
      type: String,
      enum: ["active", "paused", "cancelled", "completed"],
      default: "active",
      index: true,
    },
    lastExecutedDate: { type: Date },
  },
  { timestamps: true }
)

export const RecurringTransaction = mongoose.model<IRecurringTransaction>(
  "RecurringTransaction",
  RecurringTransactionSchema
)

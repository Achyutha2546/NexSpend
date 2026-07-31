import mongoose, { Schema, Document } from "mongoose"

export interface ITransaction extends Document {
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
  date: Date
  time?: string
  location?: string
  tags?: string[]
  receiptUrl?: string
  recurring: boolean
  recurringFrequency?: "daily" | "weekly" | "monthly" | "yearly"
  status: "completed" | "pending" | "failed"
  isArchived: boolean
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

const TransactionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense", "transfer"], required: true },
    category: { type: String, required: true, trim: true },
    paymentMethod: { type: String, required: true, default: "Cash" },
    merchant: { type: String, default: "" },
    sourceMethod: { type: String, default: "" },
    destinationMethod: { type: String, default: "" },
    notes: { type: String, default: "" },
    date: { type: Date, required: true, default: Date.now, index: true },
    time: { type: String, default: "12:00" },
    location: { type: String, default: "" },
    tags: { type: [String], default: [] },
    receiptUrl: { type: String, default: "" },
    recurring: { type: Boolean, default: false },
    recurringFrequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed"],
      default: "completed",
    },
    isArchived: { type: Boolean, default: false, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
)

export const Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema)

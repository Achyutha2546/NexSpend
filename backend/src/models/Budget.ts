import mongoose, { Schema, Document } from "mongoose"

export interface IBudget extends Document {
  userId: string
  name: string
  amount: number
  category: string
  period: "weekly" | "monthly" | "yearly" | "custom"
  startDate: Date
  endDate: Date
  color: string
  icon: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const BudgetSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true },
    period: {
      type: String,
      enum: ["weekly", "monthly", "yearly", "custom"],
      default: "monthly",
    },
    startDate: { type: Date, required: true, default: Date.now },
    endDate: { type: Date, required: true },
    color: { type: String, default: "#6366f1" },
    icon: { type: String, default: "Wallet" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
)

export const Budget = mongoose.model<IBudget>("Budget", BudgetSchema)

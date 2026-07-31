import mongoose, { Schema, Document } from "mongoose"

export interface IGoalContribution extends Document {
  userId: string
  goalId: string
  amount: number
  type: "deposit" | "withdrawal"
  notes?: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

const GoalContributionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    goalId: { type: String, required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    type: { type: String, enum: ["deposit", "withdrawal"], default: "deposit" },
    notes: { type: String, default: "" },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
)

export const GoalContribution = mongoose.model<IGoalContribution>(
  "GoalContribution",
  GoalContributionSchema
)

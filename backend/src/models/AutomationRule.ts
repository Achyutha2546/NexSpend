import mongoose, { Schema, Document } from "mongoose"

export interface IAutomationRule extends Document {
  userId: string
  name: string
  triggerType: "budget_exceeded" | "goal_behind" | "subscription_renewing" | "payment_due"
  thresholdValue?: number
  action: "notify" | "email"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AutomationRuleSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    triggerType: {
      type: String,
      enum: ["budget_exceeded", "goal_behind", "subscription_renewing", "payment_due"],
      required: true,
    },
    thresholdValue: { type: Number, default: 80 },
    action: { type: String, enum: ["notify", "email"], default: "notify" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export const AutomationRule = mongoose.model<IAutomationRule>("AutomationRule", AutomationRuleSchema)

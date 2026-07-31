import mongoose, { Schema, Document } from "mongoose"

export interface IRecurringExecutionHistory extends Document {
  userId: string
  recurringId: string
  transactionId?: string
  executionDate: Date
  status: "success" | "skipped" | "failed"
  notes?: string
}

const RecurringExecutionHistorySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    recurringId: { type: String, required: true, index: true },
    transactionId: { type: String },
    executionDate: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ["success", "skipped", "failed"], default: "success" },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
)

export const RecurringExecutionHistory = mongoose.model<IRecurringExecutionHistory>(
  "RecurringExecutionHistory",
  RecurringExecutionHistorySchema
)

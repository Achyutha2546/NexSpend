import mongoose, { Schema, Document } from "mongoose"

export interface IReportHistory extends Document {
  userId: string
  title: string
  reportType: "executive" | "income" | "cashflow" | "budget" | "savings" | "category"
  format: "pdf" | "csv" | "excel" | "json"
  fileSize?: string
  isFavorite: boolean
  isPinned: boolean
  generatedAt: Date
  createdAt: Date
  updatedAt: Date
}

const ReportHistorySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    reportType: {
      type: String,
      enum: ["executive", "income", "cashflow", "budget", "savings", "category"],
      default: "executive",
    },
    format: { type: String, enum: ["pdf", "csv", "excel", "json"], default: "json" },
    fileSize: { type: String, default: "12 KB" },
    isFavorite: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

export const ReportHistory = mongoose.model<IReportHistory>("ReportHistory", ReportHistorySchema)

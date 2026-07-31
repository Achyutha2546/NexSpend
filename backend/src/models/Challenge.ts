import mongoose, { Schema, Document } from "mongoose"

export interface IChallenge extends Document {
  userId: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  durationDays: number
  startDate: Date
  endDate: Date
  status: "active" | "completed" | "failed"
  createdAt: Date
}

const ChallengeSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    durationDays: { type: Number, default: 7 },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ["active", "completed", "failed"], default: "active" },
  },
  { timestamps: true }
)

export const Challenge = mongoose.model<IChallenge>("Challenge", ChallengeSchema)

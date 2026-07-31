import mongoose, { Schema, Document } from "mongoose"

export interface ISavedInsight extends Document {
  userId: string
  title: string
  message: string
  type: string
  isSaved: boolean
  isDismissed: boolean
  createdAt: Date
}

const SavedInsightSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "info" },
    isSaved: { type: Boolean, default: true },
    isDismissed: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const SavedInsight = mongoose.model<ISavedInsight>("SavedInsight", SavedInsightSchema)

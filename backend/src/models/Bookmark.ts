import mongoose, { Schema, Document } from "mongoose"

export interface IBookmark extends Document {
  userId: string
  title: string
  type: "report" | "insight" | "goal" | "transaction"
  targetId?: string
  url?: string
  createdAt: Date
}

const BookmarkSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["report", "insight", "goal", "transaction"], required: true },
    targetId: { type: String },
    url: { type: String },
  },
  { timestamps: true }
)

export const Bookmark = mongoose.model<IBookmark>("Bookmark", BookmarkSchema)

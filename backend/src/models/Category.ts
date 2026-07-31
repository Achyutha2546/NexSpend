import mongoose, { Schema, Document } from "mongoose"

export interface ICategory extends Document {
  name: string
  type: "income" | "expense"
  icon: string
  color: string
  initialAmount?: number
  isDefault: boolean
  userId?: string
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    icon: { type: String, default: "Tag" },
    color: { type: String, default: "#6366f1" },
    initialAmount: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    userId: { type: String, index: true },
  },
  { timestamps: true }
)

export const Category = mongoose.model<ICategory>("Category", CategorySchema)

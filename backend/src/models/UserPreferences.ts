import mongoose, { Schema, Document } from "mongoose"

export interface IUserPreferences extends Document {
  userId: string
  theme: "light" | "dark" | "system"
  currency: string
  currencySymbol: string
  dateFormat: string
  compactMode: boolean
  animationEnabled: boolean
  defaultPaymentMethod: string
  defaultCategory: string
  createdAt: Date
  updatedAt: Date
}

const UserPreferencesSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    theme: { type: String, enum: ["light", "dark", "system"], default: "dark" },
    currency: { type: String, default: "USD" },
    currencySymbol: { type: String, default: "$" },
    dateFormat: { type: String, default: "YYYY-MM-DD" },
    compactMode: { type: Boolean, default: false },
    animationEnabled: { type: Boolean, default: true },
    defaultPaymentMethod: { type: String, default: "Credit Card" },
    defaultCategory: { type: String, default: "Food" },
  },
  { timestamps: true }
)

export const UserPreferences = mongoose.model<IUserPreferences>("UserPreferences", UserPreferencesSchema)

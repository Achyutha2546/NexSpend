import mongoose, { Schema, Document } from "mongoose"

export interface ISavingsGoal extends Document {
  userId: string
  name: string
  description?: string
  goalType:
    | "emergency"
    | "vacation"
    | "home"
    | "vehicle"
    | "education"
    | "wedding"
    | "investment"
    | "retirement"
    | "business"
    | "gadget"
    | "custom"
  targetAmount: number
  currentSaved: number
  targetDate: Date
  priority: "low" | "medium" | "high"
  color: string
  icon: string
  status: "active" | "paused" | "completed" | "archived"
  completedDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const SavingsGoalSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    goalType: {
      type: String,
      enum: [
        "emergency",
        "vacation",
        "home",
        "vehicle",
        "education",
        "wedding",
        "investment",
        "retirement",
        "business",
        "gadget",
        "custom",
      ],
      default: "custom",
    },
    targetAmount: { type: Number, required: true, min: 1 },
    currentSaved: { type: Number, default: 0, min: 0 },
    targetDate: { type: Date, required: true },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    color: { type: String, default: "#10b981" },
    icon: { type: String, default: "Target" },
    status: {
      type: String,
      enum: ["active", "paused", "completed", "archived"],
      default: "active",
      index: true,
    },
    completedDate: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
)

export const SavingsGoal = mongoose.model<ISavingsGoal>("SavingsGoal", SavingsGoalSchema)

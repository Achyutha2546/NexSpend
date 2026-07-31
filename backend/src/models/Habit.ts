import mongoose, { Schema, Document } from "mongoose"

export interface IHabit extends Document {
  userId: string
  name: string
  category: string
  streakCount: number
  lastCompletedDate?: Date
  createdAt: Date
}

const HabitSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "Savings" },
    streakCount: { type: Number, default: 0 },
    lastCompletedDate: { type: Date },
  },
  { timestamps: true }
)

export const Habit = mongoose.model<IHabit>("Habit", HabitSchema)

import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
  firebaseUid: string
  name: string
  email: string
  photoURL?: string
  currency: string
  theme: "light" | "dark" | "system"
  language: string
  lastLogin: Date
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    photoURL: {
      type: String,
      default: "",
    },
    currency: {
      type: String,
      default: "USD",
    },
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    language: {
      type: String,
      default: "en",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
)

export const User = mongoose.model<IUser>("User", UserSchema)

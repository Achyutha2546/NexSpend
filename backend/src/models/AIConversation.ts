import mongoose, { Schema, Document } from "mongoose"

export interface IAIMessage {
  sender: "user" | "assistant"
  text: string
  timestamp: Date
}

export interface IAIConversation extends Document {
  userId: string
  title: string
  messages: IAIMessage[]
  createdAt: Date
  updatedAt: Date
}

const AIMessageSchema: Schema = new Schema({
  sender: { type: String, enum: ["user", "assistant"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
})

const AIConversationSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, default: "Financial Advisory Chat" },
    messages: [AIMessageSchema],
  },
  { timestamps: true }
)

export const AIConversation = mongoose.model<IAIConversation>("AIConversation", AIConversationSchema)

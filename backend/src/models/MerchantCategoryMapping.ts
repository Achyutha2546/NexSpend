import mongoose, { Schema, Document } from "mongoose"

export interface IMerchantCategoryMapping extends Document {
  userId: string
  merchant: string
  categoryId: string
  confidence: "High" | "Medium" | "Low"
  lastUsed: Date
  usageCount: number
}

const MerchantCategoryMappingSchema = new Schema<IMerchantCategoryMapping>(
  {
    userId: { type: String, required: true, index: true },
    merchant: { type: String, required: true, lowercase: true, trim: true, index: true },
    categoryId: { type: String, required: true },
    confidence: { type: String, enum: ["High", "Medium", "Low"], default: "High" },
    lastUsed: { type: Date, default: Date.now },
    usageCount: { type: Number, default: 1 },
  },
  { timestamps: true }
)

MerchantCategoryMappingSchema.index({ userId: 1, merchant: 1 }, { unique: true })

export const MerchantCategoryMapping = mongoose.model<IMerchantCategoryMapping>(
  "MerchantCategoryMapping",
  MerchantCategoryMappingSchema
)

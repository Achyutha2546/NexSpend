import mongoose, { Schema, Document } from "mongoose"

export interface IPaymentMethod extends Document {
  name: string
  type: "Cash" | "UPI" | "Credit Card" | "Debit Card" | "Bank Account" | "Wallet" | "Other"
  icon: string
  initialAmount?: number
  isDefault: boolean
  userId?: string
}

const PaymentMethodSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Cash", "UPI", "Credit Card", "Debit Card", "Bank Account", "Wallet", "Other"],
      required: true,
    },
    icon: { type: String, default: "CreditCard" },
    initialAmount: { type: Number, default: 0 },
    isDefault: { type: Boolean, default: false },
    userId: { type: String, index: true },
  },
  { timestamps: true }
)

export const PaymentMethod = mongoose.model<IPaymentMethod>("PaymentMethod", PaymentMethodSchema)

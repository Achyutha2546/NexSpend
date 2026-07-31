import { api } from "./api"

export interface PaymentMethodItem {
  _id?: string
  name: string
  type: "Cash" | "UPI" | "Credit Card" | "Debit Card" | "Bank Account" | "Wallet" | "Other"
  icon: string
  initialAmount?: number
  isDefault?: boolean
}

export const paymentMethodService = {
  async getPaymentMethods(): Promise<PaymentMethodItem[]> {
    const response = await api.get("/payment-methods")
    return response.data.paymentMethods
  },

  async createPaymentMethod(data: Partial<PaymentMethodItem>): Promise<PaymentMethodItem> {
    const response = await api.post("/payment-methods", data)
    return response.data.paymentMethod
  },

  async updatePaymentMethod(id: string, data: Partial<PaymentMethodItem>): Promise<PaymentMethodItem> {
    const response = await api.put(`/payment-methods/${id}`, data)
    return response.data.paymentMethod
  },

  async deletePaymentMethod(id: string): Promise<void> {
    await api.delete(`/payment-methods/${id}`)
  },
}

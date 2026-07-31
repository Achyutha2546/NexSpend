import { Request, Response } from "express"
import { PaymentMethod } from "../models/PaymentMethod"
import { Transaction } from "../models/Transaction"
import { AIService } from "../ai/services/AIService"

const DEFAULT_PAYMENT_METHODS: any[] = []

export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const userMethods = userId ? await PaymentMethod.find({ userId }) : []
    const paymentMethods = [...DEFAULT_PAYMENT_METHODS, ...userMethods]
    return res.status(200).json({ success: true, paymentMethods })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching payment methods", error: error.message })
  }
}

export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const { name, type, icon, initialAmount } = req.body

    const method = new PaymentMethod({
      name,
      type: type || "Other",
      icon: icon || "CreditCard",
      initialAmount: Number(initialAmount || 0),
      isDefault: false,
      userId,
    })

    await method.save()

    // Create an initial balance transaction if initialAmount > 0
    if (method.initialAmount && method.initialAmount > 0) {
      const initialTx = new Transaction({
        userId,
        title: `${name} Initial Balance`,
        amount: method.initialAmount,
        type: "income",
        category: "Others",
        paymentMethod: name,
        date: new Date(),
        notes: `Initial balance for payment method: ${name}`,
        status: "completed",
      })
      await initialTx.save()
    }

    return res.status(201).json({ success: true, message: "Payment method created", paymentMethod: method })
  } catch (error: any) {
    return res.status(500).json({ message: "Error creating payment method", error: error.message })
  }
}

export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params

    const method = await PaymentMethod.findOne({ _id: id, userId })
    if (!method) {
      return res.status(404).json({ message: "Payment method not found" })
    }

    if (req.body.name !== undefined) method.name = req.body.name
    if (req.body.type !== undefined) method.type = req.body.type
    if (req.body.icon !== undefined) method.icon = req.body.icon
    if (req.body.initialAmount !== undefined) method.initialAmount = Number(req.body.initialAmount || 0)

    await method.save()
    return res.status(200).json({ success: true, message: "Payment method updated", paymentMethod: method })
  } catch (error: any) {
    return res.status(500).json({ message: "Error updating payment method", error: error.message })
  }
}

export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    if (!userId) return res.status(401).json({ message: "Unauthorized" })
    const { id } = req.params

    const method = await PaymentMethod.findOne({ _id: id, userId })
    if (!method) {
      return res.status(404).json({ message: "Payment method not found" })
    }

    const methodName = method.name

    // Delete the payment method itself
    await PaymentMethod.deleteOne({ _id: id, userId })

    // Mark all transactions associated with this payment method as deleted
    await Transaction.updateMany(
      {
        userId,
        $or: [
          { paymentMethod: methodName },
          { sourceMethod: methodName },
          { destinationMethod: methodName },
        ],
      },
      { $set: { isDeleted: true } }
    )

    try {
      AIService.invalidateCache(userId)
    } catch (err) {
      console.warn("Could not invalidate AI cache after deleting payment method")
    }

    return res.status(200).json({
      success: true,
      message: "Payment method deleted and associated transactions cleared",
    })
  } catch (error: any) {
    return res.status(500).json({ message: "Error deleting payment method", error: error.message })
  }
}

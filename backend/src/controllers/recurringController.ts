import { Request, Response } from "express"
import { RecurringTransaction, IRecurringTransaction } from "../models/RecurringTransaction"
import { RecurringExecutionHistory } from "../models/RecurringExecutionHistory"
import { Transaction } from "../models/Transaction"

function calculateNextDate(currentDate: Date, frequency: string): Date {
  const next = new Date(currentDate)
  switch (frequency) {
    case "daily":
      next.setDate(next.getDate() + 1)
      break
    case "weekly":
      next.setDate(next.getDate() + 7)
      break
    case "biweekly":
      next.setDate(next.getDate() + 14)
      break
    case "monthly":
      next.setMonth(next.getMonth() + 1)
      break
    case "quarterly":
      next.setMonth(next.getMonth() + 3)
      break
    case "yearly":
      next.setFullYear(next.getFullYear() + 1)
      break
    default:
      next.setMonth(next.getMonth() + 1)
  }
  return next
}

export const getRecurringTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    // Auto-process due executions
    await autoExecuteDue(userId)

    const recurring = await RecurringTransaction.find({ userId }).sort({ nextExecutionDate: 1 })
    return res.status(200).json({ success: true, recurring })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching recurring transactions", error: error.message })
  }
}

export const createRecurringTransaction = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const {
      title,
      amount,
      type,
      category,
      paymentMethod,
      merchant,
      notes,
      startDate,
      endDate,
      frequency,
      repeatCount,
      infiniteRepeat,
    } = req.body

    const start = startDate ? new Date(startDate) : new Date()

    const recurring = new RecurringTransaction({
      userId,
      title,
      amount: Math.abs(Number(amount)),
      type: type || "expense",
      category,
      paymentMethod: paymentMethod || "Credit Card",
      merchant: merchant || "",
      notes: notes || "",
      startDate: start,
      endDate: endDate ? new Date(endDate) : undefined,
      nextExecutionDate: start,
      frequency: frequency || "monthly",
      repeatCount: repeatCount || 0,
      infiniteRepeat: infiniteRepeat !== undefined ? infiniteRepeat : true,
      status: "active",
    })

    await recurring.save()
    return res.status(201).json({ success: true, message: "Recurring plan created", recurring })
  } catch (error: any) {
    return res.status(500).json({ message: "Error creating recurring transaction", error: error.message })
  }
}

export const pauseRecurring = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params

    const plan = await RecurringTransaction.findOne({ _id: id, userId })
    if (!plan) return res.status(404).json({ message: "Plan not found" })

    plan.status = "paused"
    await plan.save()

    return res.status(200).json({ success: true, message: "Recurring plan paused", plan })
  } catch (error: any) {
    return res.status(500).json({ message: "Error pausing plan", error: error.message })
  }
}

export const resumeRecurring = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params

    const plan = await RecurringTransaction.findOne({ _id: id, userId })
    if (!plan) return res.status(404).json({ message: "Plan not found" })

    plan.status = "active"
    await plan.save()

    return res.status(200).json({ success: true, message: "Recurring plan resumed", plan })
  } catch (error: any) {
    return res.status(500).json({ message: "Error resuming plan", error: error.message })
  }
}

export const cancelRecurring = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params

    const plan = await RecurringTransaction.findOne({ _id: id, userId })
    if (!plan) return res.status(404).json({ message: "Plan not found" })

    plan.status = "cancelled"
    await plan.save()

    return res.status(200).json({ success: true, message: "Recurring plan cancelled", plan })
  } catch (error: any) {
    return res.status(500).json({ message: "Error cancelling plan", error: error.message })
  }
}

export const skipNextRecurring = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params

    const plan = await RecurringTransaction.findOne({ _id: id, userId })
    if (!plan) return res.status(404).json({ message: "Plan not found" })

    // Advance to next execution date without creating a transaction
    plan.nextExecutionDate = calculateNextDate(plan.nextExecutionDate, plan.frequency)
    await plan.save()

    // Record history as skipped
    const history = new RecurringExecutionHistory({
      userId,
      recurringId: plan._id.toString(),
      executionDate: new Date(),
      status: "skipped",
      notes: "Skipped by user",
    })
    await history.save()

    return res.status(200).json({ success: true, message: "Next occurrence skipped", plan })
  } catch (error: any) {
    return res.status(500).json({ message: "Error skipping occurrence", error: error.message })
  }
}

export const getRecurringCalendarEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const plans = await RecurringTransaction.find({ userId, status: "active" })

    const events = plans.map((p) => ({
      id: p._id,
      title: p.title,
      amount: p.amount,
      type: p.type,
      category: p.category,
      date: p.nextExecutionDate.toISOString().split("T")[0],
      frequency: p.frequency,
    }))

    return res.status(200).json({ success: true, events })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching calendar events", error: error.message })
  }
}

async function autoExecuteDue(userId: string) {
  const now = new Date()
  const duePlans = await RecurringTransaction.find({
    userId,
    status: "active",
    nextExecutionDate: { $lte: now },
  })

  for (const plan of duePlans) {
    try {
      // 1. Create actual transaction
      const tx = new Transaction({
        userId: plan.userId,
        title: plan.title,
        amount: plan.amount,
        type: plan.type,
        category: plan.category,
        paymentMethod: plan.paymentMethod,
        merchant: plan.merchant,
        notes: plan.notes ? `${plan.notes} (Auto-generated)` : "Auto-generated recurring transaction",
        date: plan.nextExecutionDate,
        time: "09:00",
        recurring: true,
        recurringFrequency: plan.frequency as any,
        status: "completed",
      })
      await tx.save()

      // 2. Log history
      const history = new RecurringExecutionHistory({
        userId: plan.userId,
        recurringId: plan._id.toString(),
        transactionId: tx._id.toString(),
        executionDate: new Date(),
        status: "success",
      })
      await history.save()

      // 3. Update plan counter and next execution date
      plan.currentCount += 1
      plan.lastExecutedDate = new Date()

      if (!plan.infiniteRepeat && plan.repeatCount && plan.currentCount >= plan.repeatCount) {
        plan.status = "completed"
      } else {
        plan.nextExecutionDate = calculateNextDate(plan.nextExecutionDate, plan.frequency)
      }

      await plan.save()
    } catch (err) {
      console.error(`Error auto executing recurring transaction ${plan._id}:`, err)
    }
  }
}

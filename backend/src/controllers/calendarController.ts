import { Request, Response } from "express"
import { RecurringTransaction } from "../models/RecurringTransaction"
import { SavingsGoal } from "../models/SavingsGoal"
import { Budget } from "../models/Budget"

export const getCalendarEvents = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const [recurring, goals, budgets] = await Promise.all([
      RecurringTransaction.find({ userId, status: "active" }),
      SavingsGoal.find({ userId, status: "active" }),
      Budget.find({ userId }),
    ])

    const events = []

    // 1. Recurring Transactions & Subscriptions
    for (const rec of recurring) {
      events.push({
        id: `rec-${rec._id}`,
        title: rec.title,
        amount: rec.amount,
        type: rec.type,
        category: rec.category,
        date: new Date(rec.nextExecutionDate).toISOString().split("T")[0],
        eventType: "recurring",
        status: "scheduled",
      })
    }

    // 2. Savings Goals Deadlines
    for (const g of goals) {
      events.push({
        id: `goal-${g._id}`,
        title: `Goal Deadline: ${g.name}`,
        amount: g.targetAmount - g.currentSaved,
        type: "goal",
        category: g.goalType,
        date: new Date(g.targetDate).toISOString().split("T")[0],
        eventType: "goal",
        status: "pending",
      })
    }

    // 3. Budget Resets
    for (const b of budgets) {
      events.push({
        id: `budget-${b._id}`,
        title: `Budget Reset: ${b.name}`,
        amount: b.amount,
        type: "budget",
        category: b.category,
        date: new Date(b.endDate).toISOString().split("T")[0],
        eventType: "budget",
        status: "info",
      })
    }

    return res.status(200).json({ success: true, events })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching calendar events", error: error.message })
  }
}

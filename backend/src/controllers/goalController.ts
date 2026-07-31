import { Request, Response } from "express"
import { SavingsGoal } from "../models/SavingsGoal"
import { GoalContribution } from "../models/GoalContribution"

function calculateGoalMetrics(goal: any) {
  const remaining = Math.max(goal.targetAmount - goal.currentSaved, 0)
  const percentage = goal.targetAmount > 0 ? Math.min(Math.round((goal.currentSaved / goal.targetAmount) * 100), 100) : 0

  const now = new Date()
  const target = new Date(goal.targetDate)
  const monthsDiff = Math.max(
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth()),
    1
  )

  const monthlyNeeded = remaining > 0 ? Math.round(remaining / monthsDiff) : 0
  const weeklyNeeded = remaining > 0 ? Math.round(remaining / (monthsDiff * 4)) : 0
  const dailyNeeded = remaining > 0 ? Math.round(remaining / (monthsDiff * 30)) : 0

  let probability = "High"
  if (monthsDiff < 2 && remaining > 500) probability = "Low"
  else if (monthsDiff < 4 && remaining > 2000) probability = "Medium"

  return {
    ...goal.toObject(),
    remaining,
    percentage,
    monthlyNeeded,
    weeklyNeeded,
    dailyNeeded,
    probability,
  }
}

export const getGoals = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const { status, priority, type } = req.query
    const query: any = { userId }

    if (status && status !== "all") query.status = status
    if (priority && priority !== "all") query.priority = priority
    if (type && type !== "all") query.goalType = type

    const goals = await SavingsGoal.find(query).sort({ createdAt: -1 })
    const goalsWithMetrics = goals.map(calculateGoalMetrics)

    return res.status(200).json({ success: true, goals: goalsWithMetrics })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching goals", error: error.message })
  }
}

export const createGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const { name, description, goalType, targetAmount, currentSaved, targetDate, priority, color, icon, notes } = req.body

    const goal = new SavingsGoal({
      userId,
      name,
      description: description || "",
      goalType: goalType || "custom",
      targetAmount: Math.abs(Number(targetAmount)),
      currentSaved: Math.abs(Number(currentSaved || 0)),
      targetDate: new Date(targetDate),
      priority: priority || "medium",
      color: color || "#10b981",
      icon: icon || "Target",
      notes: notes || "",
      status: "active",
    })

    await goal.save()
    return res.status(201).json({ success: true, message: "Goal created", goal: calculateGoalMetrics(goal) })
  } catch (error: any) {
    return res.status(500).json({ message: "Error creating goal", error: error.message })
  }
}

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params

    const goal = await SavingsGoal.findOne({ _id: id, userId })
    if (!goal) return res.status(404).json({ message: "Goal not found" })

    Object.assign(goal, req.body)
    await goal.save()

    return res.status(200).json({ success: true, message: "Goal updated", goal: calculateGoalMetrics(goal) })
  } catch (error: any) {
    return res.status(500).json({ message: "Error updating goal", error: error.message })
  }
}

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params

    const result = await SavingsGoal.deleteOne({ _id: id, userId })
    if (result.deletedCount === 0) return res.status(404).json({ message: "Goal not found" })

    await GoalContribution.deleteMany({ goalId: id, userId })
    return res.status(200).json({ success: true, message: "Goal deleted" })
  } catch (error: any) {
    return res.status(500).json({ message: "Error deleting goal", error: error.message })
  }
}

export const addContribution = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params
    const { amount, type, notes } = req.body

    const goal = await SavingsGoal.findOne({ _id: id, userId })
    if (!goal) return res.status(404).json({ message: "Goal not found" })

    const contribAmount = Math.abs(Number(amount))
    if (type === "withdrawal") {
      goal.currentSaved = Math.max(goal.currentSaved - contribAmount, 0)
    } else {
      goal.currentSaved += contribAmount
      if (goal.currentSaved >= goal.targetAmount) {
        goal.status = "completed"
        goal.completedDate = new Date()
      }
    }

    await goal.save()

    const contrib = new GoalContribution({
      userId,
      goalId: id,
      amount: contribAmount,
      type: type || "deposit",
      notes: notes || "",
      date: new Date(),
    })
    await contrib.save()

    return res.status(200).json({
      success: true,
      message: type === "withdrawal" ? "Withdrawal processed" : "Contribution added",
      goal: calculateGoalMetrics(goal),
      contribution: contrib,
    })
  } catch (error: any) {
    return res.status(500).json({ message: "Error processing contribution", error: error.message })
  }
}

export const getGoalSummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const goals = await SavingsGoal.find({ userId })

    let totalSaved = 0
    let totalTarget = 0
    let activeCount = 0
    let completedCount = 0

    goals.forEach((g) => {
      totalSaved += g.currentSaved
      totalTarget += g.targetAmount
      if (g.status === "completed") completedCount++
      else if (g.status === "active") activeCount++
    })

    const overallPercentage = totalTarget > 0 ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100) : 0

    return res.status(200).json({
      success: true,
      summary: {
        totalSaved,
        totalTarget,
        remainingSavings: Math.max(totalTarget - totalSaved, 0),
        activeCount,
        completedCount,
        overallPercentage,
        totalGoals: goals.length,
      },
    })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching goal summary", error: error.message })
  }
}

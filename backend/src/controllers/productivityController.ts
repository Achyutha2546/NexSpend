import { Request, Response } from "express"
import { Habit } from "../models/Habit"
import { Challenge } from "../models/Challenge"
import { Bookmark } from "../models/Bookmark"
import { Transaction } from "../models/Transaction"
import { Budget } from "../models/Budget"
import { SavingsGoal } from "../models/SavingsGoal"

export const getHabits = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    let habits = await Habit.find({ userId })

    if (habits.length === 0) {
      habits = await Habit.insertMany([
        { userId, name: "No Spend Day", category: "Budgeting", streakCount: 0 },
        { userId, name: "Record Every Expense", category: "Tracking", streakCount: 0 },
        { userId, name: "Weekly Budget Review", category: "Planning", streakCount: 0 },
      ]) as any
    } else {
      // Check for streak reset if a day was missed (more than 1 full calendar day gap)
      const now = new Date()
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      for (const habit of habits) {
        if (habit.lastCompletedDate) {
          const lastDate = new Date(habit.lastCompletedDate)
          const lastDateStart = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
          const diffDays = Math.round((todayStart.getTime() - lastDateStart.getTime()) / (1000 * 3600 * 24))

          // If missed yesterday or earlier (diffDays > 1), reset streak to 0
          if (diffDays > 1 && habit.streakCount > 0) {
            habit.streakCount = 0
            await habit.save()
          }
        }
      }
    }

    return res.status(200).json({ success: true, habits })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching habits", error: error.message })
  }
}

export const checkInHabit = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    const { id } = req.params

    const habit = await Habit.findOne({ _id: id, userId })
    if (!habit) return res.status(404).json({ message: "Habit not found" })

    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (habit.lastCompletedDate) {
      const lastDate = new Date(habit.lastCompletedDate)
      const lastDateStart = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate())
      const diffDays = Math.round((todayStart.getTime() - lastDateStart.getTime()) / (1000 * 3600 * 24))

      if (diffDays === 0) {
        return res.status(400).json({
          success: false,
          message: "Already checked in today! Streak resets every day at 12:00 AM midnight.",
        })
      }

      if (diffDays === 1) {
        // Consecutive day check-in
        habit.streakCount += 1
      } else {
        // Missed one or more days, start fresh at 1
        habit.streakCount = 1
      }
    } else {
      // First time check-in
      habit.streakCount = 1
    }

    habit.lastCompletedDate = now
    await habit.save()

    return res.status(200).json({ success: true, habit })
  } catch (error: any) {
    return res.status(500).json({ message: "Error checking in habit", error: error.message })
  }
}

export const getChallenges = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    let challenges = await Challenge.find({ userId })

    if (challenges.length === 0) {
      const now = new Date()
      const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

      challenges = await Challenge.insertMany([
        {
          userId,
          title: "Save ₹100 This Week",
          description: "Cut non-essential spending by ₹15 daily for 7 days.",
          targetAmount: 100,
          currentAmount: 0,
          durationDays: 7,
          endDate: end,
          status: "active",
        },
        {
          userId,
          title: "No Coffee Shop Challenge",
          description: "Brew coffee at home for 5 consecutive workdays.",
          targetAmount: 25,
          currentAmount: 0,
          durationDays: 5,
          endDate: end,
          status: "active",
        },
      ]) as any
    }

    return res.status(200).json({ success: true, challenges })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching challenges", error: error.message })
  }
}

export const globalSearch = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const { q } = req.query
    if (!q || typeof q !== "string") {
      return res.status(200).json({ success: true, results: [] })
    }

    const regex = new RegExp(q, "i")

    const [txs, budgets, goals] = await Promise.all([
      Transaction.find({ userId, $or: [{ title: regex }, { category: regex }, { merchant: regex }] }).limit(5),
      Budget.find({ userId, $or: [{ name: regex }, { category: regex }] }).limit(5),
      SavingsGoal.find({ userId, name: regex }).limit(5),
    ])

    const results = [
      ...txs.map((t) => ({ type: "Transaction", title: t.title, subtitle: `₹${t.amount} - ${t.category}`, url: "/transactions" })),
      ...budgets.map((b) => ({ type: "Budget", title: b.name, subtitle: `Cap: ₹${b.amount}`, url: "/budget" })),
      ...goals.map((g) => ({ type: "Savings Goal", title: g.name, subtitle: `Target: ₹${g.targetAmount}`, url: "/goals" })),
    ]

    return res.status(200).json({ success: true, results })
  } catch (error: any) {
    return res.status(500).json({ message: "Error executing global search", error: error.message })
  }
}

export const getBookmarks = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const bookmarks = await Bookmark.find({ userId }).sort({ createdAt: -1 })
    return res.status(200).json({ success: true, bookmarks })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching bookmarks", error: error.message })
  }
}

export const createBookmark = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const { title, type, url, targetId } = req.body
    const bookmark = new Bookmark({ userId, title, type, url, targetId })
    await bookmark.save()

    return res.status(201).json({ success: true, bookmark })
  } catch (error: any) {
    return res.status(500).json({ message: "Error creating bookmark", error: error.message })
  }
}

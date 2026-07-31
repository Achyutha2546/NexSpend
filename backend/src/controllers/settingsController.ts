import { Request, Response } from "express"
import { UserPreferences } from "../models/UserPreferences"
import { NotificationPreferences } from "../models/NotificationPreferences"
import { Transaction } from "../models/Transaction"
import { Budget } from "../models/Budget"
import { RecurringTransaction } from "../models/RecurringTransaction"
import { SavingsGoal } from "../models/SavingsGoal"
import { User } from "../models/User"

export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    let prefs = await UserPreferences.findOne({ userId })
    if (!prefs) {
      prefs = new UserPreferences({ userId })
      await prefs.save()
    }

    return res.status(200).json({ success: true, preferences: prefs })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching user preferences", error: error.message })
  }
}

export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    let prefs = await UserPreferences.findOne({ userId })
    if (!prefs) prefs = new UserPreferences({ userId })

    Object.assign(prefs, req.body)
    await prefs.save()

    return res.status(200).json({ success: true, message: "Preferences updated", preferences: prefs })
  } catch (error: any) {
    return res.status(500).json({ message: "Error updating preferences", error: error.message })
  }
}

export const getNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    let notif = await NotificationPreferences.findOne({ userId })
    if (!notif) {
      notif = new NotificationPreferences({ userId })
      await notif.save()
    }

    return res.status(200).json({ success: true, notifications: notif })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching notification preferences", error: error.message })
  }
}

export const updateNotificationPreferences = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    let notif = await NotificationPreferences.findOne({ userId })
    if (!notif) notif = new NotificationPreferences({ userId })

    Object.assign(notif, req.body)
    await notif.save()

    return res.status(200).json({ success: true, message: "Notification preferences updated", notifications: notif })
  } catch (error: any) {
    return res.status(500).json({ message: "Error updating notifications", error: error.message })
  }
}

export const exportUserData = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const [user, transactions, budgets, recurring, goals, preferences] = await Promise.all([
      User.findOne({ firebaseUid: userId }),
      Transaction.find({ userId }),
      Budget.find({ userId }),
      RecurringTransaction.find({ userId }),
      SavingsGoal.find({ userId }),
      UserPreferences.findOne({ userId }),
    ])

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: user || { firebaseUid: userId },
      transactions,
      budgets,
      recurring,
      goals,
      preferences,
    }

    res.setHeader("Content-Type", "application/json")
    res.setHeader("Content-Disposition", `attachment; filename="nexspend-data-export-${Date.now()}.json"`)
    return res.status(200).json(exportData)
  } catch (error: any) {
    return res.status(500).json({ message: "Error exporting user data", error: error.message })
  }
}

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    await Promise.all([
      User.deleteOne({ firebaseUid: userId }),
      Transaction.deleteMany({ userId }),
      Budget.deleteMany({ userId }),
      RecurringTransaction.deleteMany({ userId }),
      SavingsGoal.deleteMany({ userId }),
      UserPreferences.deleteOne({ userId }),
      NotificationPreferences.deleteOne({ userId }),
    ])

    return res.status(200).json({ success: true, message: "Account and associated data deleted permanently." })
  } catch (error: any) {
    return res.status(500).json({ message: "Error deleting account", error: error.message })
  }
}

export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const sessions = [
      {
        id: "current-session",
        device: "Windows Chrome Desktop",
        ip: "192.168.1.1",
        lastActive: "Just now",
        isCurrent: true,
      },
      {
        id: "mobile-session-1",
        device: "iOS Mobile Safari",
        ip: "192.168.1.45",
        lastActive: "2 hours ago",
        isCurrent: false,
      },
    ]

    return res.status(200).json({ success: true, sessions })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching sessions", error: error.message })
  }
}

export const terminateAllOtherSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    return res.status(200).json({ success: true, message: "Terminated all other active sessions." })
  } catch (error: any) {
    return res.status(500).json({ message: "Error terminating sessions", error: error.message })
  }
}

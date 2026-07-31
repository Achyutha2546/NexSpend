import { Request, Response } from "express"
import { Notification } from "../models/Notification"
import { AutomationRule } from "../models/AutomationRule"

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    const { type, priority, isRead } = req.query
    const query: any = { userId }

    if (type && type !== "all") query.type = type
    if (priority && priority !== "all") query.priority = priority
    if (isRead !== undefined && isRead !== "all") query.isRead = isRead === "true"

    let notifications = await Notification.find(query).sort({ isPinned: -1, createdAt: -1 })

    // Auto seed initial smart notifications if empty
    if (notifications.length === 0 && !type && !priority) {
      const initial = [
        {
          userId,
          title: "Budget Cap Alert",
          message: "Food & Dining spending reached 82% of your set limit.",
          type: "budget",
          priority: "high",
          isRead: false,
          actionUrl: "/budget",
        },
        {
          userId,
          title: "Upcoming Subscription",
          message: "Netflix ($15.99) is due in 3 days.",
          type: "recurring",
          priority: "medium",
          isRead: false,
          actionUrl: "/recurring",
        },
        {
          userId,
          title: "Savings Goal Milestone",
          message: "Emergency Reserve reached 50% milestone target!",
          type: "goal",
          priority: "low",
          isRead: true,
          actionUrl: "/goals",
        },
      ]
      notifications = await Notification.insertMany(initial) as any
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false })

    return res.status(200).json({ success: true, notifications, unreadCount })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching notifications", error: error.message })
  }
}

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params

    const notif = await Notification.findOne({ _id: id, userId })
    if (!notif) return res.status(404).json({ message: "Notification not found" })

    notif.isRead = true
    await notif.save()

    return res.status(200).json({ success: true, notification: notif })
  } catch (error: any) {
    return res.status(500).json({ message: "Error marking as read", error: error.message })
  }
}

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } })
    return res.status(200).json({ success: true, message: "All marked as read" })
  } catch (error: any) {
    return res.status(500).json({ message: "Error marking all as read", error: error.message })
  }
}

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params

    await Notification.deleteOne({ _id: id, userId })
    return res.status(200).json({ success: true, message: "Notification deleted" })
  } catch (error: any) {
    return res.status(500).json({ message: "Error deleting notification", error: error.message })
  }
}

export const togglePinNotification = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params

    const notif = await Notification.findOne({ _id: id, userId })
    if (!notif) return res.status(404).json({ message: "Notification not found" })

    notif.isPinned = !notif.isPinned
    await notif.save()

    return res.status(200).json({ success: true, notification: notif })
  } catch (error: any) {
    return res.status(500).json({ message: "Error toggling pin", error: error.message })
  }
}

export const getAutomationRules = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"

    let rules = await AutomationRule.find({ userId })
    if (rules.length === 0) {
      rules = await AutomationRule.insertMany([
        {
          userId,
          name: "Budget Overspend Alert",
          triggerType: "budget_exceeded",
          thresholdValue: 80,
          action: "notify",
          isActive: true,
        },
        {
          userId,
          name: "Subscription Renewal Warning",
          triggerType: "subscription_renewing",
          thresholdValue: 3,
          action: "notify",
          isActive: true,
        },
      ]) as any
    }

    return res.status(200).json({ success: true, rules })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching automation rules", error: error.message })
  }
}

export const createAutomationRule = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const { name, triggerType, thresholdValue, action } = req.body

    const rule = new AutomationRule({
      userId,
      name,
      triggerType,
      thresholdValue: Number(thresholdValue || 80),
      action: action || "notify",
      isActive: true,
    })

    await rule.save()
    return res.status(201).json({ success: true, rule })
  } catch (error: any) {
    return res.status(500).json({ message: "Error creating automation rule", error: error.message })
  }
}

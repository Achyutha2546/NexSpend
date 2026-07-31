import { Router } from "express"
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  togglePinNotification,
  getAutomationRules,
  createAutomationRule,
} from "../controllers/notificationController"
import { verifyAuth } from "../middleware/authMiddleware"

const router = Router()

router.use(verifyAuth)

router.get("/", getNotifications)
router.patch("/read-all", markAllAsRead)
router.patch("/:id/read", markAsRead)
router.patch("/:id/pin", togglePinNotification)
router.delete("/:id", deleteNotification)
router.get("/rules", getAutomationRules)
router.post("/rules", createAutomationRule)

export default router

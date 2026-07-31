import { Router } from "express"
import {
  getUserPreferences,
  updateUserPreferences,
  getNotificationPreferences,
  updateNotificationPreferences,
  exportUserData,
  deleteAccount,
  getSessions,
  terminateAllOtherSessions,
} from "../controllers/settingsController"
import { verifyAuth } from "../middleware/authMiddleware"

const router = Router()

router.use(verifyAuth)

router.get("/preferences", getUserPreferences)
router.put("/preferences", updateUserPreferences)
router.get("/notifications", getNotificationPreferences)
router.put("/notifications", updateNotificationPreferences)
router.get("/export", exportUserData)
router.delete("/account", deleteAccount)
router.get("/sessions", getSessions)
router.post("/sessions/terminate-others", terminateAllOtherSessions)

export default router

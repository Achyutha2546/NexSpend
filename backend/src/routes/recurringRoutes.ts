import { Router } from "express"
import {
  getRecurringTransactions,
  createRecurringTransaction,
  pauseRecurring,
  resumeRecurring,
  cancelRecurring,
  skipNextRecurring,
  getRecurringCalendarEvents,
} from "../controllers/recurringController"
import { verifyAuth } from "../middleware/authMiddleware"

const router = Router()

router.use(verifyAuth)

router.get("/calendar", getRecurringCalendarEvents)
router.get("/", getRecurringTransactions)
router.post("/", createRecurringTransaction)
router.patch("/:id/pause", pauseRecurring)
router.patch("/:id/resume", resumeRecurring)
router.patch("/:id/cancel", cancelRecurring)
router.post("/:id/skip", skipNextRecurring)

export default router

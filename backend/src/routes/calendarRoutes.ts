import { Router } from "express"
import { getCalendarEvents } from "../controllers/calendarController"
import { verifyAuth } from "../middleware/authMiddleware"

const router = Router()

router.use(verifyAuth)

router.get("/events", getCalendarEvents)

export default router

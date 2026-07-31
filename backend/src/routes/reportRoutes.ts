import { Router } from "express"
import {
  generateExecutiveReport,
  exportCSVData,
  getReportsHistory,
  toggleFavoriteReport,
} from "../controllers/reportController"
import { verifyAuth } from "../middleware/authMiddleware"

const router = Router()

router.use(verifyAuth)

router.get("/generate", generateExecutiveReport)
router.get("/export-csv", exportCSVData)
router.get("/history", getReportsHistory)
router.patch("/history/:id/favorite", toggleFavoriteReport)

export default router

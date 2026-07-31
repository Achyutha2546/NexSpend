import { Router } from "express"
import {
  getAnalyticsSummary,
  getCategoryAnalytics,
  getMerchantAnalytics,
  getPaymentAnalytics,
  getSmartInsights,
  getMonthlyReport,
  getAchievements,
} from "../controllers/analyticsController"
import { verifyAuth } from "../middleware/authMiddleware"

const router = Router()

router.use(verifyAuth)

router.get("/summary", getAnalyticsSummary)
router.get("/categories", getCategoryAnalytics)
router.get("/merchants", getMerchantAnalytics)
router.get("/payments", getPaymentAnalytics)
router.get("/insights", getSmartInsights)
router.get("/monthly-report", getMonthlyReport)
router.get("/achievements", getAchievements)

export default router

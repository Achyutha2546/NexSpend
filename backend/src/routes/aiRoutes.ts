import { Router } from "express"
import {
  getAIHealth,
  getAIRecommendations,
  getAIForecast,
  runAIScenario,
  getAISummary,
  queryAIAssistant,
  getAIConversations,
  deleteAIHistory,
  generateWeeklyReview,
  generateMonthlyReview,
} from "../controllers/aiController"
import { verifyAuth } from "../middleware/authMiddleware"

import {
  detectCategory,
  saveMerchantMapping,
  getMerchantMappings,
  clearMerchantMappings,
} from "../controllers/categoryDetectionController"

const router = Router()

router.use(verifyAuth)

router.get("/health", getAIHealth)
router.get("/insights", getAISummary)
router.get("/recommendations", getAIRecommendations)
router.get("/forecast", getAIForecast)
router.post("/scenario", runAIScenario)
router.get("/summary", getAISummary)
router.post("/query", queryAIAssistant)
router.post("/chat", queryAIAssistant)
router.get("/conversations", getAIConversations)
router.get("/history", getAIConversations)
router.delete("/history", deleteAIHistory)
router.post("/weekly-review", generateWeeklyReview)
router.post("/monthly-review", generateMonthlyReview)

// Smart Category Auto-Detection routes
router.post("/detect-category", detectCategory)
router.post("/merchant-mapping", saveMerchantMapping)
router.get("/merchant-mappings", getMerchantMappings)
router.delete("/merchant-mappings", clearMerchantMappings)

export default router

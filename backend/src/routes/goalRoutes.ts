import { Router } from "express"
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
  getGoalSummary,
} from "../controllers/goalController"
import { verifyAuth } from "../middleware/authMiddleware"

const router = Router()

router.use(verifyAuth)

router.get("/summary", getGoalSummary)
router.get("/", getGoals)
router.post("/", createGoal)
router.put("/:id", updateGoal)
router.delete("/:id", deleteGoal)
router.post("/:id/contribution", addContribution)

export default router

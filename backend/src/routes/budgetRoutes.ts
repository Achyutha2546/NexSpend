import { Router } from "express"
import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetSummary,
} from "../controllers/budgetController"
import { verifyAuth } from "../middleware/authMiddleware"

const router = Router()

router.use(verifyAuth)

router.get("/summary", getBudgetSummary)
router.get("/", getBudgets)
router.post("/", createBudget)
router.put("/:id", updateBudget)
router.delete("/:id", deleteBudget)

export default router

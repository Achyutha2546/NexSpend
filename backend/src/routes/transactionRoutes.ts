import { Router } from "express"
import {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  archiveTransaction,
  restoreTransaction,
  permanentDeleteTransaction,
  duplicateTransaction,
  getDashboardSummary,
} from "../controllers/transactionController"
import { verifyAuth } from "../middleware/authMiddleware"

const router = Router()

router.use(verifyAuth)

router.get("/summary", getDashboardSummary)
router.get("/", getTransactions)
router.get("/:id", getTransactionById)
router.post("/", createTransaction)
router.put("/:id", updateTransaction)
router.patch("/:id/archive", archiveTransaction)
router.patch("/:id/restore", restoreTransaction)
router.post("/:id/duplicate", duplicateTransaction)
router.delete("/:id", deleteTransaction)
router.delete("/:id/permanent", permanentDeleteTransaction)

export default router

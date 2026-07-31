import { Router } from "express"
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from "../controllers/paymentMethodController"
import { verifyAuth } from "../middleware/authMiddleware"

const router = Router()

router.use(verifyAuth)

router.get("/", getPaymentMethods)
router.post("/", createPaymentMethod)
router.put("/:id", updatePaymentMethod)
router.delete("/:id", deletePaymentMethod)

export default router

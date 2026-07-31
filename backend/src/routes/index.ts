import { Router } from "express"
import authRoutes from "./authRoutes"
import transactionRoutes from "./transactionRoutes"
import categoryRoutes from "./categoryRoutes"
import paymentMethodRoutes from "./paymentMethodRoutes"
import budgetRoutes from "./budgetRoutes"
import recurringRoutes from "./recurringRoutes"
import analyticsRoutes from "./analyticsRoutes"
import goalRoutes from "./goalRoutes"
import settingsRoutes from "./settingsRoutes"
import reportRoutes from "./reportRoutes"
import notificationRoutes from "./notificationRoutes"
import calendarRoutes from "./calendarRoutes"
import aiRoutes from "./aiRoutes"
import productivityRoutes from "./productivityRoutes"

import { openApiSpec } from "../docs/swaggerSpec"

const router = Router()

router.use("/auth", authRoutes)
router.use("/transactions", transactionRoutes)
router.use("/categories", categoryRoutes)
router.use("/payment-methods", paymentMethodRoutes)
router.use("/budgets", budgetRoutes)
router.use("/recurring", recurringRoutes)
router.use("/analytics", analyticsRoutes)
router.use("/goals", goalRoutes)
router.use("/settings", settingsRoutes)
router.use("/reports", reportRoutes)
router.use("/notifications", notificationRoutes)
router.use("/calendar", calendarRoutes)
router.use("/ai", aiRoutes)
router.use("/productivity", productivityRoutes)

router.get("/docs", (req, res) => {
  res.json(openApiSpec)
})

router.get("/", (req, res) => {
  res.json({ message: "NexSpend API Routes" })
})

export default router

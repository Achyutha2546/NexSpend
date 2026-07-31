import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import dotenv from "dotenv"
import { connectDB } from "./config/db"
import { initFirebase } from "./config/firebase"
import { performStartupHealthCheck } from "./utils/startupHealthCheck"
import { errorHandler } from "./middleware/errorHandler"
import routes from "./routes"
import { logger } from "./utils/logger"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use("/api", routes)

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "NexSpend Production API is running" })
})

// Global Error Handler
app.use(errorHandler)

// Start server
const startServer = async () => {
  try {
    await connectDB()
    initFirebase()
    await performStartupHealthCheck()

    app.listen(PORT, () => {
      logger.info(`NexSpend Server running on port ${PORT}`)
    })
  } catch (error) {
    logger.error("Failed to start NexSpend server:", error)
    process.exit(1)
  }
}

startServer()

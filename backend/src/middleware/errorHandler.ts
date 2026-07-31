import { Request, Response, NextFunction } from "express"
import { logger } from "../utils/logger"

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(`API Error on ${req.method} ${req.url}`, err)

  const statusCode = err.statusCode || err.status || 500
  const message = err.message || "Internal Server Error"

  return res.status(statusCode).json({
    success: false,
    error: {
      message,
      type: err.name || "ServerError",
    },
  })
}

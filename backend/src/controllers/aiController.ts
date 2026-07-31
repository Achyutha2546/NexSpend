import { Request, Response } from "express"
import { AIService } from "../ai/services/AIService"
import { AIConversation } from "../models/AIConversation"

export const getAIHealth = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    const health = await AIService.getFinancialHealth(userId)
    return res.status(200).json({ success: true, health })
  } catch (error: any) {
    return res.status(500).json({ message: "Error in AI Health Engine", error: error.message })
  }
}

export const getAIRecommendations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    const recommendations = await AIService.getRecommendations(userId)
    return res.status(200).json({ success: true, recommendations })
  } catch (error: any) {
    return res.status(500).json({ message: "Error in AI Recommendation Engine", error: error.message })
  }
}

export const getAIForecast = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    const forecast = await AIService.getForecast(userId)
    return res.status(200).json({ success: true, forecast })
  } catch (error: any) {
    return res.status(500).json({ message: "Error in AI Forecast Engine", error: error.message })
  }
}

export const runAIScenario = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    const { type, deltaAmount } = req.body
    const result = await AIService.runScenario(userId, type, Number(deltaAmount || 0))
    return res.status(200).json({ success: true, scenario: result })
  } catch (error: any) {
    return res.status(500).json({ message: "Error in AI Scenario Engine", error: error.message })
  }
}

export const getAISummary = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    const response = await AIService.generateFinancialSummary(userId)
    return res.status(200).json({ success: true, summary: response })
  } catch (error: any) {
    return res.status(500).json({ message: "Error generating AI summary", error: error.message })
  }
}

export const queryAIAssistant = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    const { query } = req.body
    if (!query) return res.status(400).json({ message: "Query is required" })

    const response = await AIService.askAssistant(userId, query)

    // Save message to conversation history
    let conversation = await AIConversation.findOne({ userId }).sort({ updatedAt: -1 })
    if (!conversation) {
      conversation = new AIConversation({ userId, title: "AI Coach Advisory", messages: [] })
    }

    conversation.messages.push({ sender: "user", text: query, timestamp: new Date() })
    conversation.messages.push({ sender: "assistant", text: response.content, timestamp: new Date() })
    await conversation.save()

    return res.status(200).json({ success: true, response, conversation })
  } catch (error: any) {
    return res.status(500).json({ message: "Error querying AI Assistant", error: error.message })
  }
}

export const getAIConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    const conversations = await AIConversation.find({ userId }).sort({ updatedAt: -1 })
    return res.status(200).json({ success: true, conversations })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching conversations", error: error.message })
  }
}

export const deleteAIHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    await AIConversation.deleteMany({ userId })
    return res.status(200).json({ success: true, message: "AI chat history cleared" })
  } catch (error: any) {
    return res.status(500).json({ message: "Error clearing history", error: error.message })
  }
}

export const generateWeeklyReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    const summary = await AIService.generateFinancialSummary(userId)
    const health = await AIService.getFinancialHealth(userId)

    return res.status(200).json({
      success: true,
      review: {
        title: "Weekly Performance Review",
        summary: summary.content,
        healthScore: health.overallHealthScore,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    return res.status(500).json({ message: "Error generating weekly review", error: error.message })
  }
}

export const generateMonthlyReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    const summary = await AIService.generateFinancialSummary(userId)
    const forecast = await AIService.getForecast(userId)

    return res.status(200).json({
      success: true,
      review: {
        title: "Executive Monthly Financial Review",
        summary: summary.content,
        projectedBalance: forecast.endOfMonthBalance,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    return res.status(500).json({ message: "Error generating monthly review", error: error.message })
  }
}

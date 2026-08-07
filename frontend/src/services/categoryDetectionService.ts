import { api } from "./api"

export interface DetectionResult {
  category: string | null
  confidence: "High" | "Medium" | "Low"
  source: "user_learned" | "local_dictionary" | "ai_fallback" | "fallback" | "none"
}

export interface MerchantMappingItem {
  _id: string
  merchant: string
  categoryId: string
  confidence: string
  usageCount: number
  lastUsed: string
}

export const categoryDetectionService = {
  async detectCategory(title: string, merchant?: string, type: string = "expense"): Promise<DetectionResult> {
    try {
      const response = await api.post("/ai/detect-category", { title, merchant, type })
      return response.data
    } catch {
      return { category: null, confidence: "Low", source: "none" }
    }
  },

  async scanReceipt(receiptText?: string, imageBase64?: string): Promise<any> {
    try {
      const response = await api.post("/ai/scan-receipt", { receiptText, imageBase64 })
      return response.data?.extracted || null
    } catch {
      return null
    }
  },

  async saveMapping(merchant: string, categoryId: string): Promise<void> {
    try {
      await api.post("/ai/merchant-mapping", { merchant, categoryId })
    } catch {
      // Ignore
    }
  },

  async getMappings(): Promise<MerchantMappingItem[]> {
    const response = await api.get("/ai/merchant-mappings")
    return response.data.mappings
  },

  async clearMappings(): Promise<void> {
    await api.delete("/ai/merchant-mappings")
  },
}

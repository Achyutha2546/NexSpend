import { Request, Response } from "express"
import { MerchantCategoryMapping } from "../models/MerchantCategoryMapping"
import { AIProviderFactory } from "../ai/providers/AIProviderFactory"

// Comprehensive Local Category Keywords Dictionary
const DICTIONARY: { [key: string]: string[] } = {
  Food: [
    "domino", "pizza", "swiggy", "zomato", "kfc", "mcdonald", "burger", "subway", "starbucks",
    "cafe", "restaurant", "baking", "bakery", "diner", "food", "tea", "coffee", "chai", "bistro", "eatery"
  ],
  Transport: [
    "uber", "ola", "rapido", "metro", "cab", "taxi", "bus", "train", "irctc", "flight", "indigo",
    "air india", "vistara", "auto", "toll", "fastag"
  ],
  Shopping: [
    "amazon", "flipkart", "myntra", "meesho", "nykaa", "ajio", "tata cliq", "mart", "supermarket",
    "grocery", "blinkit", "zepto", "instamart", "bigbasket", "reliancemart", "decathlon", "zara", "h&m"
  ],
  Entertainment: [
    "netflix", "spotify", "hotstar", "youtube", "prime video", "cinema", "pvr", "inox", "bookmyshow",
    "steam", "playstation", "xbox", "game", "movie", "apple music"
  ],
  Utilities: [
    "electricity", "water", "internet", "airtel", "jio", "vi", "vodafone", "idea", "gas", "cylinder",
    "broadband", "dth", "recharge", "bill", "bescom", "tata play"
  ],
  Salary: [
    "salary", "payroll", "stipend", "wages", "bonus", "compensation", "employer", "payout"
  ],
  Freelance: [
    "freelance", "upwork", "fiverr", "consulting", "project fee", "client payment", "gig"
  ],
  Housing: [
    "rent", "maintenance", "society", "house rent", "landlord", "flat", "pg rent"
  ],
  Loans: [
    "emi", "loan", "mortgage", "credit card bill", "interest", "finance"
  ],
  Health: [
    "medical", "pharmacy", "apollo", "hospital", "doctor", "clinic", "netmeds", "pharmeasy", "1mg", "lab", "test"
  ],
  Fuel: [
    "petrol", "fuel", "diesel", "hp petrol", "indian oil", "bharat petroleum", "shell", "cng"
  ],
  Subscriptions: [
    "subscription", "membership", "annual fee", "saas", "chatgpt", "midjourney"
  ],
  Education: [
    "school", "college", "tuition", "course", "udemy", "coursera", "books", "stationery", "exam fee"
  ],
}

// Clean and normalize text (remove punctuation, spaces, lowercase)
const normalize = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, "")

export const detectCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    const { title, merchant, type = "expense" } = req.body

    const rawInput = (title || merchant || "").trim()
    if (!rawInput) {
      return res.status(200).json({ success: true, category: null, confidence: "Low", source: "none" })
    }

    const cleanInput = normalize(rawInput)

    // Priority 1: User Learned Mappings
    const learned = await MerchantCategoryMapping.findOne({
      userId,
      merchant: rawInput.toLowerCase(),
    })

    if (learned) {
      return res.status(200).json({
        success: true,
        category: learned.categoryId,
        confidence: "High",
        source: "user_learned",
      })
    }

    // Priority 2: Local Keyword Dictionary (Exact, Contains, Partial)
    for (const [category, keywords] of Object.entries(DICTIONARY)) {
      for (const kw of keywords) {
        const cleanKw = normalize(kw)
        if (cleanInput === cleanKw || cleanInput.includes(cleanKw) || cleanKw.includes(cleanInput)) {
          return res.status(200).json({
            success: true,
            category,
            confidence: "High",
            source: "local_dictionary",
          })
        }
      }
    }

    // Priority 3: AI Fallback Engine
    try {
      const provider = AIProviderFactory.getProvider()
      const prompt = `Classify this transaction title "${rawInput}" into one of the following financial categories:
Available categories: Food, Transport, Shopping, Bills, Entertainment, Health, Education, Travel, Subscriptions, Salary, Freelance, Housing, Loans, Fuel, Others.
Respond with ONLY the exact category name and nothing else.`
      
      const response = await provider.generate(prompt)
      const aiCategory = response.content.trim()

      if (aiCategory && aiCategory.length < 25) {
        return res.status(200).json({
          success: true,
          category: aiCategory,
          confidence: "Medium",
          source: "ai_fallback",
        })
      }
    } catch (aiErr) {
      // AI fallback warning
    }

    return res.status(200).json({
      success: true,
      category: type === "income" ? "Salary" : "Others",
      confidence: "Low",
      source: "fallback",
    })
  } catch (error: any) {
    return res.status(500).json({ message: "Error detecting category", error: error.message })
  }
}

export const saveMerchantMapping = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    const { merchant, categoryId } = req.body

    if (!merchant || !categoryId) {
      return res.status(400).json({ message: "Merchant and categoryId are required" })
    }

    const normalizedMerchant = merchant.trim().toLowerCase()

    const mapping = await MerchantCategoryMapping.findOneAndUpdate(
      { userId, merchant: normalizedMerchant },
      {
        categoryId,
        confidence: "High",
        lastUsed: new Date(),
        $inc: { usageCount: 1 },
      },
      { upsert: true, new: true }
    )

    return res.status(200).json({ success: true, mapping })
  } catch (error: any) {
    return res.status(500).json({ message: "Error saving merchant mapping", error: error.message })
  }
}

export const getMerchantMappings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    const mappings = await MerchantCategoryMapping.find({ userId }).sort({ updatedAt: -1 })
    return res.status(200).json({ success: true, mappings })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching mappings", error: error.message })
  }
}

export const clearMerchantMappings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid || "demo-user-123"
    await MerchantCategoryMapping.deleteMany({ userId })
    return res.status(200).json({ success: true, message: "Learned category mappings cleared" })
  } catch (error: any) {
    return res.status(500).json({ message: "Error clearing mappings", error: error.message })
  }
}

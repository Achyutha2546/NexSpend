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

export const scanReceipt = async (req: Request, res: Response) => {
  try {
    const { receiptText, imageBase64 } = req.body
    if (!receiptText && !imageBase64) {
      return res.status(400).json({ message: "Receipt text or image is required" })
    }

    const textToAnalyze = receiptText || ""

    let amount: number | null = null
    let merchant = ""
    let title = ""
    let category = "Shopping"
    let type: "expense" | "income" = "expense"
    let paymentMethod = "UPI"
    let date = new Date().toISOString().split("T")[0]

    // PhonePe, GPay, Paytm & Bank SMS regex parsing
    // 1. Amount Extraction (₹ 1,500.00 or Rs. 500 or 1500 INR)
    const amountMatch = textToAnalyze.match(/(?:₹|Rs\.?|INR|\b)\s*([0-9,]+(?:\.[0-9]{1,2})?)/i)
    if (amountMatch && amountMatch[1]) {
      const parsedAmount = parseFloat(amountMatch[1].replace(/,/g, ""))
      if (!isNaN(parsedAmount) && parsedAmount > 0) {
        amount = parsedAmount
      }
    }

    // 2. Payment App / Method Detection
    const lower = textToAnalyze.toLowerCase()
    if (lower.includes("phonepe")) {
      paymentMethod = "UPI"
      merchant = "PhonePe Transfer"
    } else if (lower.includes("gpay") || lower.includes("google pay")) {
      paymentMethod = "UPI"
      merchant = "Google Pay"
    } else if (lower.includes("paytm")) {
      paymentMethod = "Paytm / UPI"
      merchant = "Paytm"
    } else if (lower.includes("credit card")) {
      paymentMethod = "Credit Card"
    } else if (lower.includes("debit card")) {
      paymentMethod = "Debit Card"
    }

    // 3. Detect Merchant / Payee
    const merchantMatch = textToAnalyze.match(/(?:paid to|to|sent to|merchant|vendor|at)\s+([A-Za-z0-9\s&'-]{3,30})/i)
    if (merchantMatch && merchantMatch[1]) {
      const extractedMerchant = merchantMatch[1].trim()
      if (!["phonepe", "gpay", "google pay", "paytm", "upi", "bank"].includes(extractedMerchant.toLowerCase())) {
        merchant = extractedMerchant
      }
    }

    // 4. Type & Category Detection
    if (lower.includes("received") || lower.includes("credited") || lower.includes("cashback")) {
      type = "income"
      category = "Income"
      title = merchant ? `Received from ${merchant}` : "Payment Received"
    } else {
      type = "expense"
      title = merchant ? `Paid to ${merchant}` : "UPI Payment"

      // Match category dictionary
      for (const [cat, keywords] of Object.entries(DICTIONARY)) {
        if (keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
          category = cat
          break
        }
      }
    }

    // Priority AI OCR Enhancement
    try {
      const provider = AIProviderFactory.getProvider()
      const prompt = `Analyze this digital payment receipt / screenshot text and return a strict JSON object:
Text: "${textToAnalyze.slice(0, 1000)}"

Return format:
{
  "title": "Short title e.g. Domino's Pizza or Paid to Swiggy",
  "amount": 250,
  "type": "expense" or "income",
  "category": "Food" or "Transport" or "Shopping" or "Bills" or "Entertainment" or "Health" or "Education" or "Travel" or "Subscriptions" or "Salary" or "Others",
  "paymentMethod": "UPI" or "Credit Card" or "Bank Account" or "Cash",
  "merchant": "Merchant name"
}`

      const response = await provider.generate(prompt, { responseFormat: "json" })
      const jsonParsed = JSON.parse(response.content.replace(/```json|```/g, "").trim())

      if (jsonParsed.amount && !isNaN(jsonParsed.amount)) amount = jsonParsed.amount
      if (jsonParsed.title) title = jsonParsed.title
      if (jsonParsed.merchant) merchant = jsonParsed.merchant
      if (jsonParsed.category) category = jsonParsed.category
      if (jsonParsed.type) type = jsonParsed.type
      if (jsonParsed.paymentMethod) paymentMethod = jsonParsed.paymentMethod
    } catch (aiErr) {
      // Fallback regex extracted values remain active
    }

    return res.status(200).json({
      success: true,
      extracted: {
        title: title || (type === "income" ? "Income Received" : "Payment"),
        amount: amount || 0,
        type,
        category,
        paymentMethod,
        merchant,
        date,
      },
    })
  } catch (error: any) {
    return res.status(500).json({ message: "Error scanning receipt", error: error.message })
  }
}

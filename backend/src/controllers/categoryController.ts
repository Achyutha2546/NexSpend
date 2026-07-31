import { Request, Response } from "express"
import { Category } from "../models/Category"
import { Transaction } from "../models/Transaction"

const DEFAULT_CATEGORIES = [
  // Expense Categories
  { name: "Food", type: "expense", icon: "Utensils", color: "#f97316", isDefault: true },
  { name: "Transport", type: "expense", icon: "Car", color: "#06b6d4", isDefault: true },
  { name: "Shopping", type: "expense", icon: "ShoppingBag", color: "#ec4899", isDefault: true },
  { name: "Bills", type: "expense", icon: "FileText", color: "#ef4444", isDefault: true },
  { name: "Entertainment", type: "expense", icon: "Tv", color: "#8b5cf6", isDefault: true },
  { name: "Health", type: "expense", icon: "HeartPulse", color: "#10b981", isDefault: true },
  { name: "Education", type: "expense", icon: "GraduationCap", color: "#3b82f6", isDefault: true },
  { name: "Travel", type: "expense", icon: "Plane", color: "#f59e0b", isDefault: true },
  { name: "Subscriptions", type: "expense", icon: "Repeat", color: "#6366f1", isDefault: true },
  { name: "Others", type: "expense", icon: "MoreHorizontal", color: "#64748b", isDefault: true },
  // Income Categories
  { name: "Salary", type: "income", icon: "Briefcase", color: "#10b981", isDefault: true },
  { name: "Freelance", type: "income", icon: "Laptop", color: "#3b82f6", isDefault: true },
  { name: "Investments", type: "income", icon: "TrendingUp", color: "#f59e0b", isDefault: true },
  { name: "Gifts", type: "income", icon: "Gift", color: "#ec4899", isDefault: true },
  { name: "Others", type: "income", icon: "MoreHorizontal", color: "#64748b", isDefault: true },
]

export const getCategories = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const userCategories = userId ? await Category.find({ userId }) : []

    // Merge defaults with user categories
    const categories = [...DEFAULT_CATEGORIES, ...userCategories]
    return res.status(200).json({ success: true, categories })
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching categories", error: error.message })
  }
}

export const createCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    if (!userId) return res.status(401).json({ message: "Unauthorized" })

    const { name, type, icon, color, initialAmount } = req.body

    const category = new Category({
      name,
      type: type || "expense",
      icon: icon || "Tag",
      color: color || "#6366f1",
      initialAmount: Number(initialAmount || 0),
      isDefault: false,
      userId,
    })

    await category.save()

    // Create an initial balance transaction if type is income and initialAmount > 0
    if (category.type === "income" && category.initialAmount && category.initialAmount > 0) {
      const initialTx = new Transaction({
        userId,
        title: `${name} Initial Balance`,
        amount: category.initialAmount,
        type: "income",
        category: name,
        paymentMethod: "Cash", // default placeholder
        date: new Date(),
        notes: `Initial balance for income source: ${name}`,
        status: "completed",
      })
      await initialTx.save()
    }

    return res.status(201).json({ success: true, message: "Category created", category })
  } catch (error: any) {
    return res.status(500).json({ message: "Error creating category", error: error.message })
  }
}

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params

    const category = await Category.findOne({ _id: id, userId })
    if (!category) {
      return res.status(404).json({ message: "Category not found or not customizable" })
    }

    Object.assign(category, req.body)
    await category.save()

    return res.status(200).json({ success: true, message: "Category updated", category })
  } catch (error: any) {
    return res.status(500).json({ message: "Error updating category", error: error.message })
  }
}

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.uid
    const { id } = req.params

    const result = await Category.deleteOne({ _id: id, userId })
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Category not found or default" })
    }

    return res.status(200).json({ success: true, message: "Category deleted" })
  } catch (error: any) {
    return res.status(500).json({ message: "Error deleting category", error: error.message })
  }
}

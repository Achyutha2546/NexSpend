import { api } from "./api"

export interface CategoryItem {
  _id?: string
  name: string
  type: "income" | "expense"
  icon: string
  color: string
  initialAmount?: number
  isDefault?: boolean
}

export const categoryService = {
  async getCategories(): Promise<CategoryItem[]> {
    const response = await api.get("/categories")
    return response.data.categories
  },

  async createCategory(category: Partial<CategoryItem>): Promise<CategoryItem> {
    const response = await api.post("/categories", category)
    return response.data.category
  },

  async updateCategory(id: string, category: Partial<CategoryItem>): Promise<CategoryItem> {
    const response = await api.put(`/categories/${id}`, category)
    return response.data.category
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/categories/${id}`)
  },
}

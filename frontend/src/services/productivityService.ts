import { api } from "./api"

export interface HabitItem {
  _id: string
  name: string
  category: string
  streakCount: number
  lastCompletedDate?: string
}

export interface ChallengeItem {
  _id: string
  title: string
  description: string
  targetAmount: number
  currentAmount: number
  durationDays: number
  endDate: string
  status: string
}

export interface SearchResultItem {
  type: string
  title: string
  subtitle: string
  url: string
}

export interface BookmarkItem {
  _id: string
  title: string
  type: string
  url?: string
}

export const productivityService = {
  async getHabits(): Promise<HabitItem[]> {
    const response = await api.get("/productivity/habits")
    return response.data.habits
  },

  async checkInHabit(id: string): Promise<HabitItem> {
    const response = await api.patch(`/productivity/habits/${id}/checkin`)
    return response.data.habit
  },

  async getChallenges(): Promise<ChallengeItem[]> {
    const response = await api.get("/productivity/challenges")
    return response.data.challenges
  },

  async globalSearch(query: string): Promise<SearchResultItem[]> {
    const response = await api.get("/productivity/search", { params: { q: query } })
    return response.data.results
  },

  async getBookmarks(): Promise<BookmarkItem[]> {
    const response = await api.get("/productivity/bookmarks")
    return response.data.bookmarks
  },

  async createBookmark(title: string, type: string, url?: string): Promise<BookmarkItem> {
    const response = await api.post("/productivity/bookmarks", { title, type, url })
    return response.data.bookmark
  },
}

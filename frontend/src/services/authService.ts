import { api } from "./api"

export interface UserProfile {
  _id: string
  firebaseUid: string
  name: string
  email: string
  photoURL?: string
  currency: string
  theme: "light" | "dark" | "system"
  language: string
  lastLogin: string
  createdAt: string
  updatedAt: string
}

export const authService = {
  async syncUser(userData?: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.post("/auth/sync", userData || {})
    return response.data.user
  },

  async getMe(): Promise<UserProfile> {
    const response = await api.get("/auth/me")
    return response.data.user
  },

  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const response = await api.put("/auth/profile", profileData)
    return response.data.user
  },
}

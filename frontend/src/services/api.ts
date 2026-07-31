import axios from "axios"
import { auth } from "@/lib/firebase"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Attach Firebase ID token to every outgoing request automatically
api.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser
    if (currentUser) {
      try {
        const token = await currentUser.getIdToken()
        config.headers.Authorization = `Bearer ${token}`
      } catch (error) {
        console.error("Failed to retrieve Firebase ID Token:", error)
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Extract server error messages so UI toast shows the actual backend message
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage = error.response?.data?.message
    if (serverMessage) {
      const enhancedError = new Error(serverMessage)
      ;(enhancedError as any).status = error.response?.status
      ;(enhancedError as any).response = error.response
      return Promise.reject(enhancedError)
    }
    return Promise.reject(error)
  }
)

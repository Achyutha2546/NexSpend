import React, { createContext, useContext, useEffect, useState } from "react"
import { 
  User as FirebaseUser, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile as updateFirebaseProfile,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { authService, UserProfile } from "@/services/authService"
import { toast } from "sonner"

interface AuthContextType {
  firebaseUser: FirebaseUser | null
  mongoUser: UserProfile | null
  loading: boolean
  isAuthenticated: boolean
  loginWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  resendVerificationEmail: () => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [mongoUser, setMongoUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        try {
          // Sync or fetch MongoDB user profile
          const profile = await authService.syncUser({
            name: user.displayName || user.email?.split("@")[0] || "User",
            photoURL: user.photoURL || "",
            email: user.email || "",
          })
          setMongoUser(profile)
        } catch (error) {
          console.warn("Could not sync user with MongoDB backend:", error)
          // Fallback user object if backend isn't reachable
          setMongoUser({
            _id: user.uid,
            firebaseUid: user.uid,
            name: user.displayName || user.email?.split("@")[0] || "User",
            email: user.email || "",
            photoURL: user.photoURL || "",
            currency: "INR",
            theme: "system",
            language: "en",
            lastLogin: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
        }
      } else {
        setMongoUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const loginWithEmail = async (email: string, password: string, rememberMe: boolean = true) => {
    setLoading(true)
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const profile = await authService.syncUser({
        email: userCredential.user.email || email,
      })
      setMongoUser(profile)
      toast.success(`Welcome back, ${profile.name}!`)
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in. Please check your credentials.")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const registerWithEmail = async (email: string, password: string, name: string) => {
    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email, password)
      if (auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, { displayName: name })
      }
      const profile = await authService.syncUser({
        name,
        email,
      })
      setMongoUser(profile)
      toast.success("Account created successfully!")
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.")
      throw error
    } finally {
      setLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    setLoading(true)
    try {
      const userCredential = await signInWithPopup(auth, googleProvider)
      const user = userCredential.user
      const profile = await authService.syncUser({
        name: user.displayName || user.email?.split("@")[0] || "User",
        photoURL: user.photoURL || "",
        email: user.email || "",
      })
      setMongoUser(profile)
      toast.success(`Signed in as ${profile.name}`)
    } catch (error: any) {
      if (error.code !== "auth/popup-closed-by-user") {
        toast.error(error.message || "Google sign-in failed.")
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success("Password reset link sent to your email!")
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset email.")
      throw error
    }
  }

  const resendVerificationEmail = async () => {
    if (!auth.currentUser) {
      toast.error("No user currently signed in.")
      return
    }
    try {
      await sendEmailVerification(auth.currentUser)
      toast.success("Verification email sent!")
    } catch (error: any) {
      toast.error(error.message || "Failed to send verification email.")
      throw error
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await signOut(auth)
      setMongoUser(null)
      setFirebaseUser(null)
      toast.success("Signed out successfully.")
    } catch (error: any) {
      toast.error("Logout failed.")
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      const updated = await authService.updateProfile(data)
      setMongoUser(updated)
      if (data.name && auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, { displayName: data.name })
      }
      toast.success("Profile updated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile.")
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        mongoUser,
        loading,
        isAuthenticated: !!firebaseUser,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        resetPassword,
        resendVerificationEmail,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

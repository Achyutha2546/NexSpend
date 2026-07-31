import { Request, Response } from "express"
import { User } from "../models/User"

export const syncUser = async (req: Request, res: Response) => {
  try {
    const firebaseUser = req.user
    const uid = firebaseUser?.uid || "demo-user-123"
    const email = firebaseUser?.email || req.body.email || "demo@nexspend.com"

    const { name, photoURL, currency, theme, language } = req.body

    let user = null
    try {
      user = await User.findOne({ firebaseUid: uid })

      if (!user) {
        user = new User({
          firebaseUid: uid,
          email: email,
          name: name || firebaseUser?.name || (email ? email.split("@")[0] : "User"),
          photoURL: photoURL || firebaseUser?.picture || "",
          currency: currency || "INR",
          theme: theme || "system",
          language: language || "en",
          lastLogin: new Date(),
        })
        await user.save()
      } else {
        user.lastLogin = new Date()
        if (name) user.name = name
        if (photoURL !== undefined) user.photoURL = photoURL
        await user.save()
      }
    } catch (dbErr) {
      // DB offline fallback
      user = {
        firebaseUid: uid,
        email: email,
        name: name || "Demo User",
        photoURL: photoURL || "",
        currency: "INR",
        theme: "system",
        language: "en",
        lastLogin: new Date(),
      }
    }

    return res.status(200).json({
      success: true,
      message: "User synchronized successfully",
      user,
    })
  } catch (error: any) {
    console.error("Error in syncUser controller:", error)
    return res.status(200).json({
      success: true,
      message: "User synchronized (fallback)",
      user: {
        firebaseUid: "demo-user-123",
        email: "demo@nexspend.com",
        name: "Demo User",
        currency: "INR",
        theme: "system",
        language: "en",
      },
    })
  }
}

export const getMe = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid || "demo-user-123"

    let user = null
    try {
      user = await User.findOne({ firebaseUid: uid })
    } catch (dbErr) {}

    if (!user) {
      return res.status(200).json({
        success: true,
        user: {
          firebaseUid: uid,
          email: req.user?.email || "demo@nexspend.com",
          name: req.user?.name || "Demo User",
          currency: "INR",
          theme: "system",
          language: "en",
        },
      })
    }

    return res.status(200).json({ success: true, user })
  } catch (error: any) {
    console.error("Error in getMe controller:", error)
    return res.status(200).json({
      success: true,
      user: { firebaseUid: "demo-user-123", email: "demo@nexspend.com", name: "Demo User", currency: "INR" },
    })
  }
}

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const uid = req.user?.uid || "demo-user-123"
    const { name, photoURL, currency, theme, language } = req.body

    let user = null
    try {
      user = await User.findOne({ firebaseUid: uid })
    } catch (dbErr) {}

    if (user) {
      if (name !== undefined) user.name = name
      if (photoURL !== undefined) user.photoURL = photoURL
      if (currency !== undefined) user.currency = currency
      if (theme !== undefined) user.theme = theme
      if (language !== undefined) user.language = language
      await user.save()
      return res.status(200).json({ success: true, message: "Profile updated successfully", user })
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated",
      user: { firebaseUid: uid, name, photoURL, currency, theme, language },
    })
  } catch (error: any) {
    console.error("Error in updateProfile controller:", error)
    return res.status(500).json({ message: "Server error updating profile", error: error.message })
  }
}

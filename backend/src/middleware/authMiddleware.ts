import { Request, Response, NextFunction } from "express"
import { adminAuth } from "../config/firebase"

export const verifyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1]
      if (token && token !== "undefined" && token !== "null") {
        if (adminAuth) {
          try {
            const decodedToken = await adminAuth.verifyIdToken(token)
            req.user = decodedToken
            return next()
          } catch (tokenErr) {
            // Fallback decode for development/test tokens
            const payloadBase64 = token.split(".")[1]
            if (payloadBase64) {
              const decodedJson = JSON.parse(Buffer.from(payloadBase64, "base64").toString("utf-8"))
              req.user = {
                uid: decodedJson.user_id || decodedJson.sub || decodedJson.uid || "demo-uid",
                email: decodedJson.email || "demo@nexspend.com",
                name: decodedJson.name || decodedJson.email?.split("@")[0] || "Demo User",
                picture: decodedJson.picture || "",
              } as any
              return next()
            }
          }
        }
      }
    }

    // Default development user fallback if unauthenticated
    req.user = {
      uid: "demo-user-123",
      email: "demo@nexspend.com",
      name: "Demo User",
      picture: "",
    } as any
    return next()
  } catch (error: any) {
    req.user = {
      uid: "demo-user-123",
      email: "demo@nexspend.com",
      name: "Demo User",
    } as any
    return next()
  }
}

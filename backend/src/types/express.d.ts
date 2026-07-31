import { DecodedIdToken } from "firebase-admin/auth"

declare global {
  namespace Express {
    interface Request {
      user?: DecodedIdToken | { uid: string; email?: string; name?: string; picture?: string }
    }
  }
}

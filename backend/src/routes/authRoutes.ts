import { Router } from "express"
import { syncUser, getMe, updateProfile } from "../controllers/authController"
import { verifyAuth } from "../middleware/authMiddleware"

const router = Router()

router.post("/sync", verifyAuth, syncUser)
router.get("/me", verifyAuth, getMe)
router.put("/profile", verifyAuth, updateProfile)

export default router

import { Router } from "express"
import {
  getHabits,
  checkInHabit,
  getChallenges,
  globalSearch,
  getBookmarks,
  createBookmark,
} from "../controllers/productivityController"
import { verifyAuth } from "../middleware/authMiddleware"

const router = Router()

router.use(verifyAuth)

router.get("/habits", getHabits)
router.patch("/habits/:id/checkin", checkInHabit)
router.get("/challenges", getChallenges)
router.get("/search", globalSearch)
router.get("/bookmarks", getBookmarks)
router.post("/bookmarks", createBookmark)

export default router

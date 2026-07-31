import { Router } from "express"
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController"
import { verifyAuth } from "../middleware/authMiddleware"

const router = Router()

router.use(verifyAuth)

router.get("/", getCategories)
router.post("/", createCategory)
router.put("/:id", updateCategory)
router.delete("/:id", deleteCategory)

export default router

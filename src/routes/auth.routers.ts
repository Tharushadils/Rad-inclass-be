import { Router } from "express"
import { adminAccess, getMyDetails, login, register } from "./../controllers/auth.controller"
import { authenticate } from "../midlewares/auth"
import { authorize } from "../midlewares/role"
import { UserRole } from "../models/user.model"

const router = Router()

router.post("/login", login)
router.post("/register", register)

// Private user route
router.get("/me", authenticate, getMyDetails)

// Admin-only route (Protected by authentication + ADMIN role)
router.get("/admin", authenticate, authorize(UserRole.ADMIN), adminAccess)

export default router
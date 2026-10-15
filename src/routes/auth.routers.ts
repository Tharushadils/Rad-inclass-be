import { Router } from "express"
import { adminAccess, getMyDetails, login, register,refreshAccessToken } from "./../controllers/auth.controller"
import { authenticate } from "../midlewares/auth"
import { authorize } from "../midlewares/role"
import { UserRole } from "../models/user.model"

const router = Router()

// Public routes
router.post("/login", login)

// Public registration route
router.post("/register", register)

// Refresh token route
router.post("/refresh", refreshAccessToken)

// Private user route
router.get("/me", authenticate, getMyDetails)

// Admin-only route (Protected by authentication + ADMIN role)
router.get("/admin", authenticate, authorize(UserRole.ADMIN), adminAccess)

export default router
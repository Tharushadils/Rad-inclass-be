import { Router, Request, Response, NextFunction } from "express"
import {
  createArticle,
  deleteArticle,
  getAllArticles,
  getArticleById,
  getGenarateDescription
} from "../controllers/article.controller"
import { upload } from "../midlewares/upload"
import { optionalAuthenticate } from "../midlewares/auth"

const router = Router()

const uploadMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "file", maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || "File upload error!"
      })
    }

    const files = req.files as
      | { [fieldname: string]: Express.Multer.File[] }
      | undefined

    req.file = files?.["image"]?.[0] || files?.["file"]?.[0]

    next()
  })
}

router.post(
  "/create",
  optionalAuthenticate,
  uploadMiddleware,
  createArticle
)

router.post(
  "/",
  optionalAuthenticate,
  uploadMiddleware,
  createArticle
)

router.post("/ai", getGenarateDescription)

router.get("/", getAllArticles)
router.get("/all", getAllArticles)
router.get("/:id", getArticleById)
router.delete("/:id", deleteArticle)

export default router
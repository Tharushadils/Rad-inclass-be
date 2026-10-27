import { Request, Response } from "express"
import { ArticleModel } from "../models/article.model"
import { AuthRequest } from "../midlewares/auth"
import { uploadImage } from "../service/upload.service"
import { genrateArticleDescription } from "../service/ai.service"

// Create Article
export const createArticle = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, content, author, tags } = req.body

    // Validate required fields
    if (
      typeof title !== "string" ||
      !title.trim() ||
      typeof content !== "string" ||
      !content.trim()
    ) {
      return res.status(400).json({
        message: "Title and content are required!"
      })
    }

    // Determine article author
    const articleAuthor =
      (typeof author === "string" && author.trim()) ||
      req.user?.name ||
      req.user?.email ||
      "Anonymous"

    // Upload image to Supabase Storage
    let imageURL = ""

    if (req.file) {
      imageURL = await uploadImage(req.file, "files")
    } else if (
      typeof req.body.imageURL === "string" &&
      req.body.imageURL.trim()
    ) {
      imageURL = req.body.imageURL.trim()
    }

    // Parse tags
    let parsedTags: string[] = []

    if (Array.isArray(tags)) {
      parsedTags = tags
        .map((tag) => String(tag).trim())
        .filter(Boolean)
    } else if (typeof tags === "string" && tags.trim()) {
      try {
        const parsed = JSON.parse(tags)

        if (Array.isArray(parsed)) {
          parsedTags = parsed
            .map((tag) => String(tag).trim())
            .filter(Boolean)
        } else {
          parsedTags = tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        }
      } catch {
        parsedTags = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      }
    }

    // Create article document
    const newArticle = new ArticleModel({
      title: title.trim(),
      content: content.trim(),
      author: articleAuthor,
      imageURL,
      tags: parsedTags
    })

    // Save article to MongoDB
    const savedArticle = await newArticle.save()

    return res.status(201).json({
      message: "Article created successfully!",
      data: savedArticle
    })
  } catch (err: unknown) {
    console.error("Create article error:", err)

    const errorMessage =
      err instanceof Error ? err.message : "Unknown error"

    return res.status(500).json({
      message: "Failed to create article!",
      error: errorMessage
    })
  }
}

// Get All Articles
export const getAllArticles = async (
  _req: Request,
  res: Response
) => {
  try {
    const articles = await ArticleModel.find().sort({
      createdAt: -1
    })

    return res.status(200).json({
      message: "Articles fetched successfully!",
      data: articles
    })
  } catch (err: unknown) {
    console.error("Get articles error:", err)

    const errorMessage =
      err instanceof Error ? err.message : "Unknown error"

    return res.status(500).json({
      message: "Failed to fetch articles!",
      error: errorMessage
    })
  }
}

// Get Article By ID
export const getArticleById = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params

    const article = await ArticleModel.findById(id)

    if (!article) {
      return res.status(404).json({
        message: "Article not found!"
      })
    }

    return res.status(200).json({
      message: "Article fetched successfully!",
      data: article
    })
  } catch (err: unknown) {
    console.error("Get article by ID error:", err)

    const errorMessage =
      err instanceof Error ? err.message : "Unknown error"

    return res.status(500).json({
      message: "Failed to fetch article!",
      error: errorMessage
    })
  }
}

// Delete Article
export const deleteArticle = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params

    const deletedArticle = await ArticleModel.findByIdAndDelete(id)

    if (!deletedArticle) {
      return res.status(404).json({
        message: "Article not found!"
      })
    }

    return res.status(200).json({
      message: "Article deleted successfully!"
    })
  } catch (err: unknown) {
    console.error("Delete article error:", err)

    const errorMessage =
      err instanceof Error ? err.message : "Unknown error"

    return res.status(500).json({
      message: "Failed to delete article!",
      error: errorMessage
    })
  }
}

export const getGenarateDescription = async (req: Request, res: Response) => {
  const { text } = req.body
  try {
    const genaratedContent = await genrateArticleDescription(text)
    res.status(200).json({
      data: genaratedContent
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Internet Server Error"})
  }
}
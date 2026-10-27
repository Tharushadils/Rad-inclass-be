import { supabase } from "../config/supabase"
import crypto from "crypto"
import path from "path"

export const uploadImage = async (
  file: Express.Multer.File,
  bucketName: string = "files"
): Promise<string> => {
  const extension = path.extname(file.originalname).toLowerCase()
  const fileName = `${crypto.randomUUID()}${extension}`

  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    })

  if (error) {
    throw new Error(`Image upload failed: ${error.message}`)
  }

  const { data: publicData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path)

  return publicData.publicUrl
}
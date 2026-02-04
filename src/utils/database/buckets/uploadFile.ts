import { createClient } from "@/lib/supabase/client"

export interface UploadResult {
  success: boolean
  data?: {
    path: string
    fullPath: string
  }
  error?: string
}

/**
 * Uploads a LaTeX file to Supabase storage
 * @param file - The LaTeX file to upload
 * @param userId - The user ID (optional, for organizing files by user)
 * @returns Upload result with path or error
 */
export async function uploadLatexFile(
  file: File,
  userId?: string
): Promise<UploadResult> {
  try {
    const supabase = createClient()

    // Generate a unique filename to avoid collisions
    const timestamp = Date.now()
    const fileExt = file.name.split(".").pop()
    const fileName = `${file.name.replace(`.${fileExt}`, "")}_${timestamp}.${fileExt}`
    
    // Create path structure: latex-files/userId/filename or latex-files/public/filename
    const folder = userId ? `${userId}` : "public"
    const filePath = `${folder}/${fileName}`

    // Upload the file to the 'latex-files' bucket
    const { data, error } = await supabase.storage
      .from("latexResume")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false, // Don't overwrite existing files
        contentType: "text/x-tex", // LaTeX MIME type
      })

    if (error) {
      console.error("Upload error:", error)
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      data: {
        path: data.path,
        fullPath: data.fullPath,
      },
    }
  } catch (error) {
    console.error("Unexpected error during upload:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Gets the public URL for an uploaded file
 * @param path - The file path returned from upload
 * @returns Public URL or null if error
 */
export function getLatexFileUrl(path: string): string | null {
  try {
    const supabase = createClient()
    const { data } = supabase.storage
      .from("latexResume")
      .getPublicUrl(path)
    
    return data.publicUrl
  } catch (error) {
    console.error("Error getting file URL:", error)
    return null
  }
}

/**
 * Deletes a LaTeX file from storage
 * @param path - The file path to delete
 * @returns Success boolean
 */
export async function deleteLatexFile(path: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { error } = await supabase.storage
      .from("latexResume")
      .remove([path])

    if (error) {
      console.error("Delete error:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Unexpected error during delete:", error)
    return false
  }
}

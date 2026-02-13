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
    const fileName = `${file.name.replace(
      `.${fileExt}`,
      ""
    )}_${timestamp}.${fileExt}`

    // Create path structure: latex-files/userId/filename or latex-files/public/filename
    const folder = userId ? `${userId}` : "public"
    const filePath = `${folder}/${fileName}`
    // Upload the file to the 'latex-files' bucket
    // const {data, error} = getLatexFileUrl(filePath)
    // guard
    const fileUrl = await getLatexFileUrl(filePath)
    if (fileUrl) {
      return {
        success: false,
        error: "file existed",
      }
    }
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
export async function getLatexFileUrl(path: string): Promise<string | null> {
  const supabase = createClient()
  const { data, error } = await supabase.storage
    .from("latexResume")
    .createSignedUrl(path, 60 * 10) // 10 minutes

  // console.log(data)
  if (error) {
    console.error("Error getting signed URL:", error)
    return null
  }

  return data.signedUrl
}

export async function getSignedUrl(url: string) {
  try {
    const supabase = createClient()
    const { data } = await supabase.storage
      .from("latexResume")
      .createSignedUrl(url, 60)

    return data?.signedUrl
  } catch (e) {
    console.error(e)
  }
}
/**
 * Deletes a LaTeX file from storage and database
 * @param path - The file path to delete
 * @returns Success boolean
 */
export async function deleteLatexFile(path: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      console.error("Authentication error:", error)
      return false
    }

    const userId = data.user.id

    // Delete from database first
    const { error: dbError } = await supabase
      .from("user_resumes")
      .delete()
      .eq("file_path", path)
      .eq("user_id", userId)

    if (dbError) {
      console.error("Database delete error:", dbError)
      return false
    }

    // Then delete from storage
    const { error: storageError } = await supabase.storage
      .from("latexResume")
      .remove([path])

    if (storageError) {
      console.error("Storage delete error:", storageError)
      // Database is already deleted, continue anyway
    }

    return true
  } catch (error) {
    console.error("Unexpected error during delete:", error)
    return false
  }
}

export interface Resume {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_size_bytes: number | null
  file_type: string
  original_file_name: string
  version: number
  is_active: boolean
  description: string | null
  tags: string[] | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export async function getAllUserLatexFiles() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Not authenticated" }

  const { data, error } = await supabase
    .from("user_resumes")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data: data || [] }
}

/**
 * Gets a specific resume by ID
 * @param resumeId - The resume ID to fetch
 * @returns Resume or null if not found
 */
export async function getResumeById(resumeId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Not authenticated" }

  const { data, error } = await supabase
    .from("user_resumes")
    .select("*")
    .eq("id", resumeId)
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    return { success: false, error: error.message }
  }
  return { success: true, data: data || null }
}

/**
 * Gets the main (active) resume from database
 * @returns Main resume or null if none exists
 */
export async function getMainResume() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Not authenticated" }

  // Get the active resume, or the most recent one if none is marked active
  const { data, error } = await supabase
    .from("user_resumes")
    .select("*")
    .eq("user_id", user.id)
    .is("deleted_at", null)
    .order("is_active", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    return { success: false, error: error.message }
  }

  return { success: true, data: data || null }
}

/**
 * Sets a resume as the main (active) resume in database
 * Deactivates all other resumes for this user
 * @param resumeId - The resume ID to set as main
 */
export async function setMainResume(resumeId: string | null) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { success: false, error: "Not authenticated" }

  if (!resumeId) {
    // Deactivate all resumes
    const { error } = await supabase
      .from("user_resumes")
      .update({ is_active: false })
      .eq("user_id", user.id)

    if (error) return { success: false, error: error.message }
    return { success: true }
  }

  // First, deactivate all resumes for this user
  await supabase
    .from("user_resumes")
    .update({ is_active: false })
    .eq("user_id", user.id)

  // Then activate the selected resume
  const { error } = await supabase
    .from("user_resumes")
    .update({ is_active: true })
    .eq("id", resumeId)
    .eq("user_id", user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

/**
 * Gets the current main resume ID from database
 * @returns Main resume ID or null
 */
export async function getMainResumeId(): Promise<string | null> {
  const result = await getMainResume()
  return result.success && result.data ? result.data.id : null
}

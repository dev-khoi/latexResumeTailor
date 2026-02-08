"use client"

import { useEffect, useRef, useState } from "react"
import {
  deleteLatexFile,
  getAllUserLatexFiles,
  getLatexFileUrl,
  getMainResume,
  setMainResume as setMainResumeInStorage,
  uploadLatexFile,
  type Resume,
} from "@/database/storage/resume"
import { Download, FileText, Loader2, Trash2, Upload, X } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ConfirmRemovalDialog } from "./confirmRemoval"
import { ViewResumeButton } from "./latexVersion/viewResume"

export function MainResumeDisplay({
  onResumeChange,
  onResumeLoad,
}: {
  onResumeChange?: () => void
  onResumeLoad?: (resume: Resume) => void
}) {
  const [mainResume, setMainResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadMainResume = async () => {
    setLoading(true)
    setError("")
    const result = await getMainResume()
    if (result.success) {
      setMainResume(result.data)
      // Load the latex file content if resume exists
      if (result.data && onResumeLoad) {
        onResumeLoad(result.data)
      }
    } else {
      setError(result.error || "Failed to load main resume")
    }
    setLoading(false)
  }

  useEffect(() => {
    loadMainResume()
  }, [])

  const handleView = async () => {
    if (!mainResume) return
    const url = await getLatexFileUrl(mainResume.file_path)
    if (url) {
      window.open(url)
    } else {
      setError("Failed to get file URL")
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!mainResume) return

    setDeleting(true)
    const success = await deleteLatexFile(mainResume.file_path)

    if (success) {
      // Database will handle deactivation
      setMainResume(null)
      setShowDeleteDialog(false)
      onResumeChange?.()
    } else {
      setError("Failed to delete file")
      setShowDeleteDialog(false)
    }
    setDeleting(false)
  }

  const handleFileUpload = async (file: File) => {
    setError("")

    // File validation
    const validExtensions = [".tex", ".latex"]
    const fileName = file.name.toLowerCase()
    const hasValidExtension = validExtensions.some((ext) =>
      fileName.endsWith(ext)
    )

    if (!hasValidExtension) {
      setError("Please upload a valid LaTeX file (.tex or .latex)")
      return
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setError("File size must be less than 5MB")
      return
    }

    setUploading(true)

    try {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      const userId = data.user?.id

      const result = await uploadLatexFile(file, userId)

      if (result.success && result.data) {
        // Get all resumes and set the latest one as main
        const resumesResult = await getAllUserLatexFiles()
        if (
          resumesResult.success &&
          resumesResult.data &&
          resumesResult.data.length > 0
        ) {
          const latestResume = resumesResult.data[0]
          await setMainResumeInStorage(latestResume.id)
        }
        await loadMainResume()
        if (onResumeChange) {
          onResumeChange()
        }
      } else {
        setError(result.error || "Upload failed")
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (bytes == null && bytes != 0) return "Unknown"
    const kb = bytes / 1024
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(2)} MB`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Based Resume</CardTitle>
        </CardHeader>
        <Card className="py-3 w-60 h-70 !mt-0">
          <CardContent className="flex items-center justify-center space-y-3 !py-6 !pb-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <CardHeader className="py-2">
        <CardTitle className="text-base">Based Latex Resume</CardTitle>
      </CardHeader>
      <Card className=" w-60 h-70 !mt-0 !pb-0">
        <CardContent className="space-y-3 !py-6 !pb-6 flex flex-col">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950 p-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!mainResume ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer text-center py-8 px-4 border-2 border-dashed rounded-lg transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".tex,.latex"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? (
                <>
                  <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-primary" />
                  <p className="text-sm font-medium">Uploading...</p>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Upload your latex Resume
                  </p>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Click or drag & drop your .tex file
                  </p>
                </>
              )}
            </div>
          ) : (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                disabled={deleting}
                className="text-xs size-2 absolute self-end"
              >
                <X className="h-3 w-3" />
              </Button>

              <div className="space-y-3">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="w-full min-w-0">
                    <p
                      className="font-medium text-sm truncate px-2"
                      title={mainResume.original_file_name}
                    >
                      {mainResume.original_file_name}
                    </p>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground mt-1">
                      <span>{formatFileSize(mainResume.file_size_bytes)}</span>
                      <span className="text-[10px]">
                        {formatDate(mainResume.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmRemovalDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        resume={mainResume}
        onConfirm={handleConfirmDelete}
        isDeleting={deleting}
      />
    </>
  )
}

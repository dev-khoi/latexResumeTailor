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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Input } from "../ui/input"
import { ConfirmRemovalDialog } from "./confirmRemoval"
import { LatexEditor } from "./editor/latexEditor"

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
  const [showEditor, setShowEditor] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mainResumeContent, setMainResumeContent] = useState<string>("")
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
  //
  async function loadResumeContent() {
    if (!mainResume) {
      return
    }
    const url = await getLatexFileUrl(mainResume.file_path)
    if (!url) {
      throw new Error("Failed to get file URL")
    }
    const response = await fetch(url)
    const data: string = await response.text()
    setMainResumeContent(data)
  }
  //
  useEffect(() => {
    loadMainResume()
  }, [])
  useEffect(() => {
    loadResumeContent()
  }, [mainResume])

  const handleView = async () => {
    if (!mainResume) return
    try {
      setShowEditor(true)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load resume content"
      )
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
        <CardHeader className="py-2 px-0 text-left">
          <CardTitle className="text-base !pl-0 text-left">
            Based Latex Resume
          </CardTitle>{" "}
        </CardHeader>
        <Card className="w-60 !h-70 !mt-0 !pb-0 !px-auto flex flex-col justify-center !mx-auto border-slate-400">
          <CardContent className="space-y-3 !py-6 !pb-6 flex flex-col justify-center items-center mx-auto ">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      <CardHeader className="py-2 px-0 text-left">
        <CardTitle className="text-base !pl-0 text-left">
          Based Latex Resume
        </CardTitle>
      </CardHeader>
      <Card className="relative w-60 h-70 !mt-0 !pb-0 !px-auto flex flex-col justify-center !mx-auto border-slate-400">
        <CardContent className="space-y-3 !py-6 !pb-6 flex flex-col justify-center items-center mx-auto ">
          {error && (
            <div className="rounded-md  bg-red-50 dark:bg-red-950 p-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!mainResume ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer text-center py-8 px-4 border-2 border-dashed border-slate-500 rounded-lg transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/50 hover:border-primary hover:bg-accent/50"
              }`}
            >
              <Input
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
                    Click or drag & drop your{" "}
                    <span className="text-green-800">.tex</span> file
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
                className="text-xs absolute top-2 right-2 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>

              <div
                className="space-y-3 w-full hover:cursor-pointer"
                onClick={handleView}
              >
                <div className="flex flex-col items-center justify-center text-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-3">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="w-full max-w-[210px] min-w-0">
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

      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-4 pb-2">
            <DialogTitle>Main LaTeX Resume</DialogTitle>
            <DialogDescription className="text-xs">
              View or edit your uploaded LaTeX source.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 px-6 pb-6 h-[calc(90vh-96px)]">
            {loading ? (
              <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
                Loading content...
              </div>
            ) : (
              <LatexEditor initialContent={mainResumeContent} />
            )}
          </div>
          <DialogFooter className="px-6 pb-4">
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

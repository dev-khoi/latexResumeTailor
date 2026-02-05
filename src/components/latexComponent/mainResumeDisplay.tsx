"use client"

import { useEffect, useState } from "react"
import {
  deleteLatexFile,
  getLatexFileUrl,
  getMainResume,
  type Resume,
} from "@/database/storage/resume"
import { Download, FileText, Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function MainResumeDisplay({
  onResumeChange,
}: {
  onResumeChange?: () => void
}) {
  const [mainResume, setMainResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [deleting, setDeleting] = useState(false)

  const loadMainResume = async () => {
    setLoading(true)
    setError("")
    const result = await getMainResume()
    if (result.success) {
        
      setMainResume(result.data)
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

  const handleDelete = async () => {
    if (!mainResume) return
    if (!confirm(`Delete "${mainResume.original_file_name}"?`)) return

    setDeleting(true)
    const success = await deleteLatexFile(mainResume.file_path)

    if (success) {
      setMainResume(null)
      onResumeChange?.()
    } else {
      setError("Failed to delete file")
    }
    setDeleting(false)
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
      <Card>
        <CardHeader>
          <CardTitle>Main Resume</CardTitle>
          <CardDescription>Your currently selected resume file</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Main Resume</CardTitle>
        <CardDescription>Your currently selected resume file</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {!mainResume ? (
          <div className="text-center py-6 text-muted-foreground">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="font-medium">No main resume selected</p>
            <p className="text-sm mt-1">
              Upload a resume or select one from your files
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 rounded-lg border p-4 bg-accent/30">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <FileText className="h-5 w-5 mt-0.5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {mainResume.original_file_name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{formatFileSize(mainResume.file_size_bytes)}</span>
                  <span>•</span>
                  <span>{formatDate(mainResume.created_at)}</span>
                </div>
                {mainResume.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {mainResume.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="outline" size="sm" onClick={handleView}>
                <Download className="h-4 w-4" />
                <span className="sr-only">View</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import {
  deleteLatexFile,
  getLatexFileUrl,
  getMainResume,
  setMainResume as setMainResumeInStorage,
  type Resume,
} from "@/database/storage/resume"
import { Download, FileText, Loader2, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { ViewResumeButton } from "./latexVersion/viewResume"

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
      // Clear from localStorage
      setMainResumeInStorage(null)
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
        <CardTitle className="text-base">Based Resume</CardTitle>
      </CardHeader>
      <Card className=" w-60 h-70 !mt-0 !pb-0">
        <CardContent className="space-y-3 !py-6 !pb-6 flex flex-col">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-950 p-2 text-xs text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!mainResume ? (
            <div className="text-center py-4 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No resume selected</p>
              <p className="text-xs mt-1">Upload or select a file</p>
            </div>
          ) : (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  setMainResumeInStorage(null)
                  setMainResume(null)
                  onResumeChange?.()
                }}
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
    </>
  )
}

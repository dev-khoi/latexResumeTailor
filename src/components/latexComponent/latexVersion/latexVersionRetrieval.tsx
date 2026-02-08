// src/components/latexVersion/latexVersionRetrieval.tsx
"use client"

import { useEffect, useState } from "react"
import {
  deleteLatexFile,
  getAllUserLatexFiles,
  getLatexFileUrl,
  getMainResumeId,
  setMainResume,
  type Resume,
} from "@/database/storage/resume"
import {
  Download,
  FileText,
  FolderOpen,
  Loader2,
  Star,
  Trash2,
} from "lucide-react"

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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { ViewResumeButton } from "./viewResume"

export function ResumeList({
  onMainResumeChange,
}: {
  onMainResumeChange?: () => void
}) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [settingMainId, setSettingMainId] = useState<string | null>(null)
  const [mainResumeId, setMainResumeIdState] = useState<string | null>(null)

  const loadResumes = async () => {
    setLoading(true)
    setError("")
    const result = await getAllUserLatexFiles()

    if (result.success && result.data) {
      setResumes(result.data)
    } else {
      setError(result.error || "Failed to load resumes")
    }
    setLoading(false)
  }

  useEffect(() => {
    const init = async () => {
      await loadResumes()
      const mainId = await getMainResumeId()
      setMainResumeIdState(mainId)
    }
    init()
  }, [])

  const handleDelete = async (resume: Resume) => {
    if (!confirm(`Delete "${resume.original_file_name}"?`)) return

    setDeletingId(resume.id)
    const success = await deleteLatexFile(resume.file_path)

    if (success) {
      setResumes((prev) => prev.filter((r) => r.id !== resume.id))
    } else {
      setError("Failed to delete file")
    }
    setDeletingId(null)
  }

  const handleSetMain = async (resumeId: string) => {
    // Save to database
    const result = await setMainResume(resumeId)
    if (result.success) {
      setMainResumeIdState(resumeId)
      // Notify parent to refresh main resume display
      onMainResumeChange?.()
    } else {
      setError(result.error || "Failed to set main resume")
    }
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown"
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
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950 p-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {resumes.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No resume files uploaded yet</p>
              <p className="text-sm mt-1">
                Upload your first LaTeX resume to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {resume.original_file_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span>{formatFileSize(resume.file_size_bytes)}</span>
                        <span>•</span>
                        <span>{formatDate(resume.created_at)}</span>
                      </div>
                      {resume.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                          {resume.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant={
                        mainResumeId === resume.id ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => handleSetMain(resume.id)}
                      disabled={mainResumeId === resume.id}
                      title={
                        mainResumeId === resume.id
                          ? "Current main resume"
                          : "Set as main"
                      }
                    >
                      <Star
                        className={`h-4 w-4 ${
                          mainResumeId === resume.id ? "fill-current" : ""
                        }`}
                      />
                      <span className="sr-only">
                        {mainResumeId === resume.id
                          ? "Main resume"
                          : "Set as main"}
                      </span>
                    </Button>
                    <ViewResumeButton
                      resume={resume}
                      getLatexFileUrl={getLatexFileUrl}
                      setError={setError}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(resume)}
                      disabled={deletingId === resume.id}
                    >
                      {deletingId === resume.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function ResumeListButton({
  onMainResumeChange,
}: {
  onMainResumeChange?: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FolderOpen className="h-4 w-4" />
          View My Resumes
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Your Resume Files</DialogTitle>
          <DialogDescription>
            Manage your uploaded LaTeX resume files
          </DialogDescription>
        </DialogHeader>
        <ResumeList onMainResumeChange={onMainResumeChange} />
      </DialogContent>
    </Dialog>
  )
}

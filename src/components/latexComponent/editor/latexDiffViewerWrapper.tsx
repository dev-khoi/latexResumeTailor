"use client"

import { ResumeEdit } from "@/ai/agents/latexTailor"
import { FileText, Sparkles } from "lucide-react"

import { LatexDiffViewer } from "./latexDiffViewer"

interface LatexDiffViewerWrapperProps {
  suggestedEdits: ResumeEdit[]
  originalContent: string | null
  tailoredContent: string | null
}

export function LatexDiffViewerWrapper({
  suggestedEdits,
  originalContent,
  tailoredContent,
}: LatexDiffViewerWrapperProps) {
  const hasOriginal = originalContent && originalContent.trim().length > 0
  const hasTailored = tailoredContent && tailoredContent.trim().length > 0

  // Both empty - show initial state
  if (!hasOriginal && !hasTailored) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-500/10 p-4">
              <Sparkles className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Ready to Tailor Your Resume
          </h3>
          <p className="text-md text-muted-foreground leading-relaxed">
            Upload your resume and enter a job posting URL, then click the{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              &quot;Tailor with AI&quot;
            </span>{" "}
            button to see AI-optimized suggestions appear here.
          </p>
        </div>
      </div>
    )
  }

  // Only original - show waiting for tailored
  if (hasOriginal && !hasTailored) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-500/10 p-4">
              <FileText className="w-12 h-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            Resume Loaded
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Your resume is ready. Enter a job posting URL and click{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              &quot;Tailor with AI&quot;
            </span>{" "}
            to see tailored suggestions.
          </p>
        </div>
      </div>
    )
  }

  // Only tailored (shouldn't happen, but handle it)
  if (!hasOriginal && hasTailored) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-amber-500/10 p-4">
              <FileText className="w-12 h-12 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-foreground">
            No Original Resume
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please upload your original resume to see the comparison.
          </p>
        </div>
      </div>
    )
  }

  // Both exist - show diff viewer
  return (
    <LatexDiffViewer
      suggestedEdits={suggestedEdits}
      originalContent={originalContent!}
      tailoredContent={tailoredContent!}
    />
  )
}

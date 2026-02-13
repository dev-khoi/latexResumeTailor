"use client"

import { CheckCircle2, Circle, Loader2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export type TailoringStage =
  | "idle"
  | "extracting"
  | "tailoring"
  | "complete"
  | "error"

interface LatexImprovementStatusProps {
  isOpen: boolean
  currentStage: TailoringStage
  errorMessage?: string
}

const stages = [
  {
    id: "extracting" as TailoringStage,
    label: "Extracting Job Description",
    description: "Analyzing the job posting URL...",
  },
  {
    id: "tailoring" as TailoringStage,
    label: "Tailoring Resume",
    description: "AI is optimizing your resume for this position...",
  },
  {
    id: "complete" as TailoringStage,
    label: "Complete",
    description: "Your resume has been successfully tailored!",
  },
]

export function LatexImprovementStatus({
  isOpen,
  currentStage,
  errorMessage,
}: LatexImprovementStatusProps) {
  const getStageStatus = (stageId: TailoringStage) => {
    const currentIndex = stages.findIndex((s) => s.id === currentStage)
    const stageIndex = stages.findIndex((s) => s.id === stageId)

    if (currentStage === "error") return "idle"
    if (stageIndex < currentIndex) return "complete"
    if (stageIndex === currentIndex) return "active"
    return "idle"
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentStage === "error" ? (
              <>
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Tailoring Failed
              </>
            ) : currentStage === "complete" ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Tailoring Complete
              </>
            ) : (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                Processing Your Resume
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {currentStage === "error"
              ? "An error occurred during the tailoring process"
              : currentStage === "complete"
              ? "Your resume has been successfully optimized"
              : "Please wait while we optimize your resume for this job"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {currentStage === "error" ? (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-600 dark:text-red-400">
              {errorMessage || "An unexpected error occurred"}
            </div>
          ) : (
            stages.map((stage, index) => {
              const status = getStageStatus(stage.id)
              return (
                <div key={stage.id} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    {status === "complete" ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : status === "active" ? (
                      <Loader2 className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
                    ) : (
                      <Circle className="w-6 h-6 text-muted-foreground flex-shrink-0" />
                    )}
                    {index < stages.length - 1 && (
                      <div
                        className={`w-0.5 h-8 mt-2 ${
                          status === "complete"
                            ? "bg-green-600"
                            : "bg-muted-foreground/20"
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <p
                      className={`font-medium ${
                        status === "active"
                          ? "text-foreground"
                          : status === "complete"
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {stage.description}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {currentStage === "complete" && (
          <div className="flex justify-center pt-2">
            <p className="text-sm text-muted-foreground">View the results</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

"use client"

import { useState } from "react"
import { Resume } from "@/database/storage/resume"

import { MainResumeDisplay } from "./mainResumeDisplay"

export default function MainLatexButton({
  onResumeChange,
  onResumeLoad,
}: {
  onResumeChange?: () => void
  onResumeLoad?: (resume: Resume) => void
}) {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleResumeChange = () => {
    // Trigger a refresh of the MainResumeDisplay
    setRefreshKey((prev) => prev + 1)
    if (onResumeChange) {
      onResumeChange()
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Resume Display with Upload */}
      <MainResumeDisplay
        key={refreshKey}
        onResumeChange={handleResumeChange}
        onResumeLoad={onResumeLoad}
      />
    </div>
  )
}

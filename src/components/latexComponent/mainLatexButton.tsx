"use client"

import { useState } from "react"

import ResumeListButton from "./latexVersion/latexVersionRetrieval"
import { MainResumeDisplay } from "./mainResumeDisplay"

export default function MainLatexButton() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleResumeChange = () => {
    // Trigger a refresh of the MainResumeDisplay
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      {/* Main Resume Display */}
      <MainResumeDisplay key={refreshKey} onResumeChange={handleResumeChange} />

      {/* View All Resumes Button */}
      <div className="flex justify-center">
        <ResumeListButton />
      </div>
    </div>
  )
}

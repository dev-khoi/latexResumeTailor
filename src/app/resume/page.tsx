"use client"

import { useState } from "react"
import type { ResumeEdit } from "@/ai/agents/latexTailor"
import { Resume, getLatexFileUrl } from "@/database/storage/resume"
import { Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LatexDiffViewer } from "@/components/latexComponent/editor/latexDiffViewer"
import OpenLatexInOverleaf from "@/components/latexComponent/editor/openLatexInOverleaf"
import MainLatexButton from "@/components/latexComponent/mainLatexButton"

export default function Home() {
  const [resumeContent, setResumeContent] = useState<string | null>(null)
  const [tailoredContent, setTailoredContent] = useState<string | null>(null)
  const [jobUrl, setJobUrl] = useState<string>("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [suggestedEdits, setSuggestedEdits] = useState<ResumeEdit[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>("")
  const [resumeFilePath, setResumeFilePath] = useState<string>("")

  // Validate URL format
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const handleResumeChange = () => {
    // Reset content when resume changes
    setResumeContent(null)
    setTailoredContent(null)
    setSuggestedEdits([])
    setKeywords([])
    setError("")
    setResumeFilePath("")
  }

  // Fetch the latex file content
  const handleResumeLoad = async (resume: Resume) => {
    const url = await getLatexFileUrl(resume.file_path)
    if (url) {
      const response = await fetch(url)
      const text = await response.text()
      setResumeContent(text)
      setResumeFilePath(resume.file_path)
      setTailoredContent(null)
      setSuggestedEdits([])
      setKeywords([])
    }
  }

  // Tailor resume based on job posting
  const handleTailorResume = async () => {
    if (!resumeContent) {
      setError("Please load a resume first")
      return
    }

    if (!jobUrl) {
      setError("Please enter a job posting URL")
      return
    }

    // Validate URL format
    if (!isValidUrl(jobUrl)) {
      setError("Please enter a valid URL (e.g., https://example.com/job)")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      // Step 1: Extract job description from URL via API
      const extractResponse = await fetch("/api/extract-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      })
      console.log(extractResponse)
      if (!extractResponse.ok) {
        const errorData = await extractResponse.json()
        throw new Error(errorData.error || "Failed to extract job posting")
      }

      const { html: jobDescription } = await extractResponse.json()

      // Step 2: Tailor resume via API
      const tailorResponse = await fetch("/api/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latexContent: resumeContent,
          jobDescription,
        }),
      })

      if (!tailorResponse.ok) {
        const errorData = await tailorResponse.json()
        throw new Error(errorData.error || "Failed to tailor resume")
      }

      const { edits, keywords, tailoredContent } = await tailorResponse.json()

      // Store results
      setSuggestedEdits(edits)
      setKeywords(keywords)
      setTailoredContent(tailoredContent)
    } catch (err) {
      console.error("Error tailoring resume:", err)
      setError(err instanceof Error ? err.message : "Failed to tailor resume")
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="relative flex justify-center bg-background px-4 py-10 lg:items-center">
      <div className="flex w-full max-w-[1800px] flex-col gap-8 lg:flex-row px-8 items-stretch">
        {/* Sidebar with Job URL and Controls */}
        <aside className="sticky top-20 flex h-full min-h-[600px] items-start w-80 flex-col gap-6 rounded-3xl border border-border bg-card/80 p-6 text-card-foreground shadow-2xl backdrop-blur">
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">AI Resume Tailoring</h4>
            <p className="text-sm text-muted-foreground">
              Upload your resume and enter a job URL to get AI-optimized version
            </p>
          </div>

          <MainLatexButton
            onResumeChange={handleResumeChange}
            onResumeLoad={handleResumeLoad}
          />

          <div className="w-full border-t border-border pt-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Job Posting URL
              </label>
              <Input
                type="url"
                placeholder="https://company.com/job/role"
                value={jobUrl}
                onChange={(e) => {
                  setJobUrl(e.target.value)
                  if (error) setError("") // Clear error when user types
                }}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
            </div>

            <Button
              onClick={handleTailorResume}
              disabled={!resumeContent || !jobUrl || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                <>
                  <Sparkles size={16} className="mr-2" />
                  Tailor with AI
                </>
              )}
            </Button>

            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400 flex items-start gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="flex-1">{error}</span>
              </div>
            )}

            {keywords.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-foreground">
                  Extracted Keywords ({keywords.length})
                </h5>
                <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                  {keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="rounded-md bg-blue-500/10 border border-blue-500/30 px-2 py-1 text-xs text-blue-600 dark:text-blue-400"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {suggestedEdits.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-foreground">
                  Suggested Changes ({suggestedEdits.length})
                </h5>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {suggestedEdits.map((edit, idx) => (
                    <div
                      key={idx}
                      className="rounded-md bg-muted/50 border border-border p-2"
                    >
                      <p className="text-muted-foreground text-xs italic mb-1">
                        {edit.reason}
                      </p>
                      <div className="text-xs">
                        <span className="text-red-600 dark:text-red-400">
                          - {edit.original}
                        </span>
                        <br />
                        <span className="text-green-600 dark:text-green-400">
                          + {edit.updated}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Diff View */}
        <section className="flex-1 min-h-[600px] rounded-3xl border border-border bg-card shadow-2xl backdrop-blur overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="bg-muted/50 border-b border-border px-6 py-3 flex items-center justify-between">
              <h3 className="text-foreground font-semibold">
                Resume Comparison: Original ↔ AI-Tailored
              </h3>
              {tailoredContent && (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full animate-pulse"></span>
                  Changes Applied
                </span>
              )}
            </div>
            <div className="flex-1 flex flex-col">
              {resumeContent && resumeFilePath && (
                <div className="p-4 border-b border-border flex flex-col items-end">
                  <OpenLatexInOverleaf
                    latexContent={tailoredContent}
                    className="bg-indigo-600 hover:bg-indigo-700"
                    variant="default"
                  />
                </div>
              )}
              <LatexDiffViewer
                //
                suggestedEdits={suggestedEdits}
                originalContent={
                  resumeContent ||
                  `Couldn't render latex content or file is empty`
                }
                tailoredContent={
                  tailoredContent ||
                  `Couldn't render tailored latex content or file is empty, sorry :(`
                }
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

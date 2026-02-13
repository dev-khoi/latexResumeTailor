"use client"

import { useState } from "react"
import { getLatexFileUrl } from "@/database/storage/resume"
import { ExternalLink, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface OpenLatexInOverleafProps {
  latexContent: string | null
  className?: string
  variant?: "default" | "outline" | "ghost" | "secondary"
}

/**
 * Button component to open LaTeX files in Overleaf via secure proxy
 *
 * @param filePath - The path to the file in Supabase storage (e.g., "latexResume/user-id/file.tex")
 * @param fileName - Optional custom label for the button
 */
export function OpenLatexInOverleaf({
  latexContent,
  className = "",
  variant = "default",
}: OpenLatexInOverleafProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const handleOpenInOverleaf = async () => {
    try {
      setIsLoading(true)
      setError("")

      // Validate LaTeX content exists
      if (!latexContent || latexContent.length === 0) {
        throw new Error("No LaTeX content available to open in Overleaf")
      }

      // Create a form to POST the content to Overleaf
      // Overleaf guides to use form
      // https://www.overleaf.com/devs
      const form = document.createElement("form")
      form.method = "POST"
      form.action = "https://www.overleaf.com/docs"
      form.target = "_blank"

      // Add the encoded snippet
      const input = document.createElement("input")
      input.type = "hidden"
      input.name = "encoded_snip"
      input.value = encodeURIComponent(latexContent)
      form.appendChild(input)

      const inputTitle = document.createElement("input")
      inputTitle.type = "hidden"
      inputTitle.name = "main_document" // this sets the main .tex filename
      inputTitle.value = "MyProject.tex" // replace with your desired title
      form.appendChild(inputTitle)

      // Submit the form
      document.body.appendChild(form)
      form.submit()
      document.body.removeChild(form)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to open in Overleaf"
      setError(errorMessage)
      console.error("Error opening in Overleaf:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        onClick={handleOpenInOverleaf}
        disabled={isLoading || !latexContent}
        variant={variant}
        className={className}
        title={
          !latexContent
            ? "No LaTeX content available"
            : "Open this LaTeX file in Overleaf for editing"
        }
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Opening...
          </>
        ) : (
          <>
            <ExternalLink size={16} className="mr-2" />
            Open in Overleaf
          </>
        )}
      </Button>

      {error && <div className="text-sm text-red-500 mt-2">Error: {error}</div>}
    </>
  )
}

export default OpenLatexInOverleaf

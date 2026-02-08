"use client"

import { useState } from "react"
import { getLatexFileUrl } from "@/database/storage/resume"
import { ExternalLink, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface OpenLatexInOverleafProps {
  filePath: string
  fileName?: string
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
  filePath,
  fileName = "Open in Overleaf",
  className = "",
  variant = "default",
}: OpenLatexInOverleafProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const handleOpenInOverleaf = async () => {
    try {
      setIsLoading(true)
      setError("")

      // Get signed URL from Supabase
      const signedUrl = await getLatexFileUrl(filePath)

      if (!signedUrl) {
        throw new Error("Failed to get file URL")
      }

      // Fetch the actual LaTeX content
      const response = await fetch(signedUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch file content")
      }
      const latexContent = await response.text()

      // Create a form to POST the content to Overleaf
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
        disabled={isLoading}
        variant={variant}
        className={className}
        title="Open this LaTeX file in Overleaf for editing"
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="mr-2 animate-spin" />
            Opening...
          </>
        ) : (
          <>
            <ExternalLink size={16} className="mr-2" />
            {fileName}
          </>
        )}
      </Button>

      {error && <div className="text-sm text-red-500 mt-2">Error: {error}</div>}
    </>
  )
}

export default OpenLatexInOverleaf

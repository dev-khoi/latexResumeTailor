"use client"

import { useState } from "react"
import { uploadLatexFile } from "@/utils/database/buckets/uploadFile"

import { createClient } from "@/lib/supabase/client"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { Button } from "../ui/button"

export function InputFile() {
  const [pending, setPending] = useState(false)
  const [latexFile, setLatexFile] = useState<File | undefined>()
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  const submitFile = async () => {
    setError("")
    setSuccess("")
    if (!latexFile) return

    // File validation
    const validExtensions = [".tex", ".latex"]
    const fileName = latexFile.name.toLowerCase()
    const hasValidExtension = validExtensions.some((ext) =>
      fileName.endsWith(ext)
    )

    if (!hasValidExtension) {
      setError("Please upload a valid LaTeX file (.tex or .latex)")
      return
    }

    // Check file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (latexFile.size > maxSize) {
      setError("File size must be less than 5MB")
      return
    }

    setPending(true)

    try {
      // Upload the LaTeX file to Supabase storage
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      const userId = data.user?.id
      const result = await uploadLatexFile(latexFile, userId)
      if (result.success && result.data) {
        setSuccess("file uploaded sucessfully!")
        setLatexFile(undefined)
        // setSuccess(`File uploaded successfully! Path: ${result.data.path}`)
        // TODO: Process the uploaded file (parse, analyze, etc.)
        // You can use result.data.path to reference the file
      } else {
        setError(result.error || "Upload failed")
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      )
    } finally {
      setPending(false)
    }
  }
  return (
    <Field>
      <FieldLabel htmlFor="latexFile">LaTeX Resume File</FieldLabel>
      <Input
        id="latexFile"
        type="file"
        accept=".tex,.latex"
        onChange={(e) => {
          const file = e.target.files?.[0]
          // Store the file in state for later use
          setLatexFile(file)
        }}
      />
      <FieldDescription>Upload your LaTeX resume file (.tex)</FieldDescription>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
      {success && (
        <div className="text-green-600 dark:text-green-400 text-sm mt-1">
          {success}
        </div>
      )}
      <Button type="button" disabled={pending} onClick={submitFile}>
        {pending && <div className="mr-2 h-4 w-4 animate-spin" />}
        {pending ? "Uploading..." : "Submit"}
      </Button>
    </Field>
  )
}

export default function UploadResumeButton() {
  return (
    <>
      <InputFile />
    </>
  )
}

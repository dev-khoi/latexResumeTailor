/**
 * Compiles LaTeX content to PDF using LaTeX.Online API
 */
export async function compileLatexToPdf(file: File): Promise<Blob> {
  try {
    // Read the file as text
    const latexContent = await file.text()

    // Use LaTeX.Online API - a free LaTeX compilation service
    const response = await fetch("https://latexonline.cc/compile", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `input=${encodeURIComponent(latexContent)}`,
    })

    if (!response.ok) {
      throw new Error(`LaTeX compilation failed: ${response.statusText}`)
    }

    // Return the PDF as a Blob
    return await response.blob()
  } catch (error) {
    console.error("LaTeX compilation error:", error)
    throw new Error(
      error instanceof Error
        ? `Failed to compile LaTeX: ${error.message}`
        : "Failed to compile LaTeX"
    )
  }
}

/**
 * Compiles LaTeX and downloads the PDF
 */
export async function compileAndDownloadPdf(
  file: File,
  filename: string = "resume.pdf"
): Promise<void> {
  try {
    const pdfBlob = await compileLatexToPdf(file)

    // Create download link
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename

    // Trigger download
    document.body.appendChild(link)
    link.click()

    // Cleanup
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Download error:", error)
    throw error
  }
}

/**
 * Compiles LaTeX and returns a URL for preview
 */
export async function compileAndPreviewPdf(file?: File): Promise<string> {
  try {
    // If no file provided, load from example
    let latexFile = file
    if (!latexFile) {
      const response = await fetch("/exampleLatexFiles/example1.tex")
      if (!response.ok) {
        throw new Error("Failed to load example LaTeX file")
      }
      const content = await response.text()
      latexFile = new File([content], "example1.tex", { type: "text/plain" })
    }

    const pdfBlob = await compileLatexToPdf(latexFile)
    return URL.createObjectURL(pdfBlob)
  } catch (error) {
    console.error("Preview error:", error)
    throw error
  }
}

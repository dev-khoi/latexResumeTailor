import { NextRequest, NextResponse } from "next/server"
import { applySmallEdits, scanAndSuggestEdits } from "@/ai/agents/latexTailor"

export async function POST(request: NextRequest) {
  try {
    const { latexContent, jobDescription } = await request.json()

    if (!latexContent || !jobDescription) {
      return NextResponse.json(
        { error: "LaTeX content and job description are required" },
        { status: 400 }
      )
    }

    // Get AI suggestions
    const result = await scanAndSuggestEdits(latexContent, jobDescription)

    // Apply edits
    const tailoredContent = await applySmallEdits(latexContent, result.edits)

    return NextResponse.json({
      edits: result.edits,
      keywords: result.keywords,
      tailoredContent,
    })
  } catch (error) {
    console.error("Error tailoring resume:", error)
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to tailor resume",
      },
      { status: 500 }
    )
  }
}

import { ResumeEdit, applySmallEdits } from "@/ai/agents/latexTailor"
import { describe, expect, it } from "vitest"

const mockOriginalContent = `\\documentclass{article}
\\begin{document}
\\section{Experience}
\\resumeItem{Developed web applications using JavaScript}
\\resumeItem{Managed team projects and coordinated with stakeholders}
\\end{document}`

const mockTailoredContent = `\\documentclass{article}
\\begin{document}
\\section{Experience}
\\resumeItem{Developed React web applications using TypeScript}
\\resumeItem{Led agile team projects and coordinated with cross-functional stakeholders}
\\end{document}`

const mockSuggestedEdits: ResumeEdit[] = [
  {
    reason:
      "Added React and TypeScript keywords to strengthen ATS matching for senior developer role",
    original: "Developed web applications using JavaScript",
    updated: "Developed React web applications using TypeScript",
  },
  {
    reason:
      "Enhanced leadership language and added agile methodology keyword for project management emphasis",
    original: "Managed team projects and coordinated with stakeholders",
    updated:
      "Led agile team projects and coordinated with cross-functional stakeholders",
  },
]

describe("LatexDiffViewer", () => {
  it("should have mock data with 2 edits", () => {
    expect(mockSuggestedEdits).toHaveLength(2)
    expect(mockSuggestedEdits[0].reason).toBeTruthy()
    expect(mockSuggestedEdits[1].reason).toBeTruthy()
  })

  it("should apply edits correctly", async () => {
    const result = await applySmallEdits(
      mockOriginalContent,
      mockSuggestedEdits
    )

    expect(result).toContain("React")
    expect(result).toContain("TypeScript")
    expect(result).toContain("Led agile")
    expect(result).toContain("cross-functional")
  })

  it("should match original and updated content in edits", () => {
    mockSuggestedEdits.forEach((edit) => {
      expect(mockOriginalContent).toContain(edit.original)
      expect(mockTailoredContent).toContain(edit.updated)
    })
  })
})

// Export mock data for use in other tests
export { mockOriginalContent, mockTailoredContent, mockSuggestedEdits }

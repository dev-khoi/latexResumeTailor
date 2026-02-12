import dotenv from "dotenv"
import { describe, expect, it } from "vitest"

import { applySmallEdits, scanAndSuggestEdits } from "../ai/agents/latexTailor"

dotenv.config()

describe("Resume Tailor Agent", () => {
  const sampleLatex = `\\documentclass{article}
\\begin{document}
\\section*{Experience}
\\textbf{Software Developer} - ABC Corp
\\begin{itemize}
  \\item Developed web applications
  \\item Worked with team members
\\end{itemize}
\\end{document}`

  const sampleJobDescription = `
    We are looking for a Full Stack Engineer with experience in:
    - React and TypeScript
    - Node.js and Express
    - RESTful API design
    - Agile development
  `

  it("should extract keywords and suggest edits", async () => {
    const result = await scanAndSuggestEdits(sampleLatex, sampleJobDescription)

    console.log("\n" + "=".repeat(50))

    expect(result).toBeDefined()
    expect(result.keywords).toBeInstanceOf(Array)
    expect(result.edits).toBeInstanceOf(Array)
    expect(result.keywords.length).toBeGreaterThan(0)
  }, 30000) // 30 second timeout for AI call

  it("should apply edits to original content", async () => {
    const edits = [
      {
        reason: "Add specific technologies",
        original: "Developed web applications",
        updated: "Developed web applications using React and TypeScript",
      },
      {
        reason: "Use action verb",
        original: "Worked with team members",
        updated:
          "Collaborated with cross-functional teams in Agile environment",
      },
    ]

    const result = await applySmallEdits(sampleLatex, edits)

    expect(result).toContain("React and TypeScript")
    expect(result).toContain("Agile environment")
    expect(result).not.toContain("Worked with team members")
  })

  it("should throw error for too short job description", async () => {
    await expect(scanAndSuggestEdits(sampleLatex, "Job")).rejects.toThrow(
      /Invalid job description/
    )
  }, 30000)

  it("should throw error for too short resume", async () => {
    await expect(
      scanAndSuggestEdits("\\item test", sampleJobDescription)
    ).rejects.toThrow(/Invalid resume/)
  }, 30000)

  it("should throw error for non-LaTeX resume", async () => {
    const plainText = "This is just plain text, not LaTeX at all"
    await expect(
      scanAndSuggestEdits(plainText, sampleJobDescription)
    ).rejects.toThrow(/Invalid resume/)
  }, 30000)
})

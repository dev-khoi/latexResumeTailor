import { applySmallEdits, scanAndSuggestEdits } from "@/ai/agents/latexTailor"
import { describe, expect, it } from "vitest"

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

    console.log("\n📊 AI Analysis Results:")
    console.log("=".repeat(50))
    console.log("\n🔑 Extracted Keywords:", result.keywords)
    console.log("\n✏️  Suggested Edits:")
    result.edits.forEach((edit, idx) => {
      console.log(`\n  Edit ${idx + 1}:`)
      console.log(`  Reason: ${edit.reason}`)
      console.log(`  Original: "${edit.original}"`)
      console.log(`  Updated: "${edit.updated}"`)
    })
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

    console.log("\n🔧 Applying Edits:")
    console.log("=".repeat(50))
    console.log("\n📄 Original LaTeX:\n", sampleLatex)

    const result = await applySmallEdits(sampleLatex, edits)

    console.log("\n✨ Modified LaTeX:\n", result)
    console.log("\n" + "=".repeat(50))

    expect(result).toContain("React and TypeScript")
    expect(result).toContain("Agile environment")
    expect(result).not.toContain("Worked with team members")
  })
})

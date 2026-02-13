import { Output, generateText } from "ai"
import { z } from "zod"

import systemPrompt from "../prompts/resumeTailorPrompt"

// Zod schema for individual edit
const ResumeEditSchema = z.object({
  reason: z
    .string()
    .describe("describing why this part has changed or what can be suggested"),
  original: z
    .string()
    .describe("The exact original LaTeX content to be replaced"),
  updated: z.string().default("").describe("The improved LaTeX content"),
})

// Zod schema for the response
const ResumeEditsResponseSchema = z.object({
  validationError: z
    .string()
    .nullable()
    .describe("Error message if inputs are invalid, null if valid"),
  edits: z.array(ResumeEditSchema),
  keywords: z.array(z.string()),
})

export type ResumeEdit = z.infer<typeof ResumeEditSchema>
export type ResumeEditsResponse = z.infer<typeof ResumeEditsResponseSchema>

/**
 * Scans a LaTeX resume against a job description and suggests keyword-optimized edits
 * @param latexContent - The full LaTeX resume content
 * @param jobDescription - The job description text or HTML
 * @returns Object containing suggested edits and extracted keywords
 */
export async function scanAndSuggestEdits(
  latexContent: string,
  jobDescription: string
) {
  const prompt = `
  JOB DESCRIPTION: \`\`\`${jobDescription}\`\`\`
---
LATEX RESUME:
\`\`\`${latexContent}\`\`\`
---
Instructions:
1. Extract the most important ATS keywords from the job description above
2. Compare the resume to these keywords
3. Suggest edits to bullet points or sentences that can incorporate missing keywords
4. Return the keywords array and edits array as specified in the schema`

  const result = await generateText({
    model: "google/gemini-2.0-flash",
    system: systemPrompt,
    prompt: prompt,
    output: Output.object({
      schema: ResumeEditsResponseSchema,
    }),
    timeout: 30000, // 30 second timeout
  })

  // Return only the JSON output from LLM
  const parsed = ResumeEditsResponseSchema.safeParse(result.output)

  if (!parsed.success) {
    throw new Error("Failed to parse AI response: Invalid schema returned")
  }

  // Check for validation errors from AI
  if (parsed.data.validationError) {
    throw new Error(parsed.data.validationError)
  }
  const edits = parsed.data.edits.map((e) => ({
    ...e,
    updated: e.updated ?? e.original,
  }))

  return {
    validationError: parsed.data.validationError,
    keywords: parsed.data.keywords,
    edits,
  }
}

export async function applySmallEdits(
  original: string,
  edits: ResumeEdit[]
): Promise<string> {
  let modified = original

  for (const edit of edits) {
    // Escape special characters for regex
    const escapedOriginal = edit.original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    // Replace with updated content (global replace)
    modified = modified.replace(new RegExp(escapedOriginal, "g"), edit.updated)
  }

  return modified
}

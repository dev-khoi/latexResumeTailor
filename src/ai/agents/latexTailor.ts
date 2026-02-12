import { Output, generateText } from "ai"
import { z } from "zod"

import systemPrompt from "../prompts/resumeTailorPrompt"

// Zod schema for individual edit
const ResumeEditSchema = z.object({
  reason: z.string().describe("describing why this part has changed"),
  original: z
    .string()
    .describe("The exact original LaTeX content to be replaced"),
  updated: z.string().describe("The improved LaTeX content"),
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
  // Truncate job description to first 4000 characters to avoid token limits
  const truncatedJobDescription = jobDescription.substring(0, 4000)

  // Truncate resume to first 5000 characters to keep payload reasonable
  const truncatedResume = latexContent.substring(0, 5000)

  const prompt = `
  JOB DESCRIPTION: \`\`\`${truncatedJobDescription}\`\`\`
---
LATEX RESUME:
\`\`\`${truncatedResume}\`\`\`
---
Instructions:
1. Extract the most important ATS keywords from the job description above
2. Compare the resume to these keywords
3. Suggest edits to bullet points or sentences that can incorporate missing keywords
4. Return the keywords array and edits array as specified in the schema`

  const result = await generateText({
    model: "google/gemini-2.5-flash",
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

  return parsed.data
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

import { Output, generateText } from "ai"
import { z } from "zod"

const systemPrompt = `You are a LaTeX resume editor and ATS keyword optimization expert.

TASK:
You will receive:
1. A job description (text or HTML)
2. A full LaTeX resume

Your job is to:
1. Extract up to 20 ATS-relevant keywords from the job posting
   - Only include keywords that appear explicitly in the job description
   - Prioritize: technical skills, tools, systems, methodologies, measurable responsibilities
   - Make keywords concise (e.g., "React" not "React.js framework")
   - Deduplicate similar keywords
   - Exclude generic soft skills unless measurable (e.g., "leadership" is OK, "team player" is not)

2. Scan the LaTeX resume for opportunities to incorporate missing keywords
   - Look for bullet points, sentences, and descriptions that can be improved
   - Only suggest changes where keywords naturally fit
   - Preserve LaTeX syntax and structure (keep \\resumeItem, \\section, etc. intact)
   - DO NOT modify: macros, preamble, section headers, or well-written content

3. Return ONLY edits that:
   - Add missing keywords to strengthen ATS matching
   - Improve clarity, impact, or professional tone
   - Replace weak action verbs with strong ones
   - Make accomplishments more quantifiable and specific

RULES:
- Return ONLY segments worth changing (be selective, quality over quantity)
- Each edit must include the EXACT original LaTeX text
- Preserve all LaTeX formatting and commands
- Return structured JSON with edits array and keywords array
- DO NOT include explanations outside the JSON structure`
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
    model: "google/gemini-2.5-flash",
    system: systemPrompt,
    prompt: prompt,
    output: Output.object({
      schema: ResumeEditsResponseSchema,
    }),
  })

  // Return only the JSON output from LLM
  console.log(result)
  return result.output
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

// src/utils/usedKeywordCheck.ts
export interface KeywordAnalysis {
  usedKeywords: string[]
  unusedKeywords: string[]
}

/**
 * Analyzes which keywords from a list are present in the resume content
 * @param keywords - Array of keywords to check
 * @param resumeContent - The resume text to search in
 * @returns Object with used and unused keyword arrays
 */
export function analyzeKeywordUsage(
  keywords: string[],
  resumeContent: string
): KeywordAnalysis {
  const normalizedContent = resumeContent.toLowerCase()

  const usedKeywords: string[] = []
  const unusedKeywords: string[] = []

  keywords.forEach((keyword) => {
    const normalizedKeyword = keyword.toLowerCase()

    // Check if the keyword appears in the content
    // Use word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${escapeRegex(normalizedKeyword)}\\b`, "i")

    if (regex.test(resumeContent)) {
      usedKeywords.push(keyword)
    } else {
      unusedKeywords.push(keyword)
    }
  })

  return { usedKeywords, unusedKeywords }
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

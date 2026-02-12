import extractHTMLFromUrl from "@/utils/jobPostingParsing/jobPostingParsing"
import { describe, expect, it } from "vitest"

describe("Web Scraping - extractHTMLFromUrl", () => {
  it("should extract HTML content from a valid job posting URL", async () => {
    const validUrl = "https://www.example.com/careers/software-engineer"

    const result = await extractHTMLFromUrl(validUrl)

    // Should return HTML content as a string
    expect(result).toBeDefined()
    expect(typeof result).toBe("string")
    expect(result.length).toBeGreaterThan(0)
  }, 30000) // 30 second timeout for web scraping

  it("should throw error for invalid or unreachable URL", async () => {
    const invalidUrl =
      "https://this-is-a-completely-fake-domain-that-does-not-exist-12345.com/job"

    await expect(extractHTMLFromUrl(invalidUrl)).rejects.toThrow(
      /Unable to access the job posting URL|Failed to extract job posting content/
    )
  }, 30000) // 30 second timeout
})

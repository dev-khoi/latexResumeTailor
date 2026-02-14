import dotenv from "dotenv"
import { describe, expect, it } from "vitest"

import extractHTMLFromUrl from "../utils/jobPostingParsing/jobPostingParsing"

dotenv.config()

describe("Web Scraping - extractHTMLFromUrl", () => {
  it("should extract HTML content from a valid job posting URL", async () => {
    const validUrl =
      "https://proofpoint.wd5.myworkdayjobs.com/proofpointcareers/job/Toronto-Canada/Application-Developer-Programmer-Co-op-Intern_R13688?utm_source=Simplify&ref=Simplify"

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

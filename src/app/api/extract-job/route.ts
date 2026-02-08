import { NextRequest, NextResponse } from "next/server";
import extractHTMLFromUrl from "@/utils/jobPostingParsing/jobPostingParsing"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    const html = await extractHTMLFromUrl(url)

    if (!html) {
      return NextResponse.json(
        { error: "Failed to extract content from URL" },
        { status: 500 }
      )
    }

    return NextResponse.json({ html })
  } catch (error) {
    console.error("Error extracting job posting:", error)
    return NextResponse.json(
      { error: "Failed to extract job posting" },
      { status: 500 }
    )
  }
}

"use client"

import { useMemo } from "react"
import { Diff, Hunk, parseDiff } from "react-diff-view"

// import "react-diff-view/style/index.css"

interface LatexDiffViewerProps {
  originalContent: string
  tailoredContent: string
}

function createUnifiedDiff(
  original: string,
  tailored: string,
  originalName = "original.tex",
  tailoredName = "tailored.tex"
): string {
  const originalLines = original.split("\n")
  const tailoredLines = tailored.split("\n")

  const diff = computeDiff(originalLines, tailoredLines)

  const hunkLines: string[] = []
  let oldCount = 0
  let newCount = 0

  for (const [type, line] of diff) {
    if (type === "delete") {
      hunkLines.push(`-${line}`)
      oldCount++
    } else if (type === "insert") {
      hunkLines.push(`+${line}`)
      newCount++
    } else {
      hunkLines.push(` ${line}`)
      oldCount++
      newCount++
    }
  }

  return [
    `diff --git a/${originalName} b/${tailoredName}`,
    `--- a/${originalName}`,
    `+++ b/${tailoredName}`,
    `@@ -1,${oldCount} +1,${newCount} @@`,
    ...hunkLines,
  ].join("\n")
}
// Simple diff algorithm
function computeDiff(
  original: string[],
  modified: string[]
): Array<[string, string]> {
  const result: Array<[string, string]> = []
  const matrix: number[][] = []

  // Create the diff matrix
  for (let i = 0; i <= original.length; i++) {
    matrix[i] = []
    for (let j = 0; j <= modified.length; j++) {
      if (i === 0) matrix[i][j] = j
      else if (j === 0) matrix[i][j] = i
      else if (original[i - 1] === modified[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] =
          1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1])
      }
    }
  }

  // Backtrack to find the diff
  let i = original.length
  let j = modified.length

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && original[i - 1] === modified[j - 1]) {
      result.unshift(["equal", original[i - 1]])
      i--
      j--
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
      result.unshift(["insert", modified[j - 1]])
      j--
    } else if (i > 0) {
      result.unshift(["delete", original[i - 1]])
      i--
    }
  }

  return result
}

export function LatexDiffViewer({
  originalContent,
  tailoredContent,
}: LatexDiffViewerProps) {
  const diffText = useMemo(() => {
    if (!originalContent || !tailoredContent) return null
    return createUnifiedDiff(originalContent, tailoredContent)
  }, [originalContent, tailoredContent])

  const files = useMemo(() => {
    if (!diffText) return []
    try {
      return parseDiff(diffText, { nearbySequences: "zip" })
    } catch (error) {
      console.error("Error parsing diff:", error)
      return []
    }
  }, [diffText])

  if (!originalContent) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          Upload a resume to start comparing
        </p>
      </div>
    )
  }

  if (!tailoredContent) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-gray-500 text-lg">
          Enter a job URL and click "Tailor with AI" to see changes
        </p>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <p className="text-gray-500 text-lg">No changes detected</p>
      </div>
    )
  }

  return (
    <div className="h-full w-full overflow-auto bg-white">
      {files.map((file, index) => (
        <Diff
          key={index}
          viewType="split"
          diffType={file.type}
          hunks={file.hunks}
          optimizeSelection
        >
          {(hunks) =>
            hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)
          }
        </Diff>
      ))}
    </div>
  )
}

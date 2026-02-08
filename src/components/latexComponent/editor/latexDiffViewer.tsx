"use client"

import { useMemo } from "react"
import { ResumeEdit } from "@/ai/agents/latexTailor"
import { Info } from "lucide-react"
import { Diff, Hunk, getChangeKey, parseDiff, tokenize } from "react-diff-view"
import refractor from 'refractor/core'
import latex from 'refractor/lang/latex'

refractor.register(latex)

interface LatexDiffViewerProps {
  suggestedEdits: ResumeEdit[]
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
  suggestedEdits,
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

  // Create widgets to show edit reasons
  const widgets = useMemo(() => {
    if (!files.length || !suggestedEdits.length) return {}

    const allChanges = files.flatMap((file) =>
      file.hunks.flatMap((hunk) => hunk.changes)
    )

    const widgetMap: Record<string, React.ReactNode> = {}

    // Match changes with their corresponding edit reasons
    for (const change of allChanges) {
      // Only show widget on insert (right side)
      if (change.type === "insert") {
        const changeContent = change.content.trim()

        // Find matching edit by comparing content
        const matchingEdit = suggestedEdits.find((edit) =>
          changeContent.includes(edit.updated.trim())
        )

        if (matchingEdit) {
          const changeKey = getChangeKey(change)
          widgetMap[changeKey] = (
            <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  Why this changed:
                </p>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {matchingEdit.reason}
                </p>
              </div>
            </div>
          )
        }
      }
    }

    return widgetMap
  }, [files, suggestedEdits])

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
    <div className="h-full w-full overflow-auto bg-white dark:bg-slate-900">
      {files.map((file, index) => {
        const tokens = tokenize(file.hunks, {
          highlight: true,
          language: "latex",
          refractor: Prism as any,
        })

        return (
          <Diff
            key={index}
            viewType="split"
            diffType={file.type}
            hunks={file.hunks}
            tokens={tokens}
            widgets={widgets}
            optimizeSelection
          >
            {(hunks) =>
              hunks.map((hunk) => <Hunk key={hunk.content} hunk={hunk} />)
            }
          </Diff>
        )
      })}
    </div>
  )
}

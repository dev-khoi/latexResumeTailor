"use client"

import { useEffect, useState } from "react"
import type { ResumeEdit } from "@/ai/agents/latexTailor"
import Editor, { Monaco } from "@monaco-editor/react"
import { Bold, Italic, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"

const defaultLatexTemplate = `\\documentclass[11pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{geometry}
\\geometry{margin=1in}

\\begin{document}

\\begin{center}
  {\\LARGE \\textbf{Your Name}} \\\\[0.2cm]
  Email: your.email@example.com | Phone: (123) 456-7890
\\end{center}

\\section*{Education}
\\textbf{University Name} \\hfill City, State \\\\
Bachelor of Science in Computer Science \\hfill Expected Graduation: May 2024

\\section*{Experience}
\\textbf{Software Engineer Intern} \\hfill Summer 2023 \\\\
\\textit{Company Name} \\hfill City, State
\\begin{itemize}
  \\item Developed and maintained features using React and Node.js
  \\item Collaborated with cross-functional teams to deliver projects
\\end{itemize}

\\section*{Skills}
\\textbf{Programming Languages:} JavaScript, TypeScript, Python, Java \\\\
\\textbf{Frameworks \\& Tools:} React, Next.js, Node.js, Git

\\end{document}
`

export function LatexEditor({
  initialContent,
  enableAITailoring = false,
}: {
  initialContent?: string
  enableAITailoring?: boolean
}) {
  const [latexContent, setLatexContent] = useState(
    initialContent || defaultLatexTemplate
  )
  const [editorInstance, setEditorInstance] = useState<any>(null)
  const [isBoldActive, setIsBoldActive] = useState(false)
  const [isItalicActive, setIsItalicActive] = useState(false)

  // AI Tailoring states
  const [jobUrl, setJobUrl] = useState<string>("")
  const [keywords, setKeywords] = useState<string[]>([])
  const [suggestedEdits, setSuggestedEdits] = useState<ResumeEdit[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>("")

  // Update content when initialContent prop changes
  useEffect(() => {
    if (initialContent) {
      setLatexContent(initialContent)
    }
  }, [initialContent])

  // Tailor resume based on job posting
  const handleTailorResume = async () => {
    if (!initialContent) {
      setError("Please load a resume first")
      return
    }

    if (!jobUrl) {
      setError("Please enter a job posting URL")
      return
    }

    setIsProcessing(true)
    setError("")

    try {
      // Step 1: Extract job description from URL via API
      const extractResponse = await fetch("/api/extract-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl }),
      })

      if (!extractResponse.ok) {
        const errorData = await extractResponse.json()
        throw new Error(errorData.error || "Failed to extract job posting")
      }

      const { html: jobDescription } = await extractResponse.json()

      //   Step 2: html resume via API
      const tailorResponse = await fetch("/api/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latexContent: initialContent,
          jobDescription,
        }),
      })

      if (!tailorResponse.ok) {
        const errorData = await tailorResponse.json()
        throw new Error(errorData.error || "Failed to tailor resume")
      }

      const { edits, keywords, tailoredContent } = await tailorResponse.json()

      // Store results
      setSuggestedEdits(edits)
      setKeywords(keywords)
      setLatexContent(tailoredContent)
    } catch (err) {
      console.error("Error tailoring resume:", err)
      setError(err instanceof Error ? err.message : "Failed to tailor resume")
    } finally {
      setIsProcessing(false)
    }
  }

  // If no initial content, show upload message
  if (!initialContent) {
    return (
      <div className="h-full w-full text-center py-8 px-4 border-2 border-collapse rounded-lg transition-colors flex flex-col items-center justify-center m-auto">
        <p className="text-gray-500 text-lg">Upload LaTeX resume to show</p>
      </div>
    )
  }

  const insertText = (
    before: string,
    after: string = "",
    toggleState?: (val: boolean) => void
  ) => {
    if (!editorInstance) return

    const selection = editorInstance.getSelection()
    const selectedText = editorInstance.getModel().getValueInRange(selection)

    editorInstance.executeEdits("", [
      {
        range: selection,
        text: `${before}${selectedText}${after}`,
      },
    ])
    editorInstance.focus()

    if (toggleState) {
      toggleState(true)
      setTimeout(() => toggleState(false), 200)
    }
  }

  const handleEditorWillMount = (monaco: Monaco) => {
    // Register LaTeX language
    monaco.languages.register({ id: "latex" })

    // Define LaTeX syntax highlighting
    monaco.languages.setMonarchTokensProvider("latex", {
      tokenizer: {
        root: [
          // Commands
          [/\\[a-zA-Z@]+/, "keyword"],
          // Environments
          [/\\(begin|end)\{[^}]*\}/, "type"],
          // Comments
          [/%.*$/, "comment"],
          // Math mode
          [/\$\$/, "string", "@mathblock"],
          [/\$/, "string", "@math"],
          // Curly braces
          [/[{}]/, "delimiter.curly"],
          // Square brackets
          [/[\[\]]/, "delimiter.square"],
          // Special characters
          [/[&_^~]/, "keyword.operator"],
        ],
        math: [
          [/[^$]+/, "string"],
          [/\$/, "string", "@pop"],
        ],
        mathblock: [
          [/[^$]+/, "string"],
          [/\$\$/, "string", "@pop"],
        ],
      },
    })

    // Define LaTeX theme
    monaco.editor.defineTheme("latexTheme", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "#3b36fd", fontStyle: "bold" }, // Commands (blue)
        { token: "type", foreground: "008080", fontStyle: "bold" }, // Environments (teal)
        { token: "comment", foreground: "008000", fontStyle: "italic" }, // Comments (green)
        { token: "string", foreground: "A31515" }, // Math mode (red)
        { token: "delimiter.curly", foreground: "FF8C00" }, // Braces (dark orange)
        { token: "delimiter.square", foreground: "9932CC" }, // Brackets (dark orchid)
        { token: "keyword.operator", foreground: "000000" }, // Special chars (black)
      ],
      colors: {
        "editor.background": "#FFFFFF",
        "editor.foreground": "#000000",
      },
    })
  }

  return (
    <div className="h-full w-full border rounded-md overflow-hidden flex flex-col">
      {/* AI Tailoring Section - Only show if enabled */}
      {enableAITailoring && initialContent && (
        <div className="flex-shrink-0 bg-slate-800 border-b border-slate-700 p-4 space-y-3">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300">
              Job Posting URL
            </label>
            <input
              type="url"
              placeholder="https://company.com/job/role"
              value={jobUrl}
              onChange={(e) => setJobUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <Button
            onClick={handleTailorResume}
            disabled={!jobUrl || isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            {isProcessing ? (
              <>
                <span className="animate-pulse">Processing...</span>
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                Tailor with AI
              </>
            )}
          </Button>

          {error && (
            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-2 text-xs text-red-400">
              {error}
            </div>
          )}

          {keywords.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-300">
                Extracted Keywords ({keywords.length})
              </h5>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                {keywords.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-xs text-blue-400"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {suggestedEdits.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-semibold text-slate-300">
                Suggested Changes ({suggestedEdits.length})
              </h5>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {suggestedEdits.map((edit, idx) => (
                  <div
                    key={idx}
                    className="rounded-md bg-slate-700/50 border border-slate-600 p-2"
                  >
                    <p className="text-slate-300 text-xs italic">
                      {edit.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b bg-white p-2 flex-shrink-0">
        {/* Text Type Dropdown */}
        <div className="border-r pr-2">
          <select
            className="px-3 py-1.5 border rounded hover:border-gray-50 cursor-pointer text-sm"
            onChange={(e) => {
              const value = e.target.value
              if (value) {
                insertText(value, "}")
                e.target.value = ""
              }
            }}
            defaultValue=""
          >
            <option value="">Normal text</option>
            <option value="\section{">Section</option>
            <option value="\subsection{">Subsection</option>
            <option value="\subsubsection{">Subsubsection</option>
            <option value="{\Large ">Large</option>
            <option value="{\large ">large</option>
            <option value="{\small ">small</option>
            <option value="{\tiny ">tiny</option>
          </select>
        </div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => insertText("\\textbf{", "}", setIsBoldActive)}
            className={`p-2 rounded transition-colors ${
              isBoldActive ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
            aria-label="Bold"
            title="Bold"
          >
            <Bold size={20} strokeWidth={3} className="text-black" />
          </button>
          <button
            onClick={() => insertText("\\textit{", "}", setIsItalicActive)}
            className={`p-2 rounded transition-colors ${
              isItalicActive ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
            }`}
            aria-label="Italic"
            title="Italic"
          >
            <Italic size={20} strokeWidth={3} className="text-black" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="latex"
          theme="latexTheme"
          value={latexContent}
          onChange={(v) => setLatexContent(v ?? "")}
          beforeMount={handleEditorWillMount}
          onMount={(editor) => setEditorInstance(editor)}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            lineNumbers: "on",
            renderLineHighlight: "all",
            cursorBlinking: "smooth",
            smoothScrolling: true,
          }}
        />
      </div>
    </div>
  )
}

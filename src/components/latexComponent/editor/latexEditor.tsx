"use client"

import { useState } from "react"
import Editor, { Monaco } from "@monaco-editor/react"
import { Bold, Italic } from "lucide-react"

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

export function LatexEditor() {
  const [latexContent, setLatexContent] = useState(defaultLatexTemplate)
  const [editorInstance, setEditorInstance] = useState<any>(null)
  const [isBoldActive, setIsBoldActive] = useState(false)
  const [isItalicActive, setIsItalicActive] = useState(false)

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

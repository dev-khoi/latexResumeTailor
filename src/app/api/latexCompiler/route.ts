// import { NextRequest, NextResponse } from "next/server"
// import pdflatex from "node-pdflatex"

// export const runtime = "nodejs"

// export async function POST(request: NextRequest) {
//   try {
//     const formData = await request.formData()
//     const file = formData.get("file") as File

//     if (!file) {
//       return NextResponse.json({ error: "No file provided" }, { status: 400 })
//     }

//     if (!file.name.endsWith(".tex")) {
//       return NextResponse.json(
//         { error: "File must be a .tex file" },
//         { status: 400 }
//       )
//     }

//     // Read the LaTeX file content
//     const texContent = await file.text()

//     // Compile using node-pdflatex (requires pdflatex installed)
//     const pdf = await pdflatex(texContent)

//     console.log("PDF generated, size:", pdf.length, "bytes")

//     // pdf is a Buffer, convert to Uint8Array
//     const pdfBytes = new Uint8Array(pdf)

//     return new NextResponse(pdfBytes, {
//       status: 200,
//       headers: {
//         "Content-Type": "application/pdf",
//         "Content-Disposition": `attachment; filename="${file.name.replace(
//           ".tex",
//           ".pdf"
//         )}"`,
//       },
//     })
//   } catch (error) {
//     console.error("LaTeX compilation error:", error)

//     const message = error instanceof Error ? error.message : "Unknown error"
//     const isMissingPdflatex =
//       typeof message === "string" &&
//       (message.toLowerCase().includes("pdflatex") ||
//         message.includes("ENOENT") ||
//         message.includes("spawn"))

//     return NextResponse.json(
//       {
//         error: isMissingPdflatex
//           ? "Server cannot find pdflatex. Install MiKTeX (https://miktex.org/download) or TeX Live, ensure pdflatex is on PATH, then restart the dev server."
//           : `LaTeX compilation failed: ${message}`,
//       },
//       { status: 500 }
//     )
//   }
// }

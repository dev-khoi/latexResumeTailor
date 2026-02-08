// // app/api/overleaf-latex-opener/route.ts

// import { NextRequest, NextResponse } from "next/server"

// import { createClient } from "@/lib/supabase/server"

// /**
//  * GET /api/overleaf-latex-opener
//  *
//  * Secure proxy to serve LaTeX files from Supabase to Overleaf
//  *
//  * Query params:
//  * - filePath: path inside the bucket (e.g., "user-id/resume.tex")
//  */
// export async function GET(request: NextRequest) {
//   try {
//     const supabase = await createClient()

//     // Authenticate user
//     const {
//       data: { user },
//     } = await supabase.auth.getUser()

//     if (!user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     // Parse query
//     const { searchParams } = new URL(request.url)
//     const filePath = searchParams.get("filePath")
//     if (!filePath) {
//       return NextResponse.json(
//         { error: "Missing filePath parameter" },
//         { status: 400 }
//       )
//     }

//     // Security: verify the file belongs to the user
//     const pathParts = filePath.split("/")
//     const fileUserId = pathParts[0] // Assuming path format: "{userId}/filename.ext"
//     if (fileUserId !== user.id) {
//       return NextResponse.json(
//         { error: "Unauthorized. File access denied." },
//         { status: 403 }
//       )
//     }

//     // Generate a signed URL to fetch the file
//     const { data: urlData, error: urlError } = await supabase.storage
//       .from("latexResume")
//       .createSignedUrl(filePath, 60) // 1 minute is enough to fetch

//     if (urlError || !urlData) {
//       console.error("Supabase signed URL error:", urlError)
//       return NextResponse.json(
//         { error: "Failed to generate file URL" },
//         { status: 500 }
//       )
//     }

//     // Fetch the file content from Supabase
//     console.log(urlData.signedUrl)
//     const fileResponse = await fetch(urlData.signedUrl)

//     if (!fileResponse.ok) {
//       console.error("Failed to fetch file from Supabase")
//       return NextResponse.json(
//         { error: "Failed to fetch file content" },
//         { status: 500 }
//       )
//     }

//     // Get the file content as text
//     const fileContent = await fileResponse.text()
//     console.log(fileContent)
//     // Return the raw LaTeX content with proper headers
//     return new NextResponse(fileContent, {
//       status: 200,
//       headers: {
//         "Content-Type": "text/plain; charset=utf-8",
//         "Content-Disposition": `inline; filename="${
//           pathParts[pathParts.length - 1]
//         }"`,
//         "Cache-Control": "no-cache, no-store, must-revalidate",
//         Pragma: "no-cache",
//         Expires: "0",
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "GET, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type",
//       },
//     })
//   } catch (err) {
//     console.error("API error:", err)
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     )
//   }
// }

// /**
//  * OPTIONS handler for CORS preflight requests
//  */
// export async function OPTIONS() {
//   return NextResponse.json(
//     {},
//     {
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Access-Control-Allow-Methods": "GET, OPTIONS",
//         "Access-Control-Allow-Headers": "Content-Type",
//       },
//     }
//   )
// }

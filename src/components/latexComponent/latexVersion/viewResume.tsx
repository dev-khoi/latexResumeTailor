// import React from "react"
// import { Resume } from "@/database/storage/resume"
// import { Download } from "lucide-react"

// import { Button } from "@/components/ui/button"

// type ViewResumeButtonProps = {
//   resume: Resume
//   deletingId?: string | number
//   getLatexFileUrl: (filePath: string) => Promise<string | null>
//   setError: (msg: string) => void
// }

// export const ViewResumeButton = ({
//   resume,
//   deletingId,
//   getLatexFileUrl,
//   setError,
// }: ViewResumeButtonProps) => {
//   const handleView = async (resume: Resume) => {
//     const url = await getLatexFileUrl(resume.file_path)
//     if (url) {
//       window.open(url)
//     } else {
//       setError("Failed to get file URL")
//     }
//   }

//   return (
//     <Button
//       variant="outline"
//       size="sm"
//       onClick={() => handleView(resume)}
//       disabled={deletingId === resume.id}
//     >
//       <Download className="h-4 w-4" />
//       <span className="sr-only">View</span>
//     </Button>
//   )
// }

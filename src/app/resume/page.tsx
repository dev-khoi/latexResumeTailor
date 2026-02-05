"use client"

import { getLatexFileUrl, getSignedUrl } from "@/database/storage/resume"

import { Button } from "@/components/ui/button"
import UploadResumeButton from "@/components/latexComponent/inputFile"
import ResumeList from "@/components/latexComponent/latexVersion/latexVersionRetrieval"
import ResumeListButton from "@/components/latexComponent/latexVersion/latexVersionRetrieval"
import MainLatexButton from "@/components/latexComponent/mainLatexButton"

export default function Home() {
  return (
    <div className="relative flex justify-center bg-slate-950 px-4 py-10 lg:items-center">
      <div className="flex w-full  max-w-8xl flex-col gap-8 lg:flex-row px-20 items-stretch">
        {/* aside */}
        <aside className="flex h-full min-h-[600px] items-center w-72 flex-col gap-10 rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-white shadow-2xl shadow-slate-950/60 backdrop-blur">
          <div className="space-y-2">
            <h4 className="text-lg font-semibold">Job Posting URL</h4>
            <p className="text-sm text-slate-400">
              Paste the job posting link, then upload your resume.
            </p>
            <input
              type="url"
              placeholder="https://company.com/job/role"
              className="w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* <div className="pt-2">
            <UploadResumeButton />
          </div> */}
          <MainLatexButton />
        </aside>
        {/* main bar */}
        <Button
        // onClick={async () => {
        //   const signedUrl = await getSignedUrl(
        //     "551495a0-7848-4cbc-a118-8a85c1e86e08/example_1770258914855.tex"
        //   )

        //   window.location.href = signedUrl
        // }}
        ></Button>

        <section className="flex-1 h-full min-h-[600px] rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/60 backdrop-blur"></section>
      </div>
    </div>
  )
}

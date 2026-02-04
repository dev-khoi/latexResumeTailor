import UploadResumeButton from "@/components/latexComponent/parseInLatexFileButton"

export default function Home() {
  return (
    export default function Home() {
      return (
        <div className="min-h-screen flex justify-center items-start bg-slate-950 px-4 py-10 lg:items-center">
          <div className="flex w-full max-w-6xl flex-col gap-8 lg:flex-row">
            <section className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-slate-950/60 backdrop-blur">
              <div className="space-y-2">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-400">
                  Resume Match
                </p>
                <h1 className="text-2xl font-semibold text-white">
                  Job posting input
                </h1>
                <p className="text-sm text-slate-400">
                  Paste the job description or upload a posting to tailor your resume for the role.
                </p>
              </div>

              <div className="mt-6 space-y-3">
                <label className="text-sm font-medium text-slate-200">
                  Job description
                </label>
                <textarea
                  placeholder="Paste the job posting or requirements here…"
                  className="h-40 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="mt-6">
                <UploadResumeButton />
              </div>
            </section>

            <aside className="hidden w-full max-w-sm flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-white shadow-2xl shadow-slate-950/60 backdrop-blur lg:flex">
              <div className="space-y-3 text-center">
                <h4 className="text-lg font-semibold">Match Rate</h4>
                <div className="relative mx-auto flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-slate-800">
                  <div className="absolute inset-2 rounded-full border-[6px] border-sky-500/80"></div>
                  <span className="text-4xl font-semibold text-white">39%</span>
                </div>
                <p className="text-sm text-slate-400">
                  Upload &amp; rescan to see how well your resume aligns with the job.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  { label: "Searchability", value: 86, tone: "border-blue-400/70 bg-blue-400/60" },
                  { label: "Hard Skills", value: 18, tone: "border-red-400/70 bg-red-400/60" },
                  { label: "Soft Skills", value: 25, tone: "border-orange-400/70 bg-orange-400/60" },
                  { label: "Recruiter Tips", value: 66, tone: "border-cyan-400/70 bg-cyan-400/60" },
                  { label: "Formatting", value: 100, tone: "border-slate-400/70 bg-slate-400/60" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.15em] text-slate-400">
                      <span>{item.label}</span>
                      <span className="text-slate-100">{item.value}%</span>
                    </div>
                    <div
                      className="h-2 rounded-full border border-white/10"
                      role="progressbar"
                      aria-valuenow={item.value}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${item.label} score`}
                    >
                      <div
                        className={`h-full rounded-full ${item.tone}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium uppercase tracking-[0.2em] text-slate-200 transition hover:bg-white/10">
                Guide me
              </button>
            </aside>
          </div>
        </div>
      )
    }
    </div>
  )
}

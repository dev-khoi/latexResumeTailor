import Link from "next/link"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@radix-ui/react-accordion"
import {
  ArrowRightIcon,
  CheckCircle2,
  ChevronDown,
  Code2,
  Download,
  Eye,
  FileText,
  Search,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
} from "lucide-react"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function IndexPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Left: Text & CTAs */}
          <div className="flex flex-col gap-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight tracking-tight">
              Tailor your{" "}
              <span className="text-green-600 dark:text-green-400">
                LaTeX resume{" "}
              </span>
              to any job
            </h1>

            <p className="text-lg text-muted-foreground max-w-[600px]">
              Upload your <strong>LaTeX resume</strong>, paste a{" "}
              <strong>job URL</strong>, and get a targeted version that
              highlights the right skills.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/resume">
                <Button size="lg" className="w-full sm:w-auto">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload resume and start
                </Button>
              </Link>
              {/* <Link href="/resume">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  Try with a sample resume
                </Button>
              </Link> */}
            </div>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>No fake experience or inflated claims</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>ATS-friendly keywords from the job description</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>
                  Exports clean, compile-ready LaTeX in{" "}
                  <strong>Overleaf</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right: Visual */}
          <div className="relative">
            <Card className=" p-6 shadow-primary dark:bg-slate-800 bg-slate-300  border-2 bg-gradient-to-br from-background via-background to-muted/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium">Original.tex</span>
                  </div>
                  <Badge className="bg-red-600 text-white">Before</Badge>
                </div>
                <Separator />
                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md font-mono text-xs space-y-1 border border-red-200 dark:border-red-800 shadow-md">
                  <div className="text-red-800 dark:text-red-200">
                    {"\\resumeItem{Built web applications...}"}
                  </div>
                  <div className="text-red-800 dark:text-red-200">
                    {"\\resumeItem{Worked with databases...}"}
                  </div>
                </div>
                <div className="flex items-center justify-center ">
                  <ArrowRightIcon className="w-6 h-6 text-primary animate-pulse" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">
                      Tailored_resume.tex
                    </span>
                  </div>
                  <Badge className="bg-green-600">After</Badge>
                </div>
                <Separator />
                <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-md font-mono text-xs space-y-1 border border-green-200 dark:border-green-800 shadow-md">
                  <div className="text-green-800 dark:text-green-200">
                    {
                      "\\resumeItem{Designed and implemented full-stack web applications using React and Node.js...}"
                    }
                  </div>
                  <div className="text-green-800 dark:text-green-200">
                    {"\\resumeItem{Architected PostgreSQL database schemas...}"}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Match score
                    </span>
                    <span className="text-xs line-through text-muted-foreground">
                      82%
                    </span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-green-600">
                      93%
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="container mx-auto px-4 pb-16 md:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 text-center">
            <Badge variant="secondary" className="rounded-full px-4 py-1">
              Demo · 2 min walkthrough
            </Badge>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold">
              Watch LatexResumeTailor in action
            </h2>
            <p className="mt-2 text-muted-foreground">
              From upload to tailored LaTeX exported in overleaf.
            </p>
          </div>

          <div className="relative isolate overflow-hidden rounded-[28px] bg-gradient-to-br from-primary/10 via-background to-background p-[1px] shadow-2xl ring-1 ring-primary/20">
            <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -right-10 top-10 h-48 w-48 rounded-full bg-emerald-400/20 blur-3xl" />

            <div className="relative rounded-[26px] bg-background/80 backdrop-blur-xl border border-white/10 shadow-[0_25px_80px_-35px_rgba(0,0,0,0.6)] p-5 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 text-xs rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 px-3 py-1 font-semibold">
                  <span>AI rewrite, keyword lift, ATS-safe</span>
                </div>
              </div>

              <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/70 via-slate-800/60 to-slate-900/50 shadow-[0_30px_90px_-50px_rgba(0,0,0,0.65)]">
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.14),transparent_30%)]" />
                <video
                  className="h-full w-full object-cover"
                  controls
                  preload="metadata"
                  playsInline
                  poster="/demo/resume-tailor-demo-poster.png"
                >
                  <source src="/demo/latexDemoVid.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Strip */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            Built for engineers, data scientists, and researchers using LaTeX
            resumes
            <Badge variant="outline" className="ml-3">
              No credit card required
            </Badge>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How LatexResumeTailor works
          </h2>
          <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
            A simple, four-step flow from LaTeX source to tailored resume
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              step: "1",
              icon: Upload,
              title: "Upload your LaTeX resume",
              description:
                "Paste or upload your LaTeX resume source. We detect sections like Summary, Skills, etc.",
            },
            {
              step: "2",
              icon: Search,
              title: "Paste the job posting URL",
              description:
                "We fetch the the job description from the url. If something's missing, we will tell you.",
            },
            {
              step: "3",
              icon: Eye,
              title: "Review extracted job focus",
              description:
                "Get a revised LaTeX file with stronger wording, and better keyword alignment—ready to compile.",
            },
          ].map((item, idx) => (
            <Card
              key={idx}
              className="relative overflow-hidden shadow-lg dark:shadow-black border-green-600 dark:border-green-700 border-4 transition-transform duration-300 ease-out hover:scale-110 hover:shadow-2xl"
            >
              <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold text-xl">
                    {item.step}
                  </div>
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {item.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for truthful, ATS-ready resumes
            </h2>
            <p className="text-lg text-muted-foreground max-w-[600px] mx-auto">
              Focus on alignment, not fiction
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Code2,
                title: "LaTeX-native workflow",
                description:
                  "Work directly with your LaTeX source. We keep your template, structure, and compile assumptions intact.",
              },
              {
                icon: Target,
                title: "Job-aware keyword mapping",
                description:
                  "We build a map of tools, domains, and responsibility phrases from the job posting and compare it to your resume.",
              },
              {
                icon: Shield,
                title: "Truth-preserving rewriting",
                description:
                  "We never invent employers, degrees, or years of experience. Bullets are rewritten for clarity and relevance, not fiction.",
              },
              {
                icon: CheckCircle2,
                title: "ATS-friendly output",
                description:
                  "Concise, metric-driven bullets and natural keyword placement keep your resume readable for both humans and ATS systems.",
              },
              {
                icon: FileText,
                title: "Change log and match report",
                description:
                  "Optionally see what changed, why, and which skills were matched or missing.",
              },
              {
                icon: Sparkles,
                title: "Keyword analysis",
                description:
                  "Visual breakdown of used vs. unused keywords to help you understand your resume's alignment with the job.",
              },
            ].map((feature, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <feature.icon className="w-10 h-10 text-primary mb-2" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* Integrity Section */}
      {/* <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-8 lg:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Designed for integrity
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Optimization, not fiction
            </p>
            <div className="space-y-4">
              {[
                "No fabricated employers, degrees, or dates",
                "No unearned tools, certifications, or years of experience",
                "Professional, non-discriminatory language only",
                "Clear errors and fallback: if a job URL can't be parsed, we ask for a different URL or pasted text",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-base">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-6">
            <CardHeader className="px-0 pt-0">
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                Safety Checklist
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-3">
              {[
                "Preserves factual accuracy",
                "No hidden prompt injections",
                "Transparent change tracking",
                "User data privacy",
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-[800px]">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about LatexResumeTailor
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            <AccordionItem
              value="item-1"
              className="rounded-2xl border border-muted/40 bg-background shadow-sm"
            >
              <AccordionTrigger className="group flex w-full items-center justify-between px-4 py-4 text-left text-base font-semibold transition-colors hover:text-primary data-[state=open]:text-primary">
                <span>Do you change my LaTeX template?</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-base text-muted-foreground">
                We keep your existing structure and formatting unless a fix is
                required to keep it compiling. Your template remains intact.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="rounded-2xl border border-muted/40 bg-background shadow-sm"
            >
              <AccordionTrigger className="group flex w-full items-center justify-between px-4 py-4 text-left text-base font-semibold transition-colors hover:text-primary data-[state=open]:text-primary">
                <span>Can you invent experience to match a job?</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-base text-muted-foreground">
                <strong>No.</strong> We never fabricate work history, degrees,
                or skills. We only optimize how your existing experience is
                presented.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="rounded-2xl border border-muted/40 bg-background shadow-sm"
            >
              <AccordionTrigger className="group flex w-full items-center justify-between px-4 py-4 text-left text-base font-semibold transition-colors hover:text-primary data-[state=open]:text-primary">
                <span>Does this work for non-technical roles?</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-base text-muted-foreground">
                Yes, as long as your resume is in LaTeX and you have a job
                posting. The AI adapts to any industry or role.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-5"
              className="rounded-2xl border border-muted/40 bg-background shadow-sm"
            >
              <AccordionTrigger className="group flex w-full items-center justify-between px-4 py-4 text-left text-base font-semibold transition-colors hover:text-primary data-[state=open]:text-primary">
                <span>Do I need a credit card?</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-base text-muted-foreground">
                No card required to start. Try it out and see the results before
                committing to anything.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-6"
              className="rounded-2xl border border-muted/40 bg-background shadow-sm"
            >
              <AccordionTrigger className="group flex w-full items-center justify-between px-4 py-4 text-left text-base font-semibold transition-colors hover:text-primary data-[state=open]:text-primary">
                <span>How accurate is the keyword matching?</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary" />
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 text-base text-muted-foreground">
                Our AI extracts specific, named technologies and skills from job
                postings, not generic terms. You'll see exactly which keywords
                are used vs. missing in your resume.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
    </>
  )
}

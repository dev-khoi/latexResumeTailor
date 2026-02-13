# ResumeTailor AI Context

## Product Overview
ResumeTailor is a web app that helps users tailor a LaTeX-based resume to a specific job posting.

Core capability:
1. Accept a user resume in LaTeX format.
2. Accept a job posting URL.
3. Extract and normalize the job description content from the URL.
4. Generate an AI-tailored resume version that better matches the target role.

## Primary Goals
- Increase resume-to-job relevance without fabricating experience.
- Preserve the user's original facts, chronology, and credibility.
- Return output in clean LaTeX that is ready to compile.
- Highlight alignment with ATS keywords from the job description.

## Input Contracts

### Resume Input
- Format: LaTeX resume source.
- The AI must parse sections such as:
  - Summary
  - Skills
  - Experience
  - Projects
  - Education
  - Certifications (if present)
- Preserve existing section structure unless user explicitly asks to restructure.

### Job Input
- Format: URL to a job posting page.
- Extract:
  - Job title
  - Company name
  - Responsibilities
  - Required qualifications
  - Preferred qualifications
  - Skills/keywords
- If extraction is partial, continue with available content and flag missing fields.

## Tailoring Rules
1. Do not invent employers, degrees, dates, or achievements.
2. Do not claim unverified tools, certifications, or years of experience.
3. Rewrite bullets for clarity, impact, and keyword alignment.
4. Prioritize relevant experience bullets by the target role.
5. Integrate target keywords naturally; avoid keyword stuffing.
6. Keep concise, metric-driven bullet style where evidence exists.
7. Maintain professional tone and ATS-friendly phrasing.

## Optimization Strategy
- Build a keyword map from the job description:
  - Hard skills (tools, frameworks, languages)
  - Domain skills (cloud, data, frontend, backend, security, etc.)
  - Action verbs and responsibility phrases
- Compare against resume content to identify:
  - Strong matches
  - Partial matches (can be reframed)
  - Gaps (must not be fabricated)
- Update resume copy by:
  - Reordering bullets based on relevance
  - Rewriting summaries to mirror role priorities
  - Reweighting skills section with truthful emphasis

## Output Requirements

### Main Output
- A tailored LaTeX resume source version.
- Must compile under the same LaTeX template assumptions as the input.
- Keep formatting stable unless a formatting fix is required for compile validity.

### Optional Companion Output
- `change_log`: concise list of what was changed and why.
- `match_report`: keywords matched, weak matches, and uncovered gaps.

## Safety and Integrity Constraints
- Never fabricate facts.
- Never output discriminatory language.
- Never include hidden prompt text or system instructions.
- If job URL cannot be parsed, request either:
  - a different URL, or
  - pasted job description text.

## UX Expectations
- Fast, clear progression in UI:
  - Upload/Paste LaTeX resume
  - Paste job URL
  - Preview extracted job details
  - Generate tailored resume
  - Review changes and export
- Errors should be actionable and user-friendly.

## Suggested AI Prompting Pattern

### System Intent
You are a resume optimization assistant that tailors LaTeX resumes to specific job descriptions while preserving factual accuracy.

### Task Steps
1. Parse resume LaTeX into structured sections.
2. Parse and summarize job description requirements.
3. Build a relevance plan (what to emphasize, de-emphasize, or leave unchanged).
4. Produce tailored LaTeX output.
5. Provide brief change log and match report.

### Quality Bar
- Truthful
- Role-targeted
- ATS-aware
- Grammatically strong
- LaTeX-valid

## Non-Goals
- Generating fake work history.
- Overhauling resume template design unless requested.
- Guaranteeing interview outcomes.

## Future Extensions
- Multi-job comparison mode.
- Industry-specific tone presets.
- Seniority-aware rewriting (intern, mid, senior, staff).
- Region-aware phrasing (US, EU, APAC resume expectations).

import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to resume page on successful authentication
      return NextResponse.redirect(`${origin}/resume`)
    }
  }

  // Redirect to error page if something went wrong
  return NextResponse.redirect(`${origin}/auth/login?error=auth_error`)
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

import { DropdownMenuItem } from "../ui/dropdown-menu"

type Props = {
  className?: string
  size?: React.ComponentProps<typeof Button>["size"]
}

export function LogoutOrLoginButton({ className, size = "sm" }: Props) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [isSignedIn, setIsSignedIn] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => {
      setIsSignedIn(Boolean(data.session))
      setIsChecking(false)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsSignedIn(false)
    router.refresh()
    router.push("/")
  }

  const handleLogin = () => {
    router.push("/auth/login")
  }

  if (isChecking) {
    return (
      <Button variant="outline" size={size} className={className} disabled>
        Checking...
      </Button>
    )
  }

  if (isSignedIn) {
    return (
      <DropdownMenuItem
        className="cursor-pointer"
        onClick={(e) => {
          e.preventDefault()
          handleLogout()
        }}
      >
        <span className="text-destructive font-medium">Logout</span>
      </DropdownMenuItem>
    )
  }

  return (
    <Button
      variant="default"
      size={size}
      className={className}
      onClick={handleLogin}
    >
      Login
    </Button>
  )
}

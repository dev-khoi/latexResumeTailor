"use client"

import { UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogoutOrLoginButton } from "@/components/auth/logoutOrLoginButton"

export function ProfileMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Account menu"
        >
          <UserRound className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="z-50 min-w-[180px] rounded-xl border border-border bg-popover p-2 text-sm shadow-lg"
        >
          <DropdownMenuLabel className="px-2 pb-2 text-xs font-semibold text-muted-foreground">
            Account
          </DropdownMenuLabel>

          <DropdownMenuItem asChild>
            <LogoutOrLoginButton className="w-full justify-between" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}

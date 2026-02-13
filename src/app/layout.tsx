import "react-diff-view/style/index.css"
import "./globals.css"
import { Metadata } from "next"
import { Analytics } from "@vercel/analytics/next"

import { siteConfig } from "@/config/site"
import { fontSans } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { TailwindIndicator } from "@/components/tailwind-indicator"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
}
interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "max-h-auto bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">
              {children}
              <Analytics />
            </main>
            <SiteFooter className="border-t" />
          </div>
          <TailwindIndicator />
        </ThemeProvider>
      </body>
    </html>
  )
}

export const viewport = {
  themeColor: [
    {
      title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
      },

      description: siteConfig.description,

      icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
      },
    },
    {
      title: {
        default: siteConfig.name,
        template: `%s - ${siteConfig.name}`,
      },

      description: siteConfig.description,

      icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon-16x16.png",
        apple: "/apple-touch-icon.png",
      },
    },
  ],
}

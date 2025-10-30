import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { IntlProvider } from "@/components/providers/intl-provider"
import { Toaster } from "@/components/ui/toaster"
import { cookies } from "next/headers"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CoinPilot Dashboard",
  description: "AI-Powered Cryptocurrency Trading Signals",
  generator: "v0.app",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "zh-CN"
  const messages = (await import(`../messages/${locale}.json`)).default

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <IntlProvider locale={locale} messages={messages}>
            {children}
            <Toaster />
          </IntlProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}

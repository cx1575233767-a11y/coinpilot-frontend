"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LayoutDashboard, TrendingUp, LineChart, CreditCard, Users, Settings, TrendingUpIcon, Brain } from "lucide-react"

type NavItem = {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  proOnly?: boolean
}

const navItems: NavItem[] = [
  {
    title: "仪表盘",
    href: "/app",
    icon: LayoutDashboard,
  },
  {
    title: "信号",
    href: "/app/signals",
    icon: TrendingUp,
  },
  {
    title: "K线图",
    href: "/app/kline",
    icon: LineChart,
  },
  {
    title: "AI交易",
    href: "/app/ai-trading",
    icon: Brain,
    badge: "NEW",
  },
  {
    title: "购买Pro",
    href: "/pricing",
    icon: CreditCard,
  },
  {
    title: "推荐中心",
    href: "/app/referrals",
    icon: Users,
  },
  {
    title: "设置",
    href: "/app/settings",
    icon: Settings,
  },
]

type SidebarProps = {
  isPro?: boolean
}

export function Sidebar({ isPro = false }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-2 border-b border-border/50 px-6">
        <TrendingUpIcon className="h-6 w-6 text-primary" />
        <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-lg font-bold text-transparent">
          CoinPilot
        </span>
        {isPro && (
          <Badge variant="default" className="ml-auto bg-gradient-to-r from-primary to-primary/70">
            Pro
          </Badge>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 smooth-transition hover:bg-secondary/80",
                  isActive && "bg-secondary/80 shadow-sm"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
                {item.badge && (
                  <Badge variant="secondary" className="ml-auto bg-primary/20 text-primary">
                    {item.badge}
                  </Badge>
                )}
                {item.proOnly && !isPro && (
                  <Badge variant="outline" className="ml-auto">
                    Pro
                  </Badge>
                )}
              </Button>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

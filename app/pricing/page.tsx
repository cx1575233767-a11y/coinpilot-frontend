import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Check, TrendingUp } from "lucide-react"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function PricingPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let isPro = false
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single()
    isPro = profile?.plan === "pro"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CoinPilot</span>
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            {user ? (
              <Button asChild>
                <Link href="/app">进入应用</Link>
              </Button>
            ) : (
              <Button asChild variant="ghost">
                <Link href="/signin">登录</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="mb-12 text-center">
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">选择您的计划</h1>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">选择最适合您的计划，随时可以升级或取消</p>
        </div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
          {/* Free Plan */}
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle className="text-2xl">免费版</CardTitle>
              <CardDescription>适合初学者和体验用户</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">¥0</span>
                <span className="text-muted-foreground">/永久</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>基础信号查看</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>有限历史数据</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>社区支持</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>K线图表查看</span>
                </li>
              </ul>
              <Button asChild variant="outline" className="w-full bg-transparent" disabled={!!user}>
                <Link href={user ? "/app" : "/signin"}>{user ? "当前计划" : "免费开始"}</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="relative rounded-2xl border-primary">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="px-4 py-1">推荐</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl">专业版</CardTitle>
              <CardDescription>适合专业交易者</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">¥99</span>
                <span className="text-muted-foreground">/月</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium">无限信号访问</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium">完整历史数据</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium">调度控制功能</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium">Telegram通知</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium">优先客户支持</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium">高级图表功能</span>
                </li>
              </ul>
              {isPro ? (
                <Button className="w-full" disabled>
                  当前计划
                </Button>
              ) : (
                <form action="/api/stripe/checkout" method="POST">
                  <Button type="submit" className="w-full">
                    {user ? "升级到Pro" : "开始使用"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

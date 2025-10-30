import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { TrendingUp, Zap, Clock, ArrowRight } from "lucide-react"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export default async function LandingPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CoinPilot</span>
          </div>
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-6xl">CoinPilot Dashboard</h1>
          <p className="text-balance text-xl text-muted-foreground">AI驱动的加密货币交易信号平台</p>
          <p className="text-pretty text-lg text-muted-foreground">
            获取实时AI预测信号，优化您的交易策略。基于机器学习的智能分析，助您把握市场机会。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="gap-2">
              <Link href={user ? "/app" : "/signin"}>
                开始使用 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">查看价格</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold">核心功能</h2>
          <p className="mt-2 text-muted-foreground">强大的工具助您做出更明智的交易决策</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="rounded-2xl">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>AI信号预测</CardTitle>
              <CardDescription>基于机器学习的交易信号分析，提供入场、止损、止盈建议</CardDescription>
            </CardHeader>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>实时数据</CardTitle>
              <CardDescription>实时K线数据和市场分析，把握每一个交易机会</CardDescription>
            </CardHeader>
          </Card>
          <Card className="rounded-2xl">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>自动化调度</CardTitle>
              <CardDescription>定时批量信号生成和Telegram通知，不错过任何机会</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="rounded-2xl bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-6 p-12 text-center">
            <h2 className="text-3xl font-bold">准备好开始了吗？</h2>
            <p className="max-w-2xl text-pretty text-lg opacity-90">
              立即注册，免费体验AI交易信号。升级到Pro版本解锁更多高级功能。
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href={user ? "/app" : "/signin"}>
                免费开始 <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 CoinPilot Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

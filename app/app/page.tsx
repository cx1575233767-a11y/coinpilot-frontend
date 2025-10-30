import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { TrendingUp, Users, Zap, Activity } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

  const { count: referralCount } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", user!.id)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">仪表盘</h2>
        <p className="text-muted-foreground">查看您的交易信号和账户概览</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">会员状态</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.plan === "pro" ? "Pro" : "Free"}</div>
            <p className="text-xs text-muted-foreground">{profile?.plan === "pro" ? "专业版会员" : "免费版会员"}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">推荐人数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referralCount || 0}</div>
            <p className="text-xs text-muted-foreground">成功推荐的用户</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">推荐码</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.referral_code || "N/A"}</div>
            <p className="text-xs text-muted-foreground">您的专属推荐码</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">账户状态</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">活跃</div>
            <p className="text-xs text-muted-foreground">账户正常运行中</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>快速开始</CardTitle>
            <CardDescription>开始使用CoinPilot的核心功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">查看交易信号</p>
                <p className="text-xs text-muted-foreground">获取AI生成的交易建议</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Activity className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">分析K线图</p>
                <p className="text-xs text-muted-foreground">查看实时市场数据</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-lg border p-3">
              <Users className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">邀请好友</p>
                <p className="text-xs text-muted-foreground">分享推荐码获得奖励</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>升级到Pro</CardTitle>
            <CardDescription>解锁更多高级功能</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                无限信号访问
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                完整历史数据
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                调度控制功能
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                Telegram通知
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                优先客户支持
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

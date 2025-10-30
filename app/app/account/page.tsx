import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { formatDate } from "@/lib/utils/format"
import { Mail, CreditCard, Calendar } from "lucide-react"

async function getPortalUrl() {
  "use server"
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000"}/api/stripe/portal`, {
    method: "POST",
  })
  const data = await response.json()
  return data.url
}

export default async function AccountPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user!.id).single()

  const isPro = profile?.plan === "pro"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">账户设置</h2>
        <p className="text-muted-foreground">管理您的账户信息和订阅</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>账户信息</CardTitle>
            <CardDescription>您的基本账户详情</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">邮箱</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">会员计划</p>
                <div className="mt-1">
                  {isPro ? (
                    <Badge className="bg-primary">Pro</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-transparent">
                      Free
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {isPro && profile?.pro_until && (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">到期时间</p>
                  <p className="text-sm text-muted-foreground">{formatDate(profile.pro_until)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>订阅管理</CardTitle>
            <CardDescription>管理您的订阅和付款方式</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isPro ? (
              <>
                <p className="text-sm text-muted-foreground">
                  您当前是Pro会员。点击下方按钮管理您的订阅、更新付款方式或取消订阅。
                </p>
                <form action={getPortalUrl}>
                  <Button type="submit" className="w-full">
                    管理订阅
                  </Button>
                </form>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  升级到Pro版本以解锁所有高级功能，包括无限信号访问、调度控制和Telegram通知。
                </p>
                <Button asChild className="w-full">
                  <a href="/pricing">升级到Pro</a>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

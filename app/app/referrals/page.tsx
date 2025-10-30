import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Users, Gift } from "lucide-react"
import { CopyButton } from "@/components/copy-button"

export default async function ReferralsPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = await supabase.from("profiles").select("referral_code").eq("id", user!.id).single()

  const { count: referralCount } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", user!.id)

  const referralLink = `${process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000"}/signin?ref=${profile?.referral_code}`

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">推荐中心</h2>
        <p className="text-muted-foreground">邀请好友加入CoinPilot</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">推荐码</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profile?.referral_code || "N/A"}</div>
            <p className="text-xs text-muted-foreground">您的专属推荐码</p>
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
            <CardTitle className="text-sm font-medium">奖励</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">即将推出</div>
            <p className="text-xs text-muted-foreground">敬请期待</p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>分享您的推荐链接</CardTitle>
          <CardDescription>复制下方链接分享给好友</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input value={referralLink} readOnly className="font-mono text-sm" />
            <CopyButton text={referralLink} />
          </div>
          <div className="rounded-lg border bg-muted/50 p-4">
            <h3 className="mb-2 font-semibold">如何运作</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">1.</span>
                分享您的推荐链接给好友
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">2.</span>
                好友通过链接注册账户
              </li>
              <li className="flex gap-2">
                <span className="font-semibold text-foreground">3.</span>
                获得奖励（即将推出）
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

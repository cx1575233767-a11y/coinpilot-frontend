"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { updateReferredBy } from "@/actions/profile"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { TrendingUp, Mail, Lock, Loader2 } from "lucide-react"
import Link from "next/link"

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [showMagicLink, setShowMagicLink] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const supabase = getSupabaseBrowserClient()

  useEffect(() => {
    // Check for referral code in URL
    const ref = searchParams.get("ref")
    if (ref) {
      localStorage.setItem("referral_code", ref)
    }
  }, [searchParams])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/app`,
          },
        })

        if (error) throw error

        if (data.user) {
          // Handle referral code if exists
          const referralCode = localStorage.getItem("referral_code")
          if (referralCode) {
            try {
              await updateReferredBy(referralCode)
              localStorage.removeItem("referral_code")
            } catch (err) {
              console.error("Failed to update referral:", err)
            }
          }

          toast({
            title: "注册成功",
            description: "请检查您的邮箱以验证账户",
          })
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        toast({
          title: "登录成功",
          description: "正在跳转到应用...",
        })

        router.push("/app")
      }
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message || "操作失败，请重试",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/app`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      toast({
        title: "Google登录失败",
        description: "请尝试使用邮箱密码或魔法链接登录",
        variant: "destructive",
      })
      setShowMagicLink(true)
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        title: "错误",
        description: "请输入邮箱地址",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || `${window.location.origin}/app`,
        },
      })

      if (error) throw error

      toast({
        title: "邮件已发送",
        description: "请检查您的邮箱并点击登录链接",
      })
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message || "发送魔法链接失败",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">CoinPilot</span>
        </div>

        <Card className="rounded-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{isSignUp ? "创建账户" : "登录"}</CardTitle>
            <CardDescription>{isSignUp ? "注册以开始使用CoinPilot" : "登录到您的账户"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full bg-transparent" onClick={handleGoogleAuth} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              使用Google登录
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">或</span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">邮箱</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSignUp ? "注册" : "登录"}
              </Button>
            </form>

            {showMagicLink && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">或使用魔法链接</span>
                  </div>
                </div>

                <form onSubmit={handleMagicLink} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="magic-email">邮箱地址</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="magic-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-9"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" variant="outline" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    发送魔法链接
                  </Button>
                </form>
              </>
            )}

            {!showMagicLink && !isSignUp && (
              <div className="text-center">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowMagicLink(true)}
                  className="text-muted-foreground"
                >
                  使用魔法链接登录
                </Button>
              </div>
            )}

            <div className="text-center text-sm">
              {isSignUp ? (
                <p className="text-muted-foreground">
                  已有账户？{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    立即登录
                  </button>
                </p>
              ) : (
                <p className="text-muted-foreground">
                  还没有账户？{" "}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    创建账户
                  </button>
                </p>
              )}
            </div>

            <div className="text-center">
              <Button asChild variant="link" size="sm">
                <Link href="/">返回首页</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

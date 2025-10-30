"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { startScheduler, stopScheduler, sendTelegramTest } from "@/lib/api/backend"
import { Play, Square, Send, Loader2 } from "lucide-react"

type ControlPanelProps = {
  interval: string
  isPro?: boolean
}

export function ControlPanel({ interval, isPro = false }: ControlPanelProps) {
  const { toast } = useToast()
  const [isStarting, setIsStarting] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [isTesting, setIsTesting] = useState(false)

  const handleStart = async () => {
    if (!isPro) {
      toast({
        title: "需要Pro会员",
        description: "调度控制功能仅对Pro会员开放",
        variant: "destructive",
      })
      return
    }

    setIsStarting(true)
    try {
      await startScheduler(interval, 5)
      toast({
        title: "成功",
        description: "调度已启动",
      })
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message || "启动调度失败",
        variant: "destructive",
      })
    } finally {
      setIsStarting(false)
    }
  }

  const handleStop = async () => {
    if (!isPro) {
      toast({
        title: "需要Pro会员",
        description: "调度控制功能仅对Pro会员开放",
        variant: "destructive",
      })
      return
    }

    setIsStopping(true)
    try {
      await stopScheduler()
      toast({
        title: "成功",
        description: "调度已停止",
      })
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message || "停止调度失败",
        variant: "destructive",
      })
    } finally {
      setIsStopping(false)
    }
  }

  const handleTelegramTest = async () => {
    if (!isPro) {
      toast({
        title: "需要Pro会员",
        description: "Telegram通知功能仅对Pro会员开放",
        variant: "destructive",
      })
      return
    }

    setIsTesting(true)
    try {
      await sendTelegramTest()
      toast({
        title: "成功",
        description: "Telegram测试消息已发送",
      })
    } catch (error: any) {
      toast({
        title: "错误",
        description: error.message || "发送测试消息失败",
        variant: "destructive",
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle>调度控制</CardTitle>
        <CardDescription>管理自动信号生成和通知{!isPro && " (需要Pro会员)"}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button onClick={handleStart} disabled={isStarting || !isPro} className="gap-2">
          {isStarting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          启动调度
        </Button>
        <Button onClick={handleStop} disabled={isStopping || !isPro} variant="outline" className="gap-2 bg-transparent">
          {isStopping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Square className="h-4 w-4" />}
          停止调度
        </Button>
        <Button onClick={handleTelegramTest} disabled={isTesting || !isPro} variant="secondary" className="gap-2">
          {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          测试Telegram
        </Button>
      </CardContent>
    </Card>
  )
}

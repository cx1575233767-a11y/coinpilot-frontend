"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Signal } from "@/lib/api/backend"
import { formatNumber, formatDate } from "@/lib/utils/format"
import { TrendingUp, TrendingDown, Target, Shield, Trophy, Zap, Clock, MessageSquare } from "lucide-react"

type AIPredictionCardProps = {
  signal: Signal | null
  isLoading?: boolean
}

export function AIPredictionCard({ signal, isLoading }: AIPredictionCardProps) {
  if (isLoading) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>AI预测</CardTitle>
          <CardDescription>加载中...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!signal) {
    return (
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>AI预测</CardTitle>
          <CardDescription>暂无预测数据</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">请选择币种和时间框以查看AI预测</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>AI预测</CardTitle>
          {signal.direction === "LONG" ? (
            <Badge className="gap-1 bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400">
              <TrendingUp className="h-3 w-3" />
              做多
            </Badge>
          ) : (
            <Badge className="gap-1 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 dark:text-rose-400">
              <TrendingDown className="h-3 w-3" />
              做空
            </Badge>
          )}
        </div>
        <CardDescription>{signal.symbol}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">入场价</p>
              <p className="font-mono text-lg font-bold">{formatNumber(signal.entry_price, 4)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <Shield className="h-5 w-5 text-destructive" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">止损</p>
              <p className="font-mono text-lg font-bold">{formatNumber(signal.stop_loss, 4)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">止盈</p>
              <p className="font-mono text-lg font-bold">{formatNumber(signal.take_profit, 4)}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4" />
              杠杆
            </div>
            <span className="font-semibold">{signal.leverage}x</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              信心度
            </div>
            <span
              className={`font-semibold ${
                signal.confidence >= 0.8
                  ? "text-green-600 dark:text-green-400"
                  : signal.confidence >= 0.6
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-muted-foreground"
              }`}
            >
              {(signal.confidence * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              时间
            </div>
            <span className="text-sm">{formatDate(signal.timestamp)}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            分析理由
          </div>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground">{signal.reason}</p>
        </div>
      </CardContent>
    </Card>
  )
}

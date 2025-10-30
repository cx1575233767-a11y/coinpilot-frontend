"use client"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { SignalsTable } from "@/components/signals/signals-table"
import { IntervalSelector } from "@/components/signals/interval-selector"
import { ControlPanel } from "@/components/signals/control-panel"
import { fetchBatchSignals } from "@/lib/api/backend"
import { RefreshCw, AlertCircle } from "lucide-react"

export default function SignalsPage() {
  const [interval, setInterval] = useState("1h")

  const {
    data: signals,
    error,
    isLoading,
    mutate,
  } = useSWR(["/signals/batch", interval], () => fetchBatchSignals(interval), {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
  })

  const handleRefresh = () => {
    mutate()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">交易信号</h2>
          <p className="text-muted-foreground">查看AI生成的交易信号和建议</p>
        </div>
        <div className="flex items-center gap-3">
          <IntervalSelector value={interval} onChange={setInterval} />
          <Button onClick={handleRefresh} variant="outline" size="icon" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>获取信号失败: {error.message}</AlertDescription>
        </Alert>
      )}

      <ControlPanel interval={interval} isPro={false} />

      <SignalsTable signals={signals || []} isLoading={isLoading} />
    </div>
  )
}

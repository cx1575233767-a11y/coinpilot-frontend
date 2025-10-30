"use client"

import { useState } from "react"
import useSWR from "swr"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card } from "@/components/ui/card"
import { CandlestickChart } from "@/components/kline/candlestick-chart"
import { AIPredictionCard } from "@/components/kline/ai-prediction-card"
import { fetchKlineData, fetchAISignal, fetchSymbols, TOP_10_CRYPTOCURRENCIES } from "@/lib/api/backend"
import { AlertCircle, Loader2 } from "lucide-react"

const intervals = [
  { value: "1h", label: "1小时" },
  { value: "4h", label: "4小时" },
  { value: "1d", label: "1天" },
]

export default function KlinePage() {
  const [symbol, setSymbol] = useState("BTCUSDT")
  const [interval, setInterval] = useState("1h")

  const { data: symbols } = useSWR("/symbols", fetchSymbols)

  const {
    data: klineData,
    error: klineError,
    isLoading: klineLoading,
  } = useSWR(
    symbol && interval ? ["/klines", symbol, interval] : null,
    () => fetchKlineData(symbol, interval, 300),
    {
      refreshInterval: 5000,
      dedupingInterval: 5000,
    }
  )

  const {
    data: aiSignal,
    error: signalError,
    isLoading: signalLoading,
  } = useSWR(
    symbol && interval ? ["/signals/ai", symbol, interval] : null,
    () => fetchAISignal(symbol, interval),
    {
      refreshInterval: 10000,
      dedupingInterval: 10000,
    }
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">K线图表</h2>
          <p className="text-muted-foreground">查看实时K线数据和AI预测</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(symbols || TOP_10_CRYPTOCURRENCIES).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={interval} onValueChange={setInterval}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {intervals.map((i) => (
                <SelectItem key={i.value} value={i.value}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {(klineError || signalError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {klineError ? `获取K线数据失败: ${klineError.message}` : `获取AI信号失败: ${signalError.message}`}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="rounded-2xl p-6">
            {klineLoading ? (
              <div className="flex h-[500px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : klineData && klineData.length > 0 ? (
              <CandlestickChart data={klineData} />
            ) : (
              <div className="flex h-[500px] items-center justify-center">
                <p className="text-muted-foreground">暂无K线数据</p>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <AIPredictionCard signal={aiSignal || null} isLoading={signalLoading} />
        </div>
      </div>
    </div>
  )
}

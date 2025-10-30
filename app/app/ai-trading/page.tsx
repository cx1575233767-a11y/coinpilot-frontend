"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { analyzeTradeAI, TOP_10_CRYPTOCURRENCIES, type AIAnalysis } from "@/lib/api/backend"
import { TrendingUp, TrendingDown, Brain, Zap, AlertCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function AITradingPage() {
  const [symbol, setSymbol] = useState("BTCUSDT")
  const [leverage, setLeverage] = useState("10")
  const [stopLoss, setStopLoss] = useState("")
  const [takeProfit, setTakeProfit] = useState("")
  const [trailingStop, setTrailingStop] = useState("1.5")
  const [autoTradeMode, setAutoTradeMode] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null)
  const { toast } = useToast()

  const handleAnalyze = async () => {
    if (isAnalyzing) return

    setIsAnalyzing(true)
    setAnalysis(null)

    try {
      const leverageNum = leverage !== "" ? parseFloat(leverage) : undefined
      const stopLossNum = stopLoss !== "" ? parseFloat(stopLoss) : undefined
      const takeProfitNum = takeProfit !== "" ? parseFloat(takeProfit) : undefined

      const result = await analyzeTradeAI(symbol, leverageNum, stopLossNum, takeProfitNum)

      if (!result || !result.symbol) {
        throw new Error("AI返回了无效数据")
      }

      setAnalysis(result)
      toast({
        title: "分析完成",
        description: `AI已完成 ${symbol} 的交易分析`,
      })
    } catch (error: any) {
      console.error("AI analysis error:", error)

      let errorMessage = "AI分析请求失败"
      if (error.message) {
        errorMessage = error.message
      } else if (error.name === "AbortError") {
        errorMessage = "请求超时，请稍后重试"
      }

      toast({
        title: "分析失败",
        description: errorMessage,
        variant: "destructive",
      })
      setAnalysis(null)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">AI 交易分析</h2>
        <p className="text-muted-foreground">使用AI分析交易机会并获取智能建议</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                交易参数
              </CardTitle>
              <CardDescription>设置交易分析参数</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symbol">交易对</Label>
                <Select value={symbol} onValueChange={setSymbol}>
                  <SelectTrigger id="symbol">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TOP_10_CRYPTOCURRENCIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leverage">杠杆倍数</Label>
                <Input
                  id="leverage"
                  type="number"
                  placeholder="10"
                  value={leverage}
                  onChange={(e) => setLeverage(e.target.value)}
                  min="1"
                  max="125"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stopLoss">止损 (可选)</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  placeholder="自动计算"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="takeProfit">止盈 (可选)</Label>
                <Input
                  id="takeProfit"
                  type="number"
                  placeholder="自动计算"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  step="0.01"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="trailingStop">移动止损 (%)</Label>
                <Input
                  id="trailingStop"
                  type="number"
                  placeholder="1.5"
                  value={trailingStop}
                  onChange={(e) => setTrailingStop(e.target.value)}
                  step="0.1"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/50 p-4">
                <div className="space-y-0.5">
                  <Label htmlFor="autoTrade" className="text-sm font-medium">
                    自动交易模式
                  </Label>
                  <p className="text-xs text-muted-foreground">启用AI自动执行交易</p>
                </div>
                <Switch id="autoTrade" checked={autoTradeMode} onCheckedChange={setAutoTradeMode} />
              </div>

              <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full" size="lg">
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    分析中...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    开始AI分析
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {analysis ? (
            <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-primary" />
                      AI 分析结果
                    </CardTitle>
                    <CardDescription>基于实时市场数据的智能分析</CardDescription>
                  </div>
                  <Badge
                    variant={analysis.direction === "LONG" ? "default" : "destructive"}
                    className="px-3 py-1 text-sm"
                  >
                    {analysis.direction === "LONG" ? (
                      <>
                        <TrendingUp className="mr-1 h-4 w-4" />
                        做多
                      </>
                    ) : (
                      <>
                        <TrendingDown className="mr-1 h-4 w-4" />
                        做空
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">交易对</Label>
                    <p className="text-2xl font-bold">{analysis.symbol}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">置信度</Label>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold">{(analysis.confidence * 100).toFixed(1)}%</div>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-green-500 transition-all"
                          style={{ width: `${analysis.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                    <Label className="text-xs text-muted-foreground">入场价格</Label>
                    <p className="text-xl font-semibold">${analysis.entry_price.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                    <Label className="text-xs text-muted-foreground">止损</Label>
                    <p className="text-xl font-semibold text-red-500">${analysis.stop_loss.toFixed(2)}</p>
                  </div>
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                    <Label className="text-xs text-muted-foreground">止盈</Label>
                    <p className="text-xl font-semibold text-green-500">${analysis.take_profit.toFixed(2)}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                  <Label className="text-xs text-muted-foreground">杠杆倍数</Label>
                  <p className="text-xl font-semibold">{analysis.leverage}x</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">AI 分析理由</Label>
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-4">
                    <p className="text-sm leading-relaxed text-foreground/90">{analysis.reasoning}</p>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  分析时间: {new Date(analysis.timestamp).toLocaleString("zh-CN")}
                </div>

                {autoTradeMode && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      自动交易模式已启用。AI将根据此分析自动执行模拟交易。请注意风险管理。
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-xl">
              <CardContent className="flex h-[600px] items-center justify-center">
                <div className="text-center">
                  <Brain className="mx-auto h-16 w-16 text-muted-foreground/30" />
                  <h3 className="mt-4 text-lg font-semibold">等待AI分析</h3>
                  <p className="mt-2 text-sm text-muted-foreground">设置参数后点击"开始AI分析"获取智能建议</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

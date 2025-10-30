"use client"

import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { Signal } from "@/lib/api/backend"
import { formatNumber, formatDate } from "@/lib/utils/format"
import { TrendingUp, TrendingDown } from "lucide-react"

type SignalsTableProps = {
  signals: Signal[]
  isLoading?: boolean
}

export function SignalsTable({ signals, isLoading }: SignalsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (!signals || signals.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">暂无信号数据</p>
          <p className="mt-1 text-xs text-muted-foreground">请刷新或稍后再试</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>币种</TableHead>
            <TableHead>方向</TableHead>
            <TableHead className="text-right">入场价</TableHead>
            <TableHead className="text-right">止损</TableHead>
            <TableHead className="text-right">止盈</TableHead>
            <TableHead className="text-right">杠杆</TableHead>
            <TableHead className="text-right">信心度</TableHead>
            <TableHead>理由</TableHead>
            <TableHead>时间</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signals.map((signal, index) => (
            <TableRow key={`${signal.symbol}-${index}`} className="hover:bg-muted/50">
              <TableCell className="font-medium">{signal.symbol}</TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell className="text-right font-mono text-sm">{formatNumber(signal.entry_price, 4)}</TableCell>
              <TableCell className="text-right font-mono text-sm">{formatNumber(signal.stop_loss, 4)}</TableCell>
              <TableCell className="text-right font-mono text-sm">{formatNumber(signal.take_profit, 4)}</TableCell>
              <TableCell className="text-right">{signal.leverage}x</TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    signal.confidence >= 0.8
                      ? "text-green-600 dark:text-green-400"
                      : signal.confidence >= 0.6
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-muted-foreground"
                  }
                >
                  {(signal.confidence * 100).toFixed(0)}%
                </span>
              </TableCell>
              <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{signal.reason}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDate(signal.timestamp)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

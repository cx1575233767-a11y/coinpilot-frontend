"use client"

import { useEffect, useRef } from "react"
import { createChart, type IChartApi, type ISeriesApi, ColorType } from "lightweight-charts"
import type { KlineData } from "@/lib/api/backend"
import { useTheme } from "next-themes"

type CandlestickChartProps = {
  data: KlineData[]
}

export function CandlestickChart({ data }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null)
  const { theme, resolvedTheme } = useTheme()

  useEffect(() => {
    if (!chartContainerRef.current || data.length === 0) return

    const isDark = resolvedTheme === "dark"

    if (!chartRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: { type: ColorType.Solid, color: "transparent" },
          textColor: isDark ? "#9ca3af" : "#374151",
        },
        grid: {
          vertLines: { color: isDark ? "#1f2937" : "#e5e7eb" },
          horzLines: { color: isDark ? "#1f2937" : "#e5e7eb" },
        },
        width: chartContainerRef.current.clientWidth,
        height: 500,
        timeScale: {
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: 1,
          vertLine: {
            color: isDark ? "#4b5563" : "#9ca3af",
            width: 1,
            style: 2,
          },
          horzLine: {
            color: isDark ? "#4b5563" : "#9ca3af",
            width: 1,
            style: 2,
          },
        },
      })

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: "#16a34a",
        downColor: "#dc2626",
        borderVisible: false,
        wickUpColor: "#16a34a",
        wickDownColor: "#dc2626",
      })

      chartRef.current = chart
      seriesRef.current = candlestickSeries

      const handleResize = () => {
        if (chartContainerRef.current && chartRef.current) {
          chartRef.current.applyOptions({
            width: chartContainerRef.current.clientWidth,
          })
        }
      }

      window.addEventListener("resize", handleResize)

      return () => {
        window.removeEventListener("resize", handleResize)
        if (chartRef.current) {
          chartRef.current.remove()
          chartRef.current = null
        }
      }
    }
  }, [resolvedTheme])

  useEffect(() => {
    if (chartRef.current && seriesRef.current && data.length > 0) {
      const formattedData = data.map((d) => ({
        time: d.time as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      }))

      seriesRef.current.setData(formattedData)
      chartRef.current.timeScale().fitContent()
    }
  }, [data])

  return <div ref={chartContainerRef} className="w-full" />
}

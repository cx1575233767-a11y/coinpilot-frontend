"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

type TestResult = {
  endpoint: string
  status: "success" | "error" | "loading"
  message: string
  data?: any
}

export default function TestBackendPage() {
  const [results, setResults] = useState<TestResult[]>([
    { endpoint: "/symbols", status: "loading", message: "Testing..." },
    { endpoint: "/klines?symbol=BTCUSDT&interval=1h&limit=10", status: "loading", message: "Testing..." },
    { endpoint: "/signals/ai?symbol=BTCUSDT&interval=1h", status: "loading", message: "Testing..." },
  ])

  const testEndpoint = async (endpoint: string, index: number) => {
    const API_BASE = "https://coinpilot-backend-caw5.onrender.com"
    
    try {
      const response = await fetch(`${API_BASE}${endpoint}`)
      const data = await response.json()
      
      if (response.ok) {
        setResults(prev => {
          const newResults = [...prev]
          newResults[index] = {
            endpoint,
            status: "success",
            message: `✅ Success (${response.status})`,
            data: JSON.stringify(data).substring(0, 200) + "..."
          }
          return newResults
        })
      } else {
        throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`)
      }
    } catch (error: any) {
      setResults(prev => {
        const newResults = [...prev]
        newResults[index] = {
          endpoint,
          status: "error",
          message: `❌ ${error.message}`,
        }
        return newResults
      })
    }
  }

  const runAllTests = () => {
    results.forEach((result, index) => {
      setResults(prev => {
        const newResults = [...prev]
        newResults[index] = { ...result, status: "loading", message: "Testing..." }
        return newResults
      })
      testEndpoint(result.endpoint, index)
    })
  }

  useEffect(() => {
    runAllTests()
  }, [])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">后端API连接测试</h1>
          <p className="text-muted-foreground mt-2">
            测试前端与后端的CORS配置和连接状态
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>后端服务器</CardTitle>
            <CardDescription>https://coinpilot-backend-caw5.onrender.com</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runAllTests} className="w-full">
              重新测试所有端点
            </Button>

            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index} className={
                  result.status === "success" ? "border-green-500/50 bg-green-500/5" :
                  result.status === "error" ? "border-red-500/50 bg-red-500/5" :
                  "border-yellow-500/50 bg-yellow-500/5"
                }>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {result.status === "success" && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {result.status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
                        {result.status === "loading" && <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <CardTitle className="text-sm font-mono">
                          {result.endpoint}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {result.message}
                        </CardDescription>
                        {result.data && (
                          <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono break-all">
                            {result.data}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CORS配置状态</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">前端 Next.js allowedDevOrigins 已配置</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span className="text-sm">前端 API headers 已配置</span>
            </div>
            <div className="flex items-center gap-2">
              {results.some(r => r.status === "success") ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">后端 CORS 配置正常</span>
                </>
              ) : results.some(r => r.status === "error" && r.message.includes("CORS")) ? (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm">后端需要添加CORS配置（查看 BACKEND_CORS_SETUP.md）</span>
                </>
              ) : (
                <>
                  <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
                  <span className="text-sm">正在测试后端连接...</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// lib/api/backend.ts
const RAW_BASE = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://coinpilot-backend-caw5.onrender.com";

// 统一保证带 /api 前缀
const API_BASE = RAW_BASE.endsWith("/api") ? RAW_BASE : `${RAW_BASE}/api`;

export const TOP_10_CRYPTOCURRENCIES = [
  "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "ADAUSDT",
  "XRPUSDT", "DOGEUSDT", "TONUSDT", "TRXUSDT", "DOTUSDT",
];

export type Signal = {
  symbol: string;
  direction: "LONG" | "SHORT";
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  leverage: number;
  confidence: number;
  reason: string;
  timestamp: string;
};

export type KlineData = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

// ---- Market endpoints (/api/market/*) ----
export async function fetchSymbols(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/market/symbols`);
  if (!res.ok) throw new Error("Failed to fetch symbols");
  return res.json();
}

export async function fetchKlineData(symbol: string, interval = "1h", limit = 300): Promise<KlineData[]> {
  const url = `${API_BASE}/market/klines?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(
    interval
  )}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch kline data");
  return res.json();
}

/**
 * 如果你的后端有 “/api/market/signals/ai” 就走它；
 * 没有的话，前端也可以直接复用 /api/ai/analyze。
 */
export async function fetchAISignal(symbol: string, interval = "1h"): Promise<Signal> {
  const tryMarket = await fetch(
    `${API_BASE}/market/signals/ai?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}`
  );
  if (tryMarket.ok) return tryMarket.json();

  // 兜底到 /api/ai/analyze
  const res = await fetch(`${API_BASE}/ai/analyze?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}`, {
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Failed to fetch AI signal: ${await res.text().catch(() => "Unknown error")}`);
  return res.json();
}

/**
 * 批量信号。后端常见是 /api/market/signals?interval=1h
 * 如果你有 /api/market/signals/ai/batch 也会优先尝试。
 */
export async function fetchBatchSignals(interval = "1h"): Promise<Signal[]> {
  const tryBatch = await fetch(`${API_BASE}/market/signals/ai/batch?interval=${encodeURIComponent(interval)}&save=false`);
  if (tryBatch.ok) return tryBatch.json();

  const res = await fetch(`${API_BASE}/market/signals?interval=${encodeURIComponent(interval)}`);
  if (!res.ok) throw new Error("Failed to fetch batch signals");
  return res.json();
}

// ---- AI endpoints (/api/ai/*) ----
export type AIAnalysis = {
  symbol: string;
  direction: "LONG" | "SHORT";
  entry_price: number;
  stop_loss: number;
  take_profit: number;
  leverage: number;
  confidence: number;
  reasoning: string;
  timestamp: string;
};

export async function analyzeTradeAI(
  symbol: string,
  leverage?: number,
  stopLoss?: number,
  takeProfit?: number,
  interval = "1h"
): Promise<AIAnalysis> {
  const params = new URLSearchParams({ symbol, interval });
  if (leverage !== undefined) params.append("leverage", String(leverage));
  if (stopLoss !== undefined) params.append("stop_loss", String(stopLoss));
  if (takeProfit !== undefined) params.append("take_profit", String(takeProfit));

  const res = await fetch(`${API_BASE}/ai/analyze?${params.toString()}`, {
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "Unknown error");
    throw new Error(`AI analysis failed: ${txt}`);
  }
  const data = await res.json();
  if (!data || !data.symbol) throw new Error("Invalid response from AI analysis");
  return data;
}

// ---- Optional (如果后端没有这些路由，就不要让前端崩溃) ----
export async function startScheduler(interval = "1h", everyMinutes = 5): Promise<any> {
  const res = await fetch(
    `${API_BASE}/market/scheduler/start?interval=${encodeURIComponent(interval)}&every_minutes=${everyMinutes}`,
    { method: "POST" }
  );
  if (res.status === 404) return { ok: false, message: "scheduler endpoint not available" };
  if (!res.ok) throw new Error("Failed to start scheduler");
  return res.json();
}

export async function stopScheduler(): Promise<any> {
  const res = await fetch(`${API_BASE}/market/scheduler/stop`, { method: "POST" });
  if (res.status === 404) return { ok: false, message: "scheduler endpoint not available" };
  if (!res.ok) throw new Error("Failed to stop scheduler");
  return res.json();
}

export async function sendTelegramTest(): Promise<any> {
  const res = await fetch(`${API_BASE}/market/notify/telegram_test`, { method: "POST" });
  if (res.status === 404) return { ok: false, message: "telegram notify endpoint not available" };
  if (!res.ok) throw new Error("Failed to send Telegram test");
  return res.json();
}

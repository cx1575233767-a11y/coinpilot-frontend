import crypto from "crypto"

if (!process.env.CRYPTOMUS_API_KEY || !process.env.CRYPTOMUS_MERCHANT_ID) {
  throw new Error("Missing required Cryptomus environment variables: CRYPTOMUS_API_KEY and CRYPTOMUS_MERCHANT_ID")
}

const CRYPTOMUS_API_KEY = process.env.CRYPTOMUS_API_KEY
const CRYPTOMUS_MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID
const CRYPTOMUS_API_BASE = "https://api.cryptomus.com/v1"
const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || "https://coinpilot-backend-caw5.onrender.com"

function generateSign(data: any): string {
  const jsonString = JSON.stringify(data)
  const base64Data = Buffer.from(jsonString).toString("base64")
  return crypto.createHash("md5").update(base64Data + CRYPTOMUS_API_KEY).digest("hex")
}

export type CreateInvoiceParams = {
  amount: string
  currency: string
  order_id: string
  url_return?: string
  url_success?: string
  lifetime?: number
}

export type InvoiceResponse = {
  uuid: string
  order_id: string
  amount: string
  currency: string
  url: string
  expired_at: number
  status: string
}

export async function createPaymentInvoice(params: CreateInvoiceParams, callbackUrl: string): Promise<InvoiceResponse> {
  const requestData = {
    amount: params.amount,
    currency: params.currency,
    order_id: params.order_id,
    url_return: params.url_return,
    url_success: params.url_success,
    url_callback: callbackUrl,
    lifetime: params.lifetime || 3600,
  }

  const sign = generateSign(requestData)

  const response = await fetch(`${CRYPTOMUS_API_BASE}/payment`, {
    method: "POST",
    headers: {
      merchant: CRYPTOMUS_MERCHANT_ID,
      sign: sign,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Cryptomus API error: ${error.message || "Unknown error"}`)
  }

  const data = await response.json()
  return data.result
}

export async function verifyWebhookSignature(receivedSign: string, webhookData: any): Promise<boolean> {
  if (!receivedSign || !webhookData) {
    return false
  }

  const dataToVerify = { ...webhookData }
  delete dataToVerify.sign

  const jsonString = JSON.stringify(dataToVerify)
  const base64Data = Buffer.from(jsonString).toString("base64")
  const expectedSign = crypto.createHash("md5").update(base64Data + CRYPTOMUS_API_KEY).digest("hex")

  return crypto.timingSafeEqual(Buffer.from(receivedSign), Buffer.from(expectedSign))
}

export type WebhookData = {
  uuid: string
  order_id: string
  amount: string
  currency: string
  status: "paid" | "cancel" | "wrong_amount" | "process" | "confirm_check"
  payment_amount: string
  payer_amount: string
  is_final: boolean
  created_at?: string
  sign?: string
}

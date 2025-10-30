import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { createPaymentInvoice } from "@/lib/crypto/cryptomus"

const MONTHLY_PRICE_USDT = "29.99"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const origin = request.headers.get("origin") || "http://localhost:5000"
    const orderId = `coinpilot_${user.id}_${Date.now()}`

    const callbackUrl = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/api/cryptomus/webhook`
      : `${origin}/api/cryptomus/webhook`

    const invoice = await createPaymentInvoice(
      {
        amount: MONTHLY_PRICE_USDT,
        currency: "USDT",
        order_id: orderId,
        url_return: `${origin}/app/account`,
        url_success: `${origin}/app/account?success=true`,
        lifetime: 3600,
      },
      callbackUrl
    )

    await supabase.from("payment_orders").insert({
      id: orderId,
      user_id: user.id,
      amount: MONTHLY_PRICE_USDT,
      currency: "USDT",
      status: "pending",
      invoice_uuid: invoice.uuid,
      payment_url: invoice.url,
      pro_granted_until: null,
      created_at: new Date().toISOString(),
      expires_at: new Date(invoice.expired_at * 1000).toISOString(),
    })

    return NextResponse.json({ url: invoice.url })
  } catch (error: any) {
    console.error("Cryptomus checkout error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

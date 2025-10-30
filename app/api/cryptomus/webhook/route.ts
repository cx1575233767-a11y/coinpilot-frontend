import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { verifyWebhookSignature, type WebhookData } from "@/lib/crypto/cryptomus"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const headersList = await headers()
    const receivedSign = headersList.get("sign")

    if (!receivedSign) {
      console.error("Webhook missing signature")
      return NextResponse.json({ error: "Missing signature" }, { status: 400 })
    }

    const isValid = await verifyWebhookSignature(receivedSign, body)
    if (!isValid) {
      console.error("Invalid webhook signature", { order_id: body.order_id })
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 })
    }

    const data: WebhookData = body
    const supabase = await getSupabaseServerClient()

    const { data: cleaned, error: cleanupError } = await supabase.rpc("cleanup_expired_webhooks")
    if (cleanupError) {
      console.error("Failed to cleanup expired webhooks", { error: cleanupError })
    } else if (cleaned && cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired webhook records`)
    }

    const webhookId = `${data.order_id}_${data.uuid}_${data.status}`
    const webhookIdHash = Buffer.from(webhookId).toString("base64")

    const { data: existingWebhook, error: lookupError } = await supabase
      .from("processed_webhooks")
      .select("webhook_id")
      .eq("webhook_id", webhookIdHash)
      .maybeSingle()

    if (lookupError) {
      console.error("Failed to check webhook duplicates", { error: lookupError, webhookId: webhookIdHash })
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (existingWebhook) {
      console.warn("Duplicate webhook ignored", { webhookId: webhookIdHash })
      return NextResponse.json({ success: true, message: "Already processed" })
    }

    const { data: existingOrder, error: orderLookupError} = await supabase
      .from("payment_orders")
      .select("user_id, status, amount, currency, pro_granted_until")
      .eq("id", data.order_id)
      .single()

    if (orderLookupError || !existingOrder) {
      console.error("Order not found:", data.order_id, orderLookupError)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const receivedAmount = String(data.amount)
    const expectedAmount = String(existingOrder.amount)

    if (receivedAmount !== expectedAmount) {
      console.error("Amount mismatch", {
        expected: expectedAmount,
        received: receivedAmount,
        order: data.order_id,
      })
      return NextResponse.json({ error: "Amount mismatch" }, { status: 400 })
    }

    const receivedCurrency = String(data.currency).toUpperCase()
    const expectedCurrency = String(existingOrder.currency).toUpperCase()

    if (receivedCurrency !== expectedCurrency) {
      console.error("Currency mismatch", {
        expected: expectedCurrency,
        received: receivedCurrency,
        order: data.order_id,
      })
      return NextResponse.json({ error: "Currency mismatch" }, { status: 400 })
    }

    const { error: orderUpdateError } = await supabase
      .from("payment_orders")
      .update({
        status: data.status,
        payment_amount: data.payment_amount,
        payer_amount: data.payer_amount,
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.order_id)

    if (orderUpdateError) {
      console.error("Failed to update payment order", {
        error: orderUpdateError,
        order_id: data.order_id,
      })
      return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
    }

    if ((data.status === "paid" || data.status === "confirm_check") && data.is_final) {
      const { data: existingProfile, error: profileLookupError } = await supabase
        .from("profiles")
        .select("plan, pro_until")
        .eq("id", existingOrder.user_id)
        .single()

      if (profileLookupError) {
        console.error("Failed to fetch user profile", {
          error: profileLookupError,
          user_id: existingOrder.user_id,
        })
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
      }

      const now = new Date()
      const existingExpiry = existingProfile?.pro_until ? new Date(existingProfile.pro_until) : null
      const baseDate = existingExpiry && existingExpiry > now ? existingExpiry : now

      const newProUntil = new Date(baseDate)
      newProUntil.setMonth(newProUntil.getMonth() + 1)
      const calculatedProUntil = newProUntil.toISOString()

      const { data: atomicResult, error: atomicUpdateError } = await supabase.rpc(
        "set_pro_granted_until_if_null",
        {
          p_order_id: data.order_id,
          p_new_pro_until: calculatedProUntil,
        }
      )

      if (atomicUpdateError || !atomicResult) {
        console.error("Failed to atomically set pro_granted_until", {
          error: atomicUpdateError,
          order_id: data.order_id,
        })
        return NextResponse.json({ error: "Failed to record upgrade date" }, { status: 500 })
      }

      const targetProUntil = atomicResult

      console.log(
        `User ${existingOrder.user_id} Pro will be extended to ${targetProUntil} (calculated: ${calculatedProUntil}, was: ${existingExpiry?.toISOString() || "free"})`
      )

      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          plan: "pro",
          pro_until: targetProUntil,
        })
        .eq("id", existingOrder.user_id)

      if (profileUpdateError) {
        console.error("Failed to upgrade user profile", {
          error: profileUpdateError,
          user_id: existingOrder.user_id,
        })
        return NextResponse.json({ error: "Failed to upgrade user" }, { status: 500 })
      }

      console.log(`User ${existingOrder.user_id} Pro extended to ${targetProUntil}`)
    }

    const { error: dedupeInsertError } = await supabase
      .from("processed_webhooks")
      .insert({
        webhook_id: webhookIdHash,
        order_id: data.order_id,
        status: data.status,
        processed_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 300000).toISOString(),
      })

    if (dedupeInsertError) {
      if (dedupeInsertError.code === "23505") {
        console.warn("Concurrent duplicate detected after processing", { webhookId: webhookIdHash })
        return NextResponse.json({ success: true, message: "Already processed" })
      }
      console.error("CRITICAL: Payment processed but dedupe record failed - retry will re-process", {
        error: dedupeInsertError,
        webhookId: webhookIdHash,
      })
      return NextResponse.json({ error: "Failed to record webhook" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Cryptomus webhook error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
